import { apiFetch, formatCurrency } from './utils.js';

export async function renderSaidas() {
    const container = document.getElementById('app-content');
    
    // 1. Estrutura Inicial (Skeleton)
    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-900">Saída de Estoque</h2>
                <p class="text-slate-500">Registre a retirada de itens do inventário.</p>
            </div>

            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label class="block text-sm font-bold mb-2">Buscar Produto</label>
                <div class="flex gap-2">
                    <select id="select-produto" class="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 ring-brand-500 outline-none transition">
                        <option value="">Carregando itens...</option>
                    </select>
                </div>
            </div>

            <div id="area-detalhes" class="hidden grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-2 py-1 rounded">Item Selecionado</span>
                            <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded"><i class="fa-solid fa-check"></i> Disponível</span>
                        </div>
                        <h3 id="display-nome" class="text-2xl font-bold text-slate-900 mb-1">--</h3>
                        <p id="display-cat" class="text-slate-500 mb-6">--</p>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-slate-50 p-3 rounded-lg">
                                <p class="text-xs text-slate-400 uppercase">SKU / ID</p>
                                <p id="display-id" class="font-mono font-bold text-slate-700">--</p>
                            </div>
                            <div class="bg-slate-50 p-3 rounded-lg">
                                <p class="text-xs text-slate-400 uppercase">Localização</p>
                                <p id="display-local" class="font-bold text-slate-700"><i class="fa-solid fa-location-dot text-brand-500"></i> --</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                        <span class="text-sm text-blue-800">Estoque Atual</span>
                        <span id="display-estoque" class="text-2xl font-bold text-blue-700">--</span>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h4 class="font-bold text-lg mb-4 flex items-center gap-2"><i class="fa-solid fa-arrow-up-from-bracket text-red-500"></i> Dados da Saída</h4>
                    
                    <div class="space-y-4 flex-1">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade</label>
                            <input type="number" id="input-qtd" class="w-full text-center text-3xl font-bold border-b-2 border-slate-200 focus:border-brand-500 outline-none py-2" placeholder="0" min="1">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo</label>
                            <select id="input-motivo" class="w-full border p-2 rounded bg-slate-50">
                                <option>Venda Direta</option>
                                <option>Consumo Interno</option>
                                <option>Perda / Quebra</option>
                                <option>Transferência</option>
                            </select>
                        </div>
                    </div>

                    <button id="btn-confirmar" class="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 mt-6 transition transform active:scale-95">
                        Confirmar Saída
                    </button>
                </div>
            </div>
        </div>
    `;

    // 2. Lógica: Carregar Itens para o Select
    try {
        const itemsData = await apiFetch('/api/items'); // [id, nome, cat, qty, local]
        // Mapear array para objeto
        const items = itemsData.map(row => ({
            id: row[0], nome: row[1], cat: row[2], qty: parseInt(row[3])||0, local: row[4]
        }));

        const select = document.getElementById('select-produto');
        select.innerHTML = '<option value="">Selecione um produto...</option>' + 
            items.map(i => `<option value="${i.id}">${i.name}</option>`).join('');

        // 3. Evento: Selecionou um item
        select.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            const item = items.find(i => i.id === selectedId);
            const areaDetalhes = document.getElementById('area-detalhes');

            if (item) {
                areaDetalhes.classList.remove('hidden');
                document.getElementById('display-nome').innerText = item.name;
                document.getElementById('display-cat').innerText = item.cat;
                document.getElementById('display-id').innerText = item.id;
                document.getElementById('display-local').innerText = item.local || 'N/A';
                document.getElementById('display-estoque').innerText = item.qty + ' unid.';
                document.getElementById('input-qtd').max = item.qty;
                document.getElementById('input-qtd').value = '';
                document.getElementById('input-qtd').focus();
            } else {
                areaDetalhes.classList.add('hidden');
            }
        });

        // 4. Evento: Confirmar Saída
        document.getElementById('btn-confirmar').addEventListener('click', async () => {
            const id = select.value;
            const qtd = parseInt(document.getElementById('input-qtd').value);
            const motivo = document.getElementById('input-motivo').value;

            if (!id || !qtd || qtd <= 0) return alert("Verifique os dados.");

            const item = items.find(i => i.id === id);
            if (qtd > item.qty) return alert(`Estoque insuficiente! Máximo: ${item.qty}`);

            if(!confirm(`Confirmar saída de ${qtd}x ${item.name}?`)) return;

            // Envia para API
            await apiFetch('/api/items', {
                method: 'POST',
                body: JSON.stringify({ action: 'saida', id, quantidade: qtd, motivo })
            });

            alert("Saída registrada com sucesso!");
            renderSaidas(); // Recarrega tela
        });

    } catch (e) {
        container.innerHTML = `<p class="text-red-500">Erro ao carregar itens: ${e.message}</p>`;
    }
}
