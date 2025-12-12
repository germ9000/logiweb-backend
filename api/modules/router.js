import { state } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';

const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'estoque': () => document.getElementById('app-content').innerHTML = '<h2 class="p-6">Estoque em construção...</h2>',
    'entradas': () => document.getElementById('app-content').innerHTML = '<h2 class="p-6">Entradas em construção...</h2>',
};

export function navigateTo(route) {
    if (!state.user) return window.location.href = '/login.html'; // Simples proteção

    // 1. Atualiza Menu
    document.querySelectorAll('aside nav button').forEach(btn => 
        btn.className = `w-full text-left px-4 py-3 text-slate-600 hover:bg-slate-50 font-medium transition flex gap-3 ${btn.id === 'nav-'+route ? 'bg-blue-50 text-brand-600 border-r-4 border-brand-600' : ''}`
    );

    // 2. Renderiza Tela
    const app = document.getElementById('app-content');
    if (routes[route]) routes[route]();
    else renderDashboard();
}

export function initApp() { navigateTo('dashboard'); }
