import { apiFetch, showToast } from './utils.js';

export async function render() {
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-7xl mx-auto space-y-6 pb-10 animate-fade-in">
            <div class="flex justify-between items-center">
                <div>
                    <nav class="text-sm text-slate-400 mb-1">Home / Estoque</nav>
                    <h2 class="text-2xl font-bold text-slate-900">Controle de Estoque</h2>
                    <p class="text-slate-500">Gerencie todos os itens do seu inventário.</p>
                </div>
                <button id="btn-novo-item" 
                        class="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> Novo Item
                </button>
            </div>
            
            <!-- Filtros -->
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Buscar</label>
                        <input type="text" id="filtro-busca" 
                               class="w-full border-slate-300 rounded-lg p-2.5" 
                               placeholder="ID, nome ou categoria...">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                        <select id="filtro-categoria" class="w-full border-slate-300 rounded-lg p-2.5">
                            <option value="">Todas</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Local</label>
                        <select id="filtro-local" class="w-full border-slate-300 rounded-lg p-2.5">
                            <option value="">Todos</option>
                            <option value="Armazém">Armazém</option>
                            <option value="Loja">Loja</option>
                            <option value="Externo">Externo</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Status</label>
                        <select id="filtro-status" class="w-full border-slate-300 rounded-lg p-2.5">
                            <option value="">Todos</option>
                            <option value="OK">OK</option>
                            <option value="Baixo">Baixo Estoque</option>
                            <option value="Esgotado">Esgotado</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Tabela de Itens -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="font-bold text-slate-800">Itens em Estoque</h3>
                    <div class="text-sm text-slate-500">
                        Total: <span id="total-itens-contador">0</span> itens
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th class="p-4 text-left">ID</th>
                                <th class="p-4 text-left">Nome</th>
                                <th class="p-4 text-left">Categoria</th>
                                <th class="p-4 text-left">Estoque</th>
                                <th class="p-4 text-left">Local</th>
                                <th class="p-4 text-left">Status</th>
                                <th class="p-4 text-left">Última Atualização</th>
                                <th class="p-4 text-left">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tabela-itens" class="divide-y divide-slate-100">
                            <tr><td colspan="8" class="p-8 text-center text-slate-400">
                                <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>Carregando itens...</p>
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    await loadItems();
    setupEventListeners();
}

async function loadItems() {
    try {
        const items = await apiFetch('/api/items');
        const categories = await apiFetch('/api/categories');
        
        // Preencher filtro de categorias
        const categoriaSelect = document.getElementById('filtro-categoria');
        categoriaSelect.innerHTML = '<option value="">Todas</option>' + 
            categories.map(cat => `<option value="${cat.nome}">${cat.nome}</option>`).join('');
        
        renderItemsTable(items);
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
        showToast('Erro ao carregar itens do estoque', 'error');
    }
}

function renderItemsTable(items) {
    const container = document.getElementById('tabela-itens');
    const totalSpan = document.getElementById('total-itens-contador');
    
    if (items.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="8" class="p-8 text-center text-slate-400">
                    <i class="fa-solid fa-box-open text-2xl mb-2"></i>
                    <p>Nenhum item encontrado</p>
                </td>
            </tr>
        `;
        totalSpan.textContent = '0';
        return;
    }
    
    // Transformar dados da planilha em objetos
    const itemsData = items.map(item => ({
        id: item[0] || '',
        nome: item[1] || 'Sem nome',
        categoria: item[2] || 'Geral',
        quantidade: parseInt(item[3]) || 0,
        local: item[4] || 'N/A',
        status: item[5] || 'OK',
        atualizacao: item[6] || ''
    }));
    
    totalSpan.textContent = itemsData.length;
    
    // Aplicar filtros
    const busca = document.getElementById('filtro-busca').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;
    const local = document.getElementById('filtro-local').value;
    const status = document.getElementById('filtro-status').value;
    
    const filtered = itemsData.filter(item => {
        const matchBusca = busca === '' || 
            item.id.toLowerCase().includes(busca) || 
            item.nome.toLowerCase().includes(busca) || 
            item.categoria.toLowerCase().includes(busca);
        
        const matchCategoria = categoria === '' || item.categoria === categoria;
        const matchLocal = local === '' || item.local === local;
        
        let matchStatus = true;
        if (status === 'Baixo') {
            matchStatus = item.quantidade < 5;
        } else if (status === 'Esgotado') {
            matchStatus = item.quantidade === 0;
        } else if (status === 'OK') {
            matchStatus = item.quantidade >= 5;
        }
        
        return matchBusca && matchCategoria && matchLocal && matchStatus;
    });
    
    container.innerHTML = filtered.map(item => `
        <tr>
            <td class="p-4">
                <span class="font-mono text-sm font-bold text-slate-800">${item.id}</span>
            </td>
            <td class="p-4">
                <div class="font-bold text-slate-800">${item.nome}</div>
            </td>
            <td class="p-4">
                <span class="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">${item.categoria}</span>
            </td>
            <td class="p-4">
                <div class="font-bold text-slate-800">${item.quantidade}</div>
                <div class="text-xs text-slate-500">unidades</div>
            </td>
            <td class="p-4">
                <span class="text-sm text-slate-600">${item.local}</span>
            </td>
            <td class="p-4">
                <span class="text-xs font-bold px-2 py-1 rounded ${getStatusClass(item.quantidade)}">
                    ${getStatusText(item.quantidade)}
                </span>
            </td>
            <td class="p-4 text-sm text-slate-500">
                ${item.atualizacao ? new Date(item.atualizacao).toLocaleDate
