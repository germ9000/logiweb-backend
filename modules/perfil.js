import { apiFetch, showToast } from './utils.js';
export async function render() {
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-7xl mx-auto space-y-6 pb-10">
            <div>
                <nav class="text-sm text-slate-400 mb-1">Sistema / Perfil</nav>
                <h2 class="text-2xl font-bold text-slate-900">Meu Perfil</h2>
                <p class="text-slate-500">Gerencie suas informações de usuário.</p>
            </div>
            
            <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div class="max-w-md mx-auto">
                    <div class="text-center mb-8">
                        <div class="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                            ${user.nome ? user.nome.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <h3 class="text-xl font-bold text-slate-800">${user.nome || 'Usuário'}</h3>
                        <p class="text-slate-500">${user.email || 'Não informado'}</p>
                        <span class="inline-block mt-2 px-3 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'} text-sm">
                            ${user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Nome completo</label>
                            <input type="text" value="${user.nome || ''}" 
                                   class="w-full border-slate-300 rounded-lg p-3 bg-slate-50" readonly>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <input type="email" value="${user.email || ''}" 
                                   class="w-full border-slate-300 rounded-lg p-3 bg-slate-50" readonly>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Tipo de usuário</label>
                            <input type="text" value="${user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}" 
                                   class="w-full border-slate-300 rounded-lg p-3 bg-slate-50" readonly>
                        </div>
                    </div>
                    
                    <div class="mt-8 pt-6 border-t border-slate-200">
                        <button onclick="logout()" 
                                class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg">
                            <i class="fa-solid fa-right-from-bracket mr-2"></i> Sair da Conta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Função de logout (adicionar ao escopo global)
window.logout = async function() {
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    
    try {
        await fetch('/api/log-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                nome: user.nome,
                role: user.role,
                action: 'logout'
            })
        });
    } catch (error) {
        console.log('Erro ao registrar logout:', error);
    }
    
    localStorage.removeItem('logiUser');
    localStorage.removeItem('logiToken');
    window.location.href = 'login.html';
};
export async function renderPerfil() {
  const container = document.getElementById('app-content');
  const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
  const isAdmin = user.role === 'admin';

  container.innerHTML = `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Gestão de Perfis</h2>
          <p class="text-slate-500">Gerencie usuários do sistema${isAdmin ? ' (Administrador)' : ' (Visualização)'}.</p>
        </div>
        
        ${isAdmin ? `
          <button id="btn-adicionar-usuario" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
            <i class="fa-solid fa-user-plus mr-2"></i> Novo Usuário
          </button>
        ` : ''}
      </div>

      <!-- Formulário para adicionar usuário (visível apenas para admin) -->
      ${isAdmin ? `
        <div id="form-adicionar-usuario" class="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="text-lg font-bold text-slate-800 mb-4">Adicionar Novo Usuário</h3>
          <form id="form-novo-usuario" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input type="text" id="inputNome" class="w-full border-slate-300 rounded-lg p-2.5" required placeholder="João Silva">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                <input type="email" id="inputEmail" class="w-full border-slate-300 rounded-lg p-2.5" required placeholder="joao@empresa.com">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Senha *</label>
                <input type="password" id="inputSenha" class="w-full border-slate-300 rounded-lg p-2.5" required placeholder="Mínimo 6 caracteres">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Permissão</label>
                <select id="inputRole" class="w-full border-slate-300 rounded-lg p-2.5 bg-white">
                  <option value="comum">Usuário Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" id="btn-cancelar" class="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition">
                Cancelar
              </button>
              <button type="submit" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center">
                <i class="fa-solid fa-save mr-2"></i> Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      ` : ''}

      <!-- Tabela de usuários -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
              <tr>
                <th class="p-4">Nome</th>
                <th class="p-4">Email</th>
                <th class="p-4">Permissão</th>
                <th class="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody id="tabela-usuarios">
              <tr><td colspan="4" class="p-8 text-center text-slate-400">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i>Carregando usuários...
              </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Carregar usuários
  await carregarUsuarios();

  // Configurar eventos se for admin
  if (isAdmin) {
    // Botão para mostrar formulário
    document.getElementById('btn-adicionar-usuario').addEventListener('click', () => {
      const form = document.getElementById('form-adicionar-usuario');
      form.classList.toggle('hidden');
    });

    // Cancelar formulário
    document.getElementById('btn-cancelar').addEventListener('click', () => {
      document.getElementById('form-adicionar-usuario').classList.add('hidden');
      document.getElementById('form-novo-usuario').reset();
    });

    // Salvar novo usuário
    document.getElementById('form-novo-usuario').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const usuario = {
        email: document.getElementById('inputEmail').value,
        senha: document.getElementById('inputSenha').value,
        nome: document.getElementById('inputNome').value,
        role: document.getElementById('inputRole').value
      };

      try {
        showToast('Criando usuário...', 'info');
        
        await apiFetch('/api/users', {
          method: 'POST',
          body: JSON.stringify(usuario)
        });
        
        showToast('Usuário criado com sucesso!', 'success');
        document.getElementById('form-novo-usuario').reset();
        document.getElementById('form-adicionar-usuario').classList.add('hidden');
        
        // Recarregar lista
        await carregarUsuarios();
      } catch (error) {
        // Erro já tratado no apiFetch
      }
    });
  }
}

async function carregarUsuarios() {
  try {
    const users = await apiFetch('/api/users');
    const tbody = document.getElementById('tabela-usuarios');
    const userAtual = JSON.parse(localStorage.getItem('logiUser') || '{}');
    
    if (!users || users.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="4" class="p-8 text-center text-slate-500">
          <i class="fa-solid fa-users-slash text-2xl mb-3 block text-slate-300"></i>
          Nenhum usuário encontrado.
        </td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(user => {
      const initials = user.nome ? user.nome.substring(0, 2).toUpperCase() : '??';
      const isCurrentUser = userAtual.email === user.email;
      
      return `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition ${isCurrentUser ? 'bg-blue-50' : ''}">
          <td class="p-4 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full ${isCurrentUser ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-brand-50 text-brand-600 border-brand-100'} flex items-center justify-center font-bold text-xs border">
              ${initials}
            </div>
            <div>
              <span class="font-bold text-slate-800">${user.nome}</span>
              ${isCurrentUser ? '<span class="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded ml-2">Você</span>' : ''}
            </div>
          </td>
          <td class="p-4 text-slate-600">${user.email}</td>
          <td class="p-4">
            <span class="px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
              ${user.role === 'admin' ? 'Administrador' : 'Comum'}
            </span>
          </td>
          <td class="p-4 text-right">
            <span class="text-green-600 font-bold text-xs flex items-center justify-end">
              <i class="fa-solid fa-circle-check mr-1 text-xs"></i> Ativo
            </span>
          </td>
        </tr>
      `;
    }).join('');
    
  } catch (e) {
    const tbody = document.getElementById('tabela-usuarios');
    tbody.innerHTML = `
      <tr><td colspan="4" class="p-4 text-center text-red-500">
        <i class="fa-solid fa-triangle-exclamation mr-2"></i>Erro ao carregar usuários: ${e.message}
      </td></tr>`;
  }
}
