// modules/router.js
import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
import { renderEntradas } from './entradas.js';
import { renderPerfil } from './perfil.js';

// Mapeamento EXATO (Rota -> Função)
const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'entradas': renderEntradas,
    'perfil': renderPerfil, // Verifica se isso está apontando para renderPerfil mesmo
    'estoque': () => placeholder('Estoque')
};

function placeholder(title) {
    document.getElementById('app-content').innerHTML = `<h2 class="p-10 text-center text-slate-400">${title} em breve...</h2>`;
}

export function navigateTo(route) {
    console.log("Navegando para:", route); // Debug no console

    // 1. Atualiza Menu (UX)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        // Reset (Texto cinza, fundo transparente)
        btn.className = 'nav-btn w-full text-left px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium transition flex items-center gap-3 rounded-lg';
        
        // Ativo (Texto azul, fundo azul claro)
        if (btn.id === `nav-${route}`) {
            btn.className = 'nav-btn w-full text-left px-4 py-3 bg-brand-50 text-brand-600 font-bold border border-brand-100 transition flex items-center gap-3 rounded-lg';
        }
    });

    // 2. Renderiza Conteúdo
    const container = document.getElementById('app-content');
    container.innerHTML = ''; // Limpa tela anterior
    
    // Verifica se a rota existe
    const renderFn = routes[route];
    if (renderFn) {
        renderFn();
    } else {
        console.error("Rota não encontrada:", route);
        renderDashboard(); // Fallback para home
    }
}

export function initApp() {
    navigateTo('dashboard');
}
