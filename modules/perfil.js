import { apiFetch, showToast } from './utils.js';

export async function renderPerfil() {
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in relative">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">Gestão de Perfis</h2>
                    <p class="text-slate-500">Administre o acesso dos usuários.</p>
                </div>
                <button id="btn-new-user" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> Novo Usuário
                </button>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                        <tr><th class="p-4">Nome</th><th class="p-4">Email</th><th class="p-4">Função</th></tr>
                    </thead>
                    <tbody id="users-table-body">
                        <tr><td colspan="3" class="p-8 text-center text-slate-400">Carregando...</td></tr>
                    </tbody>
                </table>
            </div>

            <div id="modal-user" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div class="bg-white rounded-xl shadow-2xl p-6 w-96 animate-fade-in">
                    <h3 class="text-lg font-bold mb-4">Adicionar Usuário</h3>
                    <form id="form-user" class="space-y-3">
                        <input type="text" id="u-name" placeholder="Nome" class="w-full border p-2 rounded" required>
                        <input type="email" id="u-email" placeholder="Email" class="w-full border p-2 rounded" required>
                        <input type="text" id="u-pass" placeholder="Senha" class="w-full border p-2 rounded" required>
                        <select id="u-role" class="w-full border p-2 rounded bg-white">
                            <option value="comum">Comum</option>
                            <option value="admin">Administrador</option>
                        </select>
                        <div class="flex justify-end gap-2 mt-4">
                            <button type="button" onclick="document.getElementById('modal-user').classList.add('hidden')" class="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Cancelar</button>
                            <button type="submit" class="px-4 py-2 bg-brand-600 text-white rounded font-bold hover:bg-brand-700">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Lógica para carregar lista
    loadUsers();

    // Lógica do Modal
    document.getElementById('btn-new-user').onclick = () => document.getElementById('modal-user').classList.remove('hidden');
    
    document.getElementById('form-user').onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
            nome: document.getElementById('u-name').value,
            email: document.getElementById('u-email').value,
            senha: document.getElementById('u-pass').value,
            role: document.getElementById('u-role').value
        };
        try {
            await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(payload) });
            showToast('Usuário criado!');
            document.getElementById('modal-user').classList.add('hidden');
            loadUsers(); // Recarrega lista
        } catch (err) { }
    };
}

async function loadUsers() {
    try {
        const users = await apiFetch('/api/users');
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = users.map(u => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-4 font-bold text-slate-700">${u.nome || u[2]}</td>
                <td class="p-4 text-slate-500">${u.email || u[0]}</td>
                <td class="p-4"><span class="bg-slate-100 px-2 py-1 rounded text-xs font-bold uppercase">${u.role || u[3]}</span></td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}
