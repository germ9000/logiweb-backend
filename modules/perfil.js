// modules/perfil.js
import { apiFetch, showToast } from './utils.js';

export async function renderPerfil() {
    const container = document.getElementById('app-content');
    
    // Layout da Tabela de Usuários
    container.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">Gestão de Perfis</h2>
                    <p class="text-slate-500">Administre o acesso dos usuários ao sistema.</p>
                </div>
                <button class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm flex items-center gap-2">
                    <i class="fa-solid fa-user-plus"></i> Novo Usuário
                </button>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                        <tr>
                            <th class="p-4">Usuário</th>
                            <th class="p-4">Email</th>
                            <th class="p-4">Nível de Acesso</th>
                            <th class="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="users-list">
                        <tr><td colspan="4" class="p-8 text-center text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Carregando perfis...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    try {
        // Busca dados reais do backend
        const users = await apiFetch('/api/users');

        const tbody = document.getElementById('users-list');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(user => {
            // Ajuste os índices conforme seu array: [0]Email, [1]Senha, [2]Nome, [3]Role
            const nome = user[2] || 'Usuário';
            const email = user[0] || '-';
            const role = user[3] || 'comum';
            const initials = nome.substring(0, 2).toUpperCase();

            return `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                                ${initials}
                            </div>
                            <span class="font-bold text-slate-800">${nome}</span>
                        </div>
                    </td>
                    <td class="p-4 text-slate-500 font-mono text-xs">${email}</td>
                    <td class="p-4">
                        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}">
                            ${role}
                        </span>
                    </td>
                    <td class="p-4 text-right text-slate-400">
                        <button class="hover:text-brand-600 mr-2"><i class="fa-solid fa-pen"></i></button>
                        <button class="hover:text-red-600"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        document.getElementById('users-list').innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Erro ao carregar usuários.</td></tr>`;
    }
}
