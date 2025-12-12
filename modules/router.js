import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
import { renderEntradas } from './entradas.js';
import { renderPerfil } from './perfil.js';

const routes = {
  'dashboard': renderDashboard,
  'saidas': renderSaidas,
  'entradas': renderEntradas,
  'perfil': renderPerfil,
  'estoque': () => document.getElementById('app-content').innerHTML = '<div class="p-10"><h2 class="text-2xl font-bold text-slate-800">Estoque</h2><p class="text-slate-500">Em breve...</p></div>',
  'historico': () => document.getElementById('app-content').innerHTML = '<div class="p-10"><h2 class="text-2xl font-bold text-slate-800">Histórico Completo</h2><p class="text-slate-500">Em breve...</p></div>'
};

export function navigateTo(route) {
  console.log("Navegando para:", route);
  
  // Atualizar menu ativo
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
}
