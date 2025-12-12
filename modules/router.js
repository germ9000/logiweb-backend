import { renderDashboard } from './dashboard.js';
import { renderSaidas } from './saidas.js';
import { renderEntradas } from './entradas.js';
import { renderPerfil } from './perfil.js';
import { renderEstoque } from './estoque.js';
import { renderHistoricoAcesso } from './historico-acesso.js';
import { renderCategorias } from './categorias.js'; // NOVO

const routes = {
    'dashboard': renderDashboard,
    'saidas': renderSaidas,
    'entradas': renderEntradas,
    'perfil': renderPerfil,
    'estoque': renderEstoque,
    'historico-acesso': renderHistoricoAcesso,
    'categorias': renderCategorias // NOVO
};

export function navigateTo(route) {
    console.log("Navegando para:", route);
    
    // Verificar se está logado
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    if (!user.nome && route !== 'login') {
        window.location.href = 'login.html';
        return;
    }
    
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
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    if (!user.nome) {
        window.location.href = 'login.html';
        return;
    }
    
    navigateTo('dashboard');
    loadUserInfo();
}
