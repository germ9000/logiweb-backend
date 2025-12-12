import { apiFetch, showToast } from './utils.js';

export async function renderCategorias() {
    const container = document.getElementById('app-content');
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    const isAdmin = user.role === 'admin';

    container.innerHTML = `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">Gestão de Categorias</h2>
                    <p class="text-slate-500">Crie e gerencie categorias para organizar seus itens.</p>
                </div>
                
                <button id="btn-nova-categoria" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                    <i class="fa-solid fa-plus mr-2"></i> Nova Categoria
                </button>
            </div>

            <!-- Formulário para nova categoria -->
            <div id="form-nova-categoria" class="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 class="text-lg font-bold text-slate-800 mb-4">Adicionar Nova Categoria</h3>
                <form id="form-categoria" class="space-y-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Nome da Categoria *</label>
                        <input type="text" id="input-nome-categoria" class="w-full border-slate-300 rounded-lg p-2.5" required>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Descrição (opcional)</label>
                        <textarea id="input-descricao-categoria" rows="3" class="w-full border-slate-300 rounded-lg p-2.5"></textarea>
                    </div>
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" id="btn-cancelar-categoria" class="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition">
                            Cancelar
                        </button>
                        <button type="submit" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">
                            Salvar Categoria
                        </button>
                    </div>
                </form>
            </div>

            <!-- Lista de categorias -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                        <tr>
                            <th class="p-4">Nome</th>
                            <th class="p-4">Descrição</th>
                            <th class="p-4">Data de Criação</th>
                            <th class="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tabela-categorias">
                        <tr><td colspan="4" class="p-8 text-center text-slate-400">Carregando categorias...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await carregarCategorias();

    // Configurar eventos
    document.getElementById('btn-nova-categoria').addEventListener('click', () => {
        document.getElementById('form-nova-categoria').classList.toggle('hidden');
    });

    document.getElementById('btn-cancelar-categoria').addEventListener('click', () => {
        document.getElementById('form-nova-categoria').classList.add('hidden');
        document.getElementById('form-categoria').reset();
    });

    document.getElementById('form-categoria').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const categoria = {
            nome: document.getElementById('input-nome-categoria').value,
            descricao: document.getElementById('input-descricao-categoria').value
        };

        try {
            await apiFetch('/api/categories', {
                method: 'POST',
                body: JSON.stringify(categoria)
            });
            
            showToast('Categoria criada com sucesso!', 'success');
            document.getElementById('form-categoria').reset();
            document.getElementById('form-nova-categoria').classList.add('hidden');
            await carregarCategorias();
        } catch (error) {
            // Erro já tratado no apiFetch
        }
    });
}

async function carregarCategorias() {
    try {
        const categorias = await apiFetch('/api/categories');
        const tbody = document.getElementById('tabela-categorias');
        
        if (!categorias || categorias.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="4" class="p-8 text-center text-slate-500">
                    Nenhuma categoria encontrada.
                </td></tr>`;
            return;
        }

        tbody.innerHTML = categorias.map(cat => `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                <td class="p-4">
                    <span class="font-bold text-slate-800">${cat.nome}</span>
                </td>
                <td class="p-4 text-slate-600">${cat.descricao || '-'}</td>
                <td class="p-4 text-slate-500 text-sm">${new Date(cat.dataCriacao).toLocaleDateString('pt-BR')}</td>
                <td class="p-4 text-right">
                    <button onclick="excluirCategoria(${cat.id}, '${cat.nome}')" class="text-red-500 hover:text-red-700 p-2">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Adicionar função global para excluir
        window.excluirCategoria = async (linha, nome) => {
            if (!confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) {
                return;
            }
            
            try {
                await apiFetch('/api/categories', {
                    method: 'DELETE',
                    body: JSON.stringify({ linha })
                });
                
                showToast(`Categoria "${nome}" excluída com sucesso!`, 'success');
                await carregarCategorias();
            } catch (error) {
                // Erro já tratado
            }
        };

    } catch (e) {
        document.getElementById('tabela-categorias').innerHTML = `
            <tr><td colspan="4" class="p-4 text-center text-red-500">
                Erro ao carregar categorias: ${e.message}
            </td></tr>`;
    }
}
