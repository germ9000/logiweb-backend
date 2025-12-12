// modules/perfil.js
import { apiFetch, showToast } from './utils.js';

export async function renderPerfil() {
    const container = document.getElementById('app-content');
    
    // 1. Monta a Tabela (Skeleton)
    container.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">Gestão de Perfis</h2>
                    <p class="text-slate-500">Visualize os usuários cadastrados no sistema.</p>
                </div>
                <button class="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-50 cursor-not-allowed">
                    <i class="fa-solid fa-user-plus mr-2"></i> Novo Usuário
                </button>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                        <tr>
                            <th class="p-4">Nome</th>
                            <th class="p-4">Email</th>
                            <th class="p-4">Permissão</th>
                            <th class="p-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        <tr><td colspan="4" class="p-8 text-center text-slate-400">Carregando usuários...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    try {
        // 2. Busca dados do Backend
        const users = await apiFetch('/api/users');
        const tbody = document.getElementById('users-table-body');

        if (!users || users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>`;
            return;
        }

        // 3. Preenche a Tabela
        tbody.innerHTML = users.map(user => {
            // Backend retorna array: [email, senha, nome, role]
            const email = user[0];
            const nome = user[2];
            const role = user[3] || 'comum';
            const initials = nome ? nome.substring(0, 2).toUpperCase() : 'U';

            return `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td class="p-4 flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-100">
                            ${initials}
                        </div>
                        <span class="font-bold text-slate-800">${nome}</span>
                    </td>
                    <td class="p-4 text-slate-500 font-mono text-xs">${email}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded text-xs font-bold uppercase ${role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}">
                            ${role}
                        </span>
                    </td>
                    <td class="p-4 text-right text-green-600 font-bold text-xs">
                        Ativo
                    </td>
                </tr>
            `;
        }).join('');

    } catch (e) {
        document.getElementById('users-table-body').innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Erro: ${e.message}</td></tr>`;
    }
}
