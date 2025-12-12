import { apiFetch, showToast, formatCurrency, formatDate } from './utils.js';

let todosItens = [];
let itensFiltrados = [];

export async function renderEstoque() {
    const container = document.getElementById('app-content');
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');

    container.innerHTML = `
        <div class="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">Estoque Completo</h2>
                    <p class="text-slate-500">Gerencie todos os itens do inventário.</p>
                </div>
                <div class="flex gap-3">
                    ${user.role === 'admin' ? `
                        <button id="btn-importar" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                            <i class="fa-solid fa-file-import mr-2"></i> Importar CSV
                        </button>
                        <button id="btn-exportar" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                            <i class="fa-solid fa-file-export mr-2"></i> Exportar
                        </button>
                    ` : ''}
                    <button id="btn-novo-item" onclick="navigateTo('entradas')" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                        <i class="fa-solid fa-plus mr-2"></i> Novo Item
                    </button>
                </div>
            </div>

            <!-- Filtros Rápidos -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p class="text-xs font-bold text-slate-500 uppercase">Total Itens</p>
                    <h3 id="total-itens" class="text-2xl font-bold text-slate-800 mt-1">0</h3>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p class="text-xs font-bold text-slate-500 uppercase">Valor Total</p>
                    <h3 id="valor-total" class="text-2xl font-bold text-slate-800 mt-1">R$ 0</h3>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p class="text-xs font-bold text-slate-500 uppercase">Itens Críticos</p>
                    <h3 id="itens-criticos" class="text-2xl font-bold text-red-600 mt-1">0</h3>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p class="text-xs font-bold text-slate-500 uppercase">Sem Estoque</p>
                    <h3 id="itens-sem-estoque" class="text-2xl font-bold text-orange-600 mt-1">0</h3>
                </div>
            </div>

            <!-- Barra de Filtros -->
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-2">
                        <label class="block text-sm font-bold text-slate-700 mb-1">Buscar</label>
                        <input type="text" id="buscar" class="w-full border-slate-300 rounded-lg p-2.5" 
                               placeholder="ID, nome, código de barras...">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                        <select id="filtro-categoria" class="w-full border-slate-300 rounded-lg p-2.5">
                            <option value="">Todas</option>
                            <option value="Construção civil">Construção civil</option>
                            <option value="Casa">Casa</option>
                            <option value="Mecânica">Mecânica</option>
                            <option value="Eletrônicos">Eletrônicos</option>
                            <option value="Ferramentas">Ferramentas</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Status Estoque</label>
                        <select id="filtro-status" class="w-full border-slate-300 rounded-lg p-2.5">
                            <option value="">Todos</option>
                            <option value="critico">Crítico (< 5)</option>
                            <option value="baixo">Baixo (5-10)</option>
                            <option value="normal">Normal (> 10)</option>
                            <option value="sem">Sem estoque</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-4">
                    <button id="btn-limpar-filtros" class="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
                        Limpar Filtros
                    </button>
                    <button id="btn-aplicar-filtros" class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg">
                        <i class="fa-solid fa-filter mr-2"></i> Aplicar Filtros
                    </button>
                </div>
            </div>

            <!-- Tabela de Itens -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                            <tr>
                                <th class="p-4">ID</th>
                                <th class="p-4">Nome</th>
                                <th class="p-4">Categoria</th>
                                <th class="p-4">Quantidade</th>
                                <th class="p-4">Local</th>
                                <th class="p-4">Status</th>
                                <th class="p-4">Cód. Barras</th>
                                <th class="p-4">Última Atualização</th>
                                <th class="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tabela-itens">
                            <tr><td colspan="9" class="p-8 text-center text-slate-400">
                                <i class="fa-solid fa-spinner fa-spin mr-2"></i>Carregando itens...
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Controles -->
            <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-sm text-slate-500">
                    Mostrando <span id="itens-mostrados">0</span> de <span id="itens-total">0</span> itens
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-slate-600">Itens por página:</span>
                        <select id="itens-por-pagina" class="border-slate-300 rounded-lg p-1 text-sm">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <button id="btn-anterior" class="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-50">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <span class="px-3 py-1 text-slate-700">Página <span id="pagina-atual">1</span></span>
                        <button id="btn-proxima" class="px-3 py-1 border border-slate-300 rounded-lg text-slate-600">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Importar CSV -->
        <div id="modal-importar" class="hidden fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-slate-200">
                    <h3 class="text-xl font-bold text-slate-900">Importar Itens</h3>
                    <p class="text-slate-500 text-sm mt-1">Importe itens via arquivo CSV ou TSV</p>
                </div>
                <div class="p-6 space-y-5">
                    <div>
                        <h4 class="font-bold text-slate-700 mb-2">Formato do Arquivo</h4>
                        <p class="text-sm text-slate-600 mb-3">O arquivo deve conter estas colunas (na ordem):</p>
                        <div class="bg-slate-50 p-4 rounded-lg">
                            <code class="text-sm font-mono text-slate-700">
                                ID, Nome, Categoria, Quantidade, Local, Status, Código de Barras
                            </code>
                        </div>
                        <p class="text-xs text-slate-500 mt-2">Use vírgula para separar as colunas. A primeira linha deve conter os cabeçalhos.</p>
                    </div>

                    <div class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                        <input type="file" id="arquivo-csv" accept=".csv,.tsv,.txt" class="hidden">
                        <i class="fa-solid fa-file-csv text-5xl text-slate-400 mb-4"></i>
                        <p class="text-slate-600 mb-3">Arraste e solte seu arquivo CSV aqui</p>
                        <p class="text-sm text-slate-500 mb-4">ou</p>
                        <button id="btn-selecionar-arquivo" class="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-bold">
                            <i class="fa-solid fa-folder-open mr-2"></i> Selecionar Arquivo
                        </button>
                        <p class="text-xs text-slate-400 mt-4">Tamanho máximo: 10MB</p>
                    </div>

                    <div id="preview-importacao" class="hidden">
                        <h4 class="font-bold text-slate-700 mb-2">Pré-visualização</h4>
                        <div class="border border-slate-200 rounded-lg overflow-hidden">
                            <div class="overflow-x-auto max-h-60">
                                <table class="w-full text-sm">
                                    <thead class="bg-slate-50">
                                        <tr id="preview-headers"></tr>
                                    </thead>
                                    <tbody id="preview-rows"></tbody>
                                </table>
                            </div>
                        </div>
                        <p class="text-xs text-slate-500 mt-2"><span id="preview-count">0</span> itens para importar</p>
                    </div>
                </div>
                <div class="p-6 border-t border-slate-200 flex justify-end gap-3">
                    <button id="btn-cancelar-importar" class="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
                        Cancelar
                    </button>
                    <button id="btn-confirmar-importar" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50">
                        <i class="fa-solid fa-upload mr-2"></i> Importar Itens
                    </button>
                </div>
            </div>
        </div>
    `;

    // Carregar itens
    await carregarItens();

    // Configurar eventos
    configurarEventos();
}

async function carregarItens() {
    try {
        const data = await apiFetch('/api/items');
        
        // Transformar dados da planilha em objetos
        todosItens = data.map(row => {
            const qty = parseInt(row[3]) || 0;
            let status = 'OK';
            if (qty === 0) status = 'Sem estoque';
            else if (qty < 5) status = 'Crítico';
            else if (qty < 10) status = 'Baixo';
            
            return {
                id: row[0] || '',
                nome: row[1] || 'Sem nome',
                categoria: row[2] || 'Geral',
                quantidade: qty,
                local: row[4] || 'N/A',
                status: row[5] || status,
                ultimaAtualizacao: row[6] || new Date().toISOString(),
                codigoBarras: row[7] || '', // Supondo que a coluna 7 seja código de barras
                // Gerar preço aleatório para cálculo do valor
                preco: Math.floor(Math.random() * (500 - 10 + 1) + 10)
            };
        });
        
        // Aplicar filtros iniciais
        aplicarFiltros();
        
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
        document.getElementById('tabela-itens').innerHTML = `
            <tr><td colspan="9" class="p-4 text-center text-red-500">
                <i class="fa-solid fa-triangle-exclamation mr-2"></i>Erro ao carregar itens: ${error.message}
            </td></tr>`;
    }
}

function aplicarFiltros() {
    const buscar = document.getElementById('buscar')?.value.toLowerCase() || '';
    const categoria = document.getElementById('filtro-categoria')?.value || '';
    const status = document.getElementById('filtro-status')?.value || '';
    
    itensFiltrados = todosItens.filter(item => {
        // Filtro de busca
        const matchBusca = !buscar || 
            item.id.toLowerCase().includes(buscar) ||
            item.nome.toLowerCase().includes(buscar) ||
            item.codigoBarras.toLowerCase().includes(buscar);
        
        // Filtro de categoria
        const matchCategoria = !categoria || item.categoria === categoria;
        
        // Filtro de status
        let matchStatus = true;
        if (status) {
            if (status === 'critico') matchStatus = item.quantidade < 5;
            else if (status === 'baixo') matchStatus = item.quantidade >= 5 && item.quantidade <= 10;
            else if (status === 'normal') matchStatus = item.quantidade > 10;
            else if (status === 'sem') matchStatus = item.quantidade === 0;
        }
        
        return matchBusca && matchCategoria && matchStatus;
    });
    
    atualizarEstatisticas();
    renderizarTabela();
}

function atualizarEstatisticas() {
    const totalItens = todosItens.length;
    const itensCriticos = todosItens.filter(i => i.quantidade < 5 && i.quantidade > 0).length;
    const itensSemEstoque = todosItens.filter(i => i.quantidade === 0).length;
    const valorTotal = todosItens.reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
    
    document.getElementById('total-itens').textContent = totalItens;
    document.getElementById('itens-criticos').textContent = itensCriticos;
    document.getElementById('itens-sem-estoque').textContent = itensSemEstoque;
    document.getElementById('valor-total').textContent = formatCurrency(valorTotal);
    document.getElementById('itens-mostrados').textContent = itensFiltrados.length;
    document.getElementById('itens-total').textContent = todosItens.length;
}

function renderizarTabela() {
    const tbody = document.getElementById('tabela-itens');
    
    if (itensFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="9" class="p-8 text-center text-slate-500">
                <i class="fa-solid fa-box-open text-2xl mb-3 block text-slate-300"></i>
                Nenhum item encontrado.
            </td></tr>`;
        return;
    }
    
    tbody.innerHTML = itensFiltrados.map(item => {
        const statusClass = item.status === 'Crítico' ? 'bg-red-100 text-red-700' :
                          item.status === 'Baixo' ? 'bg-yellow-100 text-yellow-700' :
                          item.status === 'Sem estoque' ? 'bg-gray-100 text-gray-700' :
                          'bg-green-100 text-green-700';
        
        return `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                <td class="p-4 font-mono text-sm font-bold text-slate-800">${item.id}</td>
                <td class="p-4">
                    <div class="font-bold text-slate-800">${item.nome}</div>
                    ${item.codigoBarras ? `<div class="text-xs text-slate-500 font-mono">${item.codigoBarras}</div>` : ''}
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">${item.categoria}</span>
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        <span class="font-bold ${item.quantidade < 5 ? 'text-red-600' : 'text-slate-800'}">${item.quantidade}</span>
                        ${item.quantidade < 5 ? '<i class="fa-solid fa-triangle-exclamation text-red-500 text-xs"></i>' : ''}
                    </div>
                </td>
                <td class="p-4 text-slate-600">${item.local}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${statusClass}">
                        ${item.status}
                    </span>
                </td>
                <td class="p-4 font-mono text-xs text-slate-500">
                    ${item.codigoBarras || 'N/A'}
                </td>
                <td class="p-4 text-sm text-slate-500">
                    ${formatDate(item.ultimaAtualizacao)}
                </td>
                <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="editarItem('${item.id}')" 
                                class="text-brand-600 hover:text-brand-800 p-1.5 rounded-lg hover:bg-brand-50"
                                title="Editar">
                            <i class="fa-solid fa-pen text-sm"></i>
                        </button>
                        <button onclick="removerItem('${item.id}', '${item.nome}')" 
                                class="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50"
                                title="Remover">
                            <i class="fa-solid fa-trash text-sm"></i>
                        </button>
                        <button onclick="registrarSaidaRapida('${item.id}')" 
                                class="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50"
                                title="Saída rápida">
                            <i class="fa-solid fa-arrow-up text-sm"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function configurarEventos() {
    // Filtros
    const buscarInput = document.getElementById('buscar');
    if (buscarInput) {
        buscarInput.addEventListener('input', debounce(aplicarFiltros, 300));
    }
    
    document.getElementById('filtro-categoria')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-status')?.addEventListener('change', aplicarFiltros);
    document.getElementById('btn-aplicar-filtros')?.addEventListener('click', aplicarFiltros);
    document.getElementById('btn-limpar-filtros')?.addEventListener('click', limparFiltros);
    
    // Importar CSV
    document.getElementById('btn-importar')?.addEventListener('click', () => {
        document.getElementById('modal-importar').classList.remove('hidden');
    });
    
    document.getElementById('btn-selecionar-arquivo')?.addEventListener('click', () => {
        document.getElementById('arquivo-csv').click();
    });
    
    document.getElementById('arquivo-csv')?.addEventListener('change', handleFileSelect);
    document.getElementById('btn-cancelar-importar')?.addEventListener('click', cancelarImportacao);
    document.getElementById('btn-confirmar-importar')?.addEventListener('click', confirmarImportacao);
}

// Função debounce para busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function limparFiltros() {
    document.getElementById('buscar').value = '';
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-status').value = '';
    aplicarFiltros();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        previewCSV(content);
    };
    reader.readAsText(file);
}

function previewCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        showToast('Arquivo vazio ou formato inválido', 'error');
        return;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const previewHeaders = document.getElementById('preview-headers');
    const previewRows = document.getElementById('preview-rows');
    
    // Mostrar headers
    previewHeaders.innerHTML = headers.map(h => `<th class="p-2 border border-slate-200">${h}</th>`).join('');
    
    // Mostrar primeiras 5 linhas
    previewRows.innerHTML = lines.slice(1, 6).map((line, index) => {
        const cells = line.split(',').map(c => c.trim());
        return `<tr>${cells.map(c => `<td class="p-2 border border-slate-200">${c}</td>`).join('')}</tr>`;
    }).join('');
    
    document.getElementById('preview-count').textContent = lines.length - 1;
    document.getElementById('preview-importacao').classList.remove('hidden');
    document.getElementById('btn-confirmar-importar').disabled = false;
}

function cancelarImportacao() {
    document.getElementById('modal-importar').classList.add('hidden');
    document.getElementById('arquivo-csv').value = '';
    document.getElementById('preview-importacao').classList.add('hidden');
    document.getElementById('btn-confirmar-importar').disabled = true;
}

async function confirmarImportacao() {
    const fileInput = document.getElementById('arquivo-csv');
    if (!fileInput.files[0]) {
        showToast('Selecione um arquivo primeiro', 'error');
        return;
    }
    
    showToast('Importando itens...', 'info');
    
    // Aqui você implementaria a lógica de importação
    // Por enquanto, vamos apenas simular
    setTimeout(() => {
        showToast('Importação realizada com sucesso!', 'success');
        cancelarImportacao();
        carregarItens(); // Recarregar itens
    }, 2000);
}

// Funções globais para ações
window.editarItem = (id) => {
    // Implementar edição
    showToast(`Editar item ${id} - Em desenvolvimento`, 'info');
};

window.removerItem = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja remover o item "${nome}"?`)) {
        return;
    }
    
    try {
        showToast('Removendo item...', 'info');
        // Implementar remoção na API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular
        showToast('Item removido com sucesso!', 'success');
        await carregarItens();
    } catch (error) {
        showToast('Erro ao remover item', 'error');
    }
};

window.registrarSaidaRapida = (id) => {
    // Navegar para saídas com o item pré-selecionado
    localStorage.setItem('saidaRapidaId', id);
    navigateTo('saidas');
};
