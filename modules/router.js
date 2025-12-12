
// modules/router.js
import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';

const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'estoque': () => placeholder('Controle de Estoque'),
    'entradas': () => placeholder('Nova Entrada')
};

function placeholder(title) {
    document.getElementById('app-content').innerHTML = `
        <div class="flex flex-col items-center justify-center h-96 text-slate-400">
            <i class="fa-solid fa-code text-5xl mb-4"></i>
            <h2 class="text-xl font-bold">${title}</h2>
            <p>Módulo em desenvolvimento</p>
        </div>
    `;
}

export function navigateTo(route) {
    // 1. Atualiza Menu (UX)
    document.querySelectorAll('aside nav button').forEach(btn => {
        // Estilo Inativo
        btn.className = 'w-full text-left px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium transition flex items-center gap-3 rounded-lg';
        
        // Estilo Ativo
        if (btn.id === `nav-${route}`) {
            btn.className = 'w-full text-left px-4 py-3 bg-brand-600 text-white font-bold shadow-md shadow-brand-500/30 transition flex items-center gap-3 rounded-lg';
        }
    });

    // 2. Limpa e Renderiza
    const container = document.getElementById('app-content');
    // Pequeno fade-out effect poderia ser adicionado aqui
    container.innerHTML = ''; 
    
    const renderFn = routes[route];
    if (renderFn) renderFn();
    else renderDashboard();
}

export function initApp() {
    navigateTo('dashboard');
}
