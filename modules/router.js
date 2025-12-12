import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js'; // Importe o novo arquivo
import { renderEntradas } from './entradas.js';
import { renderPerfil } from './perfil.js';

const routes = {
  'dashboard': renderDashboard,
  'saidas': renderSaidas, // Certifique-se que esta linha existe
  'entradas': renderEntradas,
  'perfil': renderPerfil,
  'estoque': () => document.getElementById('app-content').innerHTML = '<h2 class="p-10 text-center text-slate-400">Estoque em breve...</h2>'
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
}
