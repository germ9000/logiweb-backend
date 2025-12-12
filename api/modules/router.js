import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
// Importe outras se tiver (entradas, estoque)

const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'estoque': () => document.getElementById('app-content').innerHTML = '<h2 class="p-6">Estoque</h2>', 
    'entradas': () => document.getElementById('app-content').innerHTML = '<h2 class="p-6">Entradas</h2>',
};

export function navigateTo(route) {
    // 1. Atualiza Visual do Menu (Remove ativo de todos, adiciona no atual)
    document.querySelectorAll('aside nav button').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-brand-600', 'border-r-4', 'border-brand-600');
        // Reseta para padrão
        btn.classList.add('text-slate-600', 'hover:bg-slate-50');
    });
    
    const activeBtn = document.getElementById('nav-' + route);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-50');
        activeBtn.classList.add('bg-blue-50', 'text-brand-600', 'border-r-4', 'border-brand-600');
    }

    // 2. Executa a função do módulo
    const renderFn = routes[route];
    if (renderFn) renderFn();
}

// Inicializa
export function initApp() {
    navigateTo('dashboard');
}
