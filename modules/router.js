// modules/router.js
import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
import { renderEntradas } from './entradas.js'; // Importando o arquivo que criamos no passo 2
import { renderPerfil } from './perfil.js';     // Importando o arquivo corrigido no passo 1

const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'entradas': renderEntradas,
    'perfil': renderPerfil,
    'estoque': () => document.getElementById('app-content').innerHTML = '<h2 class="p-10 text-center text-slate-400">Estoque em breve...</h2>'
};

export function navigateTo(route) {
    console.log("Router: indo para", route); // Debug

    // 1. Atualiza Menu (Visual)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-slate-100', 'text-brand-600', 'font-bold');
        btn.classList.add('text-slate-600');
        
        if (btn.id === `nav-${route}`) {
            btn.classList.remove('text-slate-600');
            btn.classList.add('bg-slate-100', 'text-brand-600', 'font-bold');
        }
    });

    // 2. Renderiza a Tela
    const container = document.getElementById('app-content');
    container.innerHTML = ''; // Limpa
    
    if (routes[route]) {
        routes[route]();
    } else {
        renderDashboard();
    }
}

export function initApp() {
    navigateTo('dashboard');
}import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
import { renderEntradas } from './entradas.js';
import { renderPerfil } from './perfil.js';
import { setupNotifications } from './notifications.js'; // ADICIONAR ESTA LINHA

const routes = {
  'dashboard': renderDashboard,
  'saidas': renderSaidas,
  'entradas': renderEntradas,
  'perfil': renderPerfil,
  'estoque': () => document.getElementById('app-content').innerHTML = '<h2 class="p-10 text-center text-slate-400">Estoque em breve...</h2>',
  'historico': () => document.getElementById('app-content').innerHTML = '<h2 class="p-10 text-center text-slate-400">Histórico completo em breve...</h2>'
};

export function navigateTo(route) {
  console.log("Router: indo para", route);
  
  // Atualizar menu
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-slate-100', 'text-brand-600', 'font-bold');
    btn.classList.add('text-slate-600');
    
    if (btn.id === `nav-${route}`) {
      btn.classList.remove('text-slate-600');
      btn.classList.add('bg-slate-100', 'text-brand-600', 'font-bold');
    }
  });
  
  // Renderizar tela
  const container = document.getElementById('app-content');
  container.innerHTML = '';
  
  if (routes[route]) {
    routes[route]();
  } else {
    renderDashboard();
  }
}

export function initApp() {
  navigateTo('dashboard');
  setupNotifications(); // ADICIONAR ESTA LINHA
}
