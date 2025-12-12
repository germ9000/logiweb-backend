// modules/entradas.js
import { apiFetch, showToast } from './utils.js';

export async function renderEntradas() {
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-6 pb-10 animate-fade-in">
            <div>
                <nav class="text-sm text-slate-400 mb-1">Estoque / Nova Entrada</nav>
                <h2 class="text-2xl font-bold text-slate-900">Registrar Entrada de Item</h2>
                <p class="text-slate-500">Preencha o formulário para adicionar novos itens ao estoque.</p>
            </div>

            <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                
                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3 items-start">
                    <i class="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                    <p class="text-sm text-blue-800">O ID do item é a chave principal. Se o ID já existir, o sistema somará a quantidade ao estoque atual.</p>
                </div>

                <form id="form-entrada" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">ID do Item / SKU</label>
                            <div class="flex gap-2">
                                <input type="text" id="in-id" class="w-full border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-brand-500 focus:border-brand-500 font-mono uppercase" placeholder="EX: SKU-123" required>
                                <button type="button" class="bg-slate-800 text-white px-3 rounded-lg hover:bg-slate-700" title="Ler Código de Barras"><i class="fa-solid fa-barcode"></i></button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Data de Entrada</label>
                            <input type="date" id="in-date" class="w-full border-slate-300 rounded-lg p-2.5 focus:ring-brand-500 focus:border-brand-500">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Nome do Produto</label>
                        <input type="text" id="in-name" class="w-full border-slate-300 rounded-lg p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="Ex: Parafusadeira Bosch" required>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                            <select id="in-cat" class="w-full border-slate-300 rounded-lg p-2.5 bg-white focus:ring-brand-500 focus:border-brand-500">
                                <option>Geral</option>
                                <option>Eletrônicos</option>
                                <option>Ferramentas</option>
                                <option>Móveis</option>
                                <option>Construção</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Local / Armazém</label>
                            <input type="text" id="in-local" class="w-full border-slate-300 rounded-lg p-2.5 focus:ring-brand-500 focus:border-brand-500" placeholder="Ex: Prateleira B2">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Quantidade</label>
                            <input type="number" id="in-qty" class="w-full border-slate-300 rounded-lg p-2.5 focus:ring-brand-500 focus:border-brand-500 font-bold" placeholder="0" min="1" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Status Inicial</label>
                            <select id="in-status" class="w-full border-slate-300 rounded-lg p-2.5 bg-white focus:ring-brand-500 focus:border-brand-500">
                                <option value="OK">OK (Disponível)</option>
                                <option value="Bloqueado">Bloqueado</option>
                                <option value="Em Análise">Em Análise</option>
                            </select>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onclick="document.getElementById('form-entrada').reset()" class="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition">Cancelar</button>
                        <button type="submit" class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-md shadow-brand-500/30 transition flex items-center gap-2">
                            <i class="fa-solid fa-save"></i> Registrar Entrada
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Define data de hoje
    document.getElementById('in-date').valueAsDate = new Date();

    // Lógica de Envio
    document.getElementById('form-entrada').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            action: 'entrada', // Importante para o backend saber que é adição
            id: document.getElementById('in-id').value,
            nome: document.getElementById('in-name').value,
            categoria: document.getElementById('in-cat').value,
            local: document.getElementById('in-local').value,
            quantidade: parseInt(document.getElementById('in-qty').value),
            status: document.getElementById('in-status').value
        };

        try {
            await apiFetch('/api/items', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            showToast("Entrada registrada com sucesso!");
            document.getElementById('form-entrada').reset();
            document.getElementById('in-date').valueAsDate = new Date();
        } catch (error) {
            // Erro já tratado no utils
        }
    });
}
