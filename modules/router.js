import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
import { renderPerfil } from './perfil.js';
// Importe renderEntradas se você já tiver criado, senão usa placeholder

const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'perfil': renderPerfil,
    'estoque': () => placeholder('Estoque Geral'),
    'entradas': () => placeholder('Nova Entrada de Item'), // Substitua por renderEntradas quando criar
};

function placeholder(title) {
    document.getElementById('app-content').innerHTML = `
        <div class="flex flex-col items-center justify-center h-96 text-slate-400">
            <i class="fa-solid fa-person-digging text-5xl mb-4 text-slate-200"></i>
            <h2 class="text-2xl font-display font-bold text-slate-600">${title}</h2>
            <p>Módulo em desenvolvimento.</p>
        </div>
    `;
}

export function navigateTo(route) {
    // 1. Atualiza Visual do Menu
    document.querySelectorAll('.nav-btn').forEach(btn => {
        // Estilo Inativo (Padrão)
        btn.className = 'nav-btn w-full text-left px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium transition flex items-center gap-3 rounded-lg';
        
        // Estilo Ativo
        if (btn.id === `nav-${route}`) {
            btn.className = 'nav-btn w-full text-left px-4 py-3 bg-brand-50 text-brand-600 font-bold border border-brand-100 transition flex items-center gap-3 rounded-lg';
        }
    });

    // 2. Renderiza Conteúdo
    const container = document.getElementById('app-content');
    container.innerHTML = ''; // Limpa tela anterior
    
    const renderFn = routes[route];
    if (renderFn) renderFn();
    else renderDashboard();
}

export function initApp() {
    navigateTo('dashboard');
}
