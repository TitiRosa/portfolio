// ========================================
// CONFIGURAÇÃO INICIAL
// ========================================

// ⚙️ O username do GitHub é definido no HTML
// Certifique-se de que GITHUB_USERNAME está definido antes de carregar este script

// ========================================
// MENU MOBILE
// ========================================

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

// Toggle do menu mobile
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
});

// Fechar menu ao clicar em um link
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
    });
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
    }
});

// ========================================
// SCROLL SUAVE PARA ÂNCORAS
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignora links vazios (#)
        if (href === '#') {
            e.preventDefault();
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// INTEGRAÇÃO COM GITHUB API
// ========================================

/**
 * Busca dados do usuário do GitHub
 */
async function fetchGitHubUser() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        
        if (!response.ok) {
            throw new Error('Usuário não encontrado');
        }
        
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
    }
}

/**
 * Busca repositórios do usuário do GitHub
 */
async function fetchGitHubRepos() {
    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
        );
        
        if (!response.ok) {
            throw new Error('Erro ao buscar repositórios');
        }
        
        const repos = await response.json();
        
        // Filtrar repositórios públicos e ordenar por data de atualização
        const publicRepos = repos
            .filter(repo => !repo.fork && !repo.private)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 8); // Limitar a 8 repositórios
        
        return publicRepos;
    } catch (error) {
        console.error('Erro ao buscar repositórios:', error);
        return null;
    }
}

/**
 * Atualiza o avatar do usuário
 */
function updateAvatar(avatarUrl) {
    const avatarImg = document.getElementById('github-avatar');
    
    if (avatarImg && avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.style.opacity = '0';
        
        avatarImg.onload = () => {
            avatarImg.style.transition = 'opacity 0.5s ease';
            avatarImg.style.opacity = '1';
        };
    }
}

/**
 * Cria um card de projeto
 */
function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const language = repo.language || 'Code';
    const description = repo.description || 'Sem descrição disponível.';
    
    card.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${repo.name}</h3>
        </div>
        <span class="project-language">${language}</span>
        <p class="project-description">${description}</p>
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
            Ver repositório
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
        </a>
    `;
    
    return card;
}

/**
 * Renderiza os projetos na página
 */
function renderProjects(repos) {
    const projectsGrid = document.getElementById('projects-grid');
    
    if (!projectsGrid) return;
    
    // Limpar conteúdo anterior
    projectsGrid.innerHTML = '';
    
    if (!repos || repos.length === 0) {
        projectsGrid.innerHTML = '<p class="error">Nenhum repositório encontrado.</p>';
        return;
    }
    
    // Criar e adicionar cards de projeto
    repos.forEach(repo => {
        const card = createProjectCard(repo);
        projectsGrid.appendChild(card);
    });
}

/**
 * Inicializa a integração com o GitHub
 */
async function initGitHub() {
    console.log('Buscando dados do GitHub para:', GITHUB_USERNAME);
    
    // Buscar dados do usuário (avatar)
    const userData = await fetchGitHubUser();
    if (userData && userData.avatar_url) {
        updateAvatar(userData.avatar_url);
    } else {
        // Usar imagem padrão se não conseguir buscar
        const avatarImg = document.getElementById('github-avatar');
        if (avatarImg) {
            avatarImg.src = 'https://via.placeholder.com/280?text=Foto';
            avatarImg.alt = 'Avatar padrão';
        }
    }
    
    // Buscar repositórios
    const repos = await fetchGitHubRepos();
    if (repos) {
        renderProjects(repos);
    } else {
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = '<p class="error">Erro ao carregar projetos. Verifique o username do GitHub.</p>';
        }
    }
}

// ========================================
// ANIMAÇÕES NO SCROLL
// ========================================

/**
 * Observador de interseção para animações
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Adicionar animação de fade-in aos elementos
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.section');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// ========================================
// EFEITO DE SOMBRA NO HEADER AO ROLAR
// ========================================

function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }
    });
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Aguardar o carregamento completo da página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o username do GitHub está definido
    if (typeof GITHUB_USERNAME === 'undefined' || GITHUB_USERNAME === 'SEU_USUARIO_GITHUB') {
        console.warn('⚠️ ATENÇÃO: Configure o username do GitHub no arquivo HTML!');
        console.warn('Procure por "SEU_USUARIO_GITHUB" e substitua pelo seu username real.');
        
        // Mostrar mensagem no avatar
        const avatarImg = document.getElementById('github-avatar');
        if (avatarImg) {
            avatarImg.src = 'https://via.placeholder.com/280?text=Configure+o+GitHub';
        }
        
        // Mostrar mensagem nos projetos
        const projectsGrid = document.getElementById('projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = '<p class="error">Configure o username do GitHub no arquivo HTML para exibir os projetos.</p>';
        }
    } else {
        // Inicializar integração com GitHub
        initGitHub();
    }
    
    // Inicializar animações de scroll
    initScrollAnimations();
    
    // Inicializar efeito do header
    initHeaderScroll();
    
    console.log('✅ Portfolio carregado com sucesso!');
});

// ========================================
// TRATAMENTO DE ERROS GLOBAL
// ========================================

window.addEventListener('error', (e) => {
    console.error('Erro na aplicação:', e.message);
});

// ========================================
// UTILITÁRIOS
// ========================================

/**
 * Formata a data para o formato brasileiro
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Trunca texto com reticências
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}
