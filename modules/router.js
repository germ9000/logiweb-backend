// modules/router.js
import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
import { renderEntradas } from './entradas.js'; // Importamos o novo arquivo
import { renderPerfil } from './perfil.js';     // Importamos o perfil corrigido

const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'entradas': renderEntradas, // Rota corrigida
    'perfil': renderPerfil,     // Rota corrigida
    'estoque': () => placeholder('Estoque (Em Breve)')
};

function placeholder(title) {
    document.getElementById('app-content').innerHTML = `
        <div class="flex flex-col items-center justify-center h-96 text-slate-400 animate-fade-in">
            <i class="fa-solid fa-person-digging text-5xl mb-4 text-slate-200"></i>
            <h2 class="text-2xl font-bold text-slate-600">${title}</h2>
            <p>Módulo em desenvolvimento.</p>
        </div>
    `;
}

export function navigateTo(route) {
    // 1. Atualiza Visual do Menu (Ativa/Desativa)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        // Reset estilo padrão
        btn.className = 'nav-btn w-full text-left px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium transition flex items-center gap-3 rounded-lg';
        
        // Aplica estilo ativo se for o botão clicado
        if (btn.id === `nav-${route}`) {
            btn.className = 'nav-btn w-full text-left px-4 py-3 bg-brand-50 text-brand-600 font-bold border border-brand-100 transition flex items-center gap-3 rounded-lg';
        }
    });

    // 2. Renderiza Conteúdo
    const container = document.getElementById('app-content');
    container.innerHTML = ''; 
    
    const renderFn = routes[route];
    if (renderFn) renderFn();
    else renderDashboard();
}

export function initApp() {
    navigateTo('dashboard');
}
