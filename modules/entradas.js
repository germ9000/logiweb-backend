// modules/entradas.js
import { apiFetch, showToast } from './utils.js';

export async function renderEntradas() {
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6 pb-10 animate-fade-in">
            <div>
                <nav class="text-sm text-slate-400 mb-1">Operação / Entradas</nav>
                <h2 class="text-2xl font-bold text-slate-900">Registrar Entrada</h2>
                <p class="text-slate-500">Adicione novos itens ao estoque.</p>
            </div>

            <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <form id="form-entrada" class="space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">ID / SKU</label>
                            <input type="text" id="in-id" class="w-full border-slate-300 rounded-lg p-2.5 bg-slate-50 uppercase font-mono" placeholder="SKU-001" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Data</label>
                            <input type="date" id="in-date" class="w-full border-slate-300 rounded-lg p-2.5">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
                        <input type="text" id="in-name" class="w-full border-slate-300 rounded-lg p-2.5" placeholder="Ex: Parafusadeira" required>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                            <select id="in-cat" class="w-full border-slate-300 rounded-lg p-2.5 bg-white">
                                <option>Geral</option><option>Eletrônicos</option><option>Ferramentas</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Quantidade</label>
                            <input type="number" id="in-qty" class="w-full border-slate-300 rounded-lg p-2.5 font-bold" min="1" required>
                        </div>
                    </div>

                    <div class="pt-4 flex justify-end">
                        <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition">
                            <i class="fa-solid fa-check mr-2"></i> Confirmar Entrada
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Data de hoje
    document.getElementById('in-date').valueAsDate = new Date();

    // Submit
    document.getElementById('form-entrada').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            action: 'entrada', // Importante
            id: document.getElementById('in-id').value,
            nome: document.getElementById('in-name').value,
            categoria: document.getElementById('in-cat').value,
            quantidade: parseInt(document.getElementById('in-qty').value),
            local: 'Geral', // Default
            status: 'OK'    // Default
        };

        try {
            await apiFetch('/api/items', { method: 'POST', body: JSON.stringify(payload) });
            showToast("Entrada realizada com sucesso!", "success");
            document.getElementById('form-entrada').reset();
        } catch (error) {
            // Erro tratado no utils
        }
    });
}
