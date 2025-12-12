import { apiFetch } from './utils.js';

let notifications = [];

export async function loadNotifications() {
  try {
    const movements = await apiFetch('/api/movements?limit=10');
    
    notifications = movements.map(mov => ({
      id: mov.id,
      tipo: mov.tipo,
      mensagem: `${mov.tipo === 'entrada' ? '📥 Entrada' : '📤 Saída'} de ${mov.quantidade}x ${mov.nomeItem}`,
      hora: new Date(mov.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      data: new Date(mov.data).toLocaleDateString('pt-BR'),
      lida: false
    }));
    
    atualizarUI();
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  }
}

function atualizarUI() {
  const naoLidas = notifications.filter(n => !n.lida).length;
  const badge = document.getElementById('notification-badge');
  const lista = document.getElementById('notifications-list');
  
  // Atualizar badge
  if (badge) {
    if (naoLidas > 0) {
      badge.textContent = naoLidas > 9 ? '9+' : naoLidas;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
  
  // Atualizar lista
  if (lista) {
    if (notifications.length === 0) {
      lista.innerHTML = `
        <div class="p-6 text-center text-slate-400">
          <i class="fa-solid fa-bell-slash text-3xl mb-3"></i>
          <p>Nenhuma movimentação recente</p>
        </div>
      `;
    } else {
      lista.innerHTML = notifications.map(notif => `
        <div class="notificacao p-4 border-b border-slate-50 hover:bg-slate-50 transition ${notif.lida ? 'opacity-70' : ''}" data-id="${notif.id}">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full ${notif.tipo === 'entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} flex items-center justify-center">
              <i class="fa-solid ${notif.tipo === 'entrada' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-800">${notif.mensagem}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-slate-400">
                  <i class="fa-solid fa-clock mr-1"></i>${notif.hora}
                </span>
                <span class="text-xs text-slate-400">•</span>
                <span class="text-xs text-slate-400">${notif.data}</span>
              </div>
            </div>
            ${!notif.lida ? '<span class="w-2 h-2 bg-brand-500 rounded-full mt-2"></span>' : ''}
          </div>
        </div>
      `).join('');
    }
  }
}

export function setupNotifications() {
  const btn = document.getElementById('notifications-btn');
  const dropdown = document.getElementById('notifications-dropdown');
  
  if (!btn || !dropdown) {
    console.warn('Elementos de notificação não encontrados no HTML');
    return;
  }
  
  // Alternar dropdown
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
      loadNotifications();
    }
  });
  
  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
  
  // Marcar como lida ao clicar
  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('.notificacao');
    if (item) {
      const id = item.getAttribute('data-id');
      const notif = notifications.find(n => n.id === id);
      if (notif) {
        notif.lida = true;
        atualizarUI();
      }
    }
  });
  
  // Marcar todas como lidas
  const btnMarcarTodas = document.getElementById('mark-all-read');
  if (btnMarcarTodas) {
    btnMarcarTodas.addEventListener('click', () => {
      notifications.forEach(n => n.lida = true);
      atualizarUI();
    });
  }
  
  // Carregar inicialmente e a cada 30 segundos
  loadNotifications();
  setInterval(loadNotifications, 30000);
}
