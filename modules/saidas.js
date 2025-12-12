
// modules/saidas.js
import { apiFetch, mapItems, showToast } from './utils.js';

let allItems = []; // Cache local para busca rápida

export async function renderSaidas() {
    const container = document.getElementById('app-content');
    
    // Layout Base
    container.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6 pb-10">
            <div>
                <h2 class="text-2xl font-bold text-slate-900">Saída de Estoque</h2>
                <p class="text-slate-500">Registre a retirada de itens e atualize o inventário.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <label class="block text-sm font-bold text-slate-700 mb-2">Buscar Item</label>
                        <select id="item-select" class="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5">
                            <option value="">Carregando itens...</option>
                        </select>
                    </div>

                    <div id="detail-card" class="hidden bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center transition-all">
                        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 text-3xl mb-4">
                            <i class="fa-solid fa-box-open"></i>
                        </div>
                        <h3 id="detail-name" class="text-xl font-bold text-slate-800 leading-tight mb-1">--</h3>
                        <span id="detail-cat" class="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md uppercase font-bold mb-4">--</span>
                        
                        <div class="grid grid-cols-2 gap-2 w-full mt-2">
                            <div class="bg-blue-50 p-3 rounded-lg">
                                <p class="text-[10px] text-blue-400 uppercase font-bold">Estoque</p>
                                <p id="detail-qty" class="text-2xl font-bold text-blue-600">0</p>
                            </div>
                            <div class="bg-slate-50 p-3 rounded-lg">
                                <p class="text-[10px] text-slate-400 uppercase font-bold">Local</p>
                                <p id="detail-local" class="text-sm font-bold text-slate-600 mt-1 truncate">--</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                        <h3 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><i class="fa-solid fa-arrow-down"></i></span>
                            Dados da Movimentação
                        </h3>

                        <form id="form-saida" class="space-y-6 flex-1">
                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-1">Motivo da Saída</label>
                                <select id="input-reason" class="w-full border-slate-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 p-3 bg-white" required>
                                    <option value="Venda">Venda Direta</option>
                                    <option value="Consumo Interno">Consumo Interno</option>
                                    <option value="Perda">Perda / Avaria</option>
                                    <option value="Ajuste">Ajuste de Inventário</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-slate-700 mb-2">Quantidade</label>
                                <div class="flex items-center gap-4">
                                    <button type="button" class="btn-qty w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xl transition" data-delta="-1">-</button>
                                    <input type="number" id="input-qty" class="w-32 text-center text-3xl font-bold border-none focus:ring-0 text-slate-800" value="1" min="1" required>
                                    <button type="button" class="btn-qty w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xl transition" data-delta="1">+</button>
                                </div>
                                <p class="text-xs text-slate-400 mt-2">Use os botões ou digite manualmente.</p>
                            </div>

                            <div class="pt-6 mt-auto border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onclick="document.getElementById('form-saida').reset()" class="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Limpar</button>
                                <button type="submit" class="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition transform active:scale-95 flex items-center gap-2">
                                    <i class="fa-solid fa-check"></i> Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // LÓGICA
    try {
        const raw = await apiFetch('/api/items');
        allItems = mapItems(raw);
        populateSelect(allItems);
        setupEvents();
    } catch (e) {
        console.error(e); // Erro já tratado no utils
    }
}

function populateSelect(items) {
    const select = document.getElementById('item-select');
    select.innerHTML = '<option value="">Selecione um item...</option>' + 
        items.map(i => `<option value="${i.id}">${i.name} (Saldo: ${i.qty})</option>`).join('');
}

function setupEvents() {
    const select = document.getElementById('item-select');
    const inputQty = document.getElementById('input-qty');
    
    // Seleção de Item
    select.addEventListener('change', (e) => {
        const item = allItems.find(i => i.id === e.target.value);
        const card = document.getElementById('detail-card');
        
        if (item) {
            card.classList.remove('hidden');
            document.getElementById('detail-name').innerText = item.name;
            document.getElementById('detail-cat').innerText = item.category;
            document.getElementById('detail-qty').innerText = item.qty;
            document.getElementById('detail-local').innerText = item.local;
            inputQty.max = item.qty;
            inputQty.value = 1;
        } else {
            card.classList.add('hidden');
        }
    });

    // Botões +/-
    document.querySelectorAll('.btn-qty').forEach(btn => {
        btn.addEventListener('click', () => {
            let val = parseInt(inputQty.value) || 0;
            const delta = parseInt(btn.dataset.delta);
            const max = parseInt(inputQty.max) || 9999;
            
            val += delta;
            if (val < 1) val = 1;
            if (val > max) {
                val = max;
                showToast(`Estoque máximo atingido (${max})`, 'error');
            }
            inputQty.value = val;
        });
    });

    // Submit
    document.getElementById('form-saida').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = select.value;
        const qty = parseInt(inputQty.value);
        const reason = document.getElementById('input-reason').value;

        if (!id) return showToast("Selecione um item primeiro", "error");
        
        // Validação Final de Estoque
        const item = allItems.find(i => i.id === id);
        if (qty > item.qty) return showToast("Quantidade indisponível!", "error");

        if(!confirm(`Confirmar saída de ${qty}x ${item.name}?`)) return;

        try {
            await apiFetch('/api/items', {
                method: 'POST',
                body: JSON.stringify({ action: 'saida', id, quantidade: qty, motivo: reason })
            });
            showToast("Saída registrada com sucesso!");
            renderSaidas(); // Reload para atualizar estoque
        } catch (err) {
            // Erro já tratado no apiFetch
        }
    });
}
