// modules/perfil.js
import { apiFetch, showToast } from './utils.js';

export async function renderPerfil() {
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-display font-bold text-slate-900">Gerenciar Perfis</h2>
                    <p class="text-slate-500">Visualize os usuários cadastrados no sistema.</p>
                </div>
                <button class="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-50 cursor-not-allowed" title="Em breve">
                    <i class="fa-solid fa-plus mr-2"></i> Novo Usuário
                </button>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                        <tr>
                            <th class="p-4">Usuário</th>
                            <th class="p-4">Email</th>
                            <th class="p-4">Função (Role)</th>
                            <th class="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        <tr><td colspan="4" class="p-6 text-center text-slate-400">Carregando usuários...</td></tr>
                    </tbody>
                </table>
            </div>
            
            <div class="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                <i class="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                <div class="text-sm text-blue-800">
                    <p class="font-bold">Nota de Segurança</p>
                    <p>As senhas não são exibidas por segurança. Para alterar permissões, contate o administrador do banco de dados.</p>
                </div>
            </div>
        </div>
    `;

    try {
        // Busca usuários da API
        // O backend retorna algo como: [[email, senha, nome, role], ...]
        const rawUsers = await apiFetch('/api/users');
        
        const tbody = document.getElementById('users-table-body');
        
        if(!rawUsers || rawUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>`;
            return;
        }

        tbody.innerHTML = rawUsers.map((user, index) => {
            // Supondo ordem: [0]Email, [1]Senha, [2]Nome, [3]Role
            // Ajuste conforme seu sheet.js real
            const nome = user[2] || 'Sem Nome';
            const email = user[0] || '---';
            const role = user[3] || 'comum';
            
            // Avatar com iniciais
            const initials = nome.substring(0,2).toUpperCase();
            
            return `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-100">
                                ${initials}
                            </div>
                            <span class="font-bold text-slate-800">${nome}</span>
                        </div>
                    </td>
                    <td class="p-4 text-slate-500 font-mono text-xs">${email}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-md text-xs font-bold uppercase ${role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}">
                            ${role}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                        <span class="text-green-600 text-xs font-bold flex items-center justify-end gap-1">
                            <i class="fa-solid fa-circle text-[8px]"></i> Ativo
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        document.getElementById('users-table-body').innerHTML = `<tr><td colspan="4" class="p-6 text-center text-red-500">Erro ao carregar: ${error.message}</td></tr>`;
    }
}
