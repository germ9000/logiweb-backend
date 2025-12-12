// Função para navegar entre as páginas
export function navigateTo(page) {
    // Atualizar a classe ativa nos botões da sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-brand-50', 'text-brand-600', 'font-bold');
        btn.classList.add('text-slate-600');
    });
    
    const activeBtn = document.getElementById(`nav-${page}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-brand-50', 'text-brand-600', 'font-bold');
        activeBtn.classList.remove('text-slate-600');
    }
    
    // Carregar o módulo correspondente
    import(`./${page}.js`).then(module => {
        if (module.render) {
            module.render();
        }
    }).catch(error => {
        console.error(`Erro ao carregar o módulo ${page}:`, error);
        document.getElementById('app-content').innerHTML = `
            <div class="max-w-4xl mx-auto">
                <h2 class="text-2xl font-bold text-slate-900">Página não encontrada</h2>
                <p class="text-slate-500">O módulo ${page} não pôde ser carregado.</p>
            </div>
        `;
    });
}

// Inicializar a aplicação
export function initApp() {
    // Verificar autenticação
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    if (!user.nome) {
        window.location.href = 'login.html';
        return;
    }
    
    // Navegar para a página inicial (dashboard)
    navigateTo('dashboard');
    
    // Configurar notificações
    document.getElementById('notifications-btn').addEventListener('click', toggleNotif);
}
