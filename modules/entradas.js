// modules/entradas.js
import { apiFetch, showToast } from './utils.js';

export async function renderEntradas() {

    export async function renderEntradas() {
    // ... código existente ...
    
    // Depois de configurar os eventos, adicione:
    await carregarCategorias();
    configurarNovaCategoria();
    
    // ... resto do código ...
}
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
            `
<div>
    <label class="block text-sm font-bold text-slate-700 mb-1">
        Código de Barras
        <span class="text-xs text-slate-400 font-normal">(Opcional)</span>
    </label>
    <div class="flex gap-2">
        <input 
            type="text" 
            id="in-barcode" 
            class="flex-1 border-slate-300 rounded-lg p-2.5 font-mono"
            placeholder="Escaneie ou digite o código"
        >
        <button 
            type="button" 
            id="btn-scan" 
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-bold flex items-center"
        >
            <i class="fa-solid fa-camera mr-2"></i> Escanear
        </button>
    </div>
    <p class="text-xs text-slate-400 mt-1">
        Use um leitor de código de barras ou clique no botão para usar a câmera
    </p>
</div>
`    
        
const payload = {
    action: 'entrada',
    id: document.getElementById('in-id').value,
    nome: document.getElementById('in-name').value,
    categoria: document.getElementById('in-cat').value,
    quantidade: parseInt(document.getElementById('in-qty').value),
    local: 'Geral',
    status: 'OK',
    codigoBarras: document.getElementById('in-barcode').value || '',
    usuario: JSON.parse(localStorage.getItem('logiUser') || '{}').nome || 'Sistema'
};        
      // Configurar botão de escanear
document.getElementById('btn-scan')?.addEventListener('click', iniciarLeituraBarcode);

function iniciarLeituraBarcode() {
    if (typeof window.BarcodeDetector === 'undefined') {
        showToast('Leitor de código de barras não suportado neste navegador', 'error');
        return;
    }
    
    showToast('Aponte a câmera para o código de barras', 'info');
    
    // Abrir câmera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            // Criar preview da câmera
            const video = document.createElement('video');
            video.style.position = 'fixed';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.zIndex = '1000';
            video.style.objectFit = 'cover';
            video.srcObject = stream;
            video.setAttribute('autoplay', '');
            video.setAttribute('playsinline', '');
            document.body.appendChild(video);
            
            // Criar overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.zIndex = '1001';
            overlay.style.background = 'rgba(0,0,0,0.7)';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            
            // Área de leitura
            const scanArea = document.createElement('div');
            scanArea.style.width = '300px';
            scanArea.style.height = '150px';
            scanArea.style.border = '3px solid #1a73e8';
            scanArea.style.borderRadius = '8px';
            scanArea.style.position = 'relative';
            scanArea.style.overflow = 'hidden';
            
            overlay.appendChild(scanArea);
            
            // Botão de cancelar
            const btnCancel = document.createElement('button');
            btnCancel.textContent = 'Cancelar';
            btnCancel.className = 'mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold';
            btnCancel.onclick = () => {
                stream.getTracks().forEach(track => track.stop());
                video.remove();
                overlay.remove();
            };
            overlay.appendChild(btnCancel);
            
            document.body.appendChild(overlay);
            
            // Detectar código de barras
            const barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_128'] });
            
            const detectBarcode = () => {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    barcodeDetector.detect(video)
                        .then(barcodes => {
                            if (barcodes.length > 0) {
                                const barcode = barcodes[0].rawValue;
                                document.getElementById('in-barcode').value = barcode;
                                showToast(`Código lido: ${barcode}`, 'success');
                                
                                // Parar câmera e limpar
                                stream.getTracks().forEach(track => track.stop());
                                video.remove();
                                overlay.remove();
                            } else {
                                requestAnimationFrame(detectBarcode);
                            }
                        })
                        .catch(err => {
                            console.error('Erro na leitura:', err);
                            requestAnimationFrame(detectBarcode);
                        });
                } else {
                    requestAnimationFrame(detectBarcode);
                }
            };
            
            video.play().then(() => {
                detectBarcode();
            });
        })
        .catch(err => {
            console.error('Erro ao acessar câmera:', err);
            showToast('Não foi possível acessar a câmera', 'error');
        });
}  
        };

        try {
            await apiFetch('/api/items', { method: 'POST', body: JSON.stringify(payload) });
            showToast("Entrada realizada com sucesso!", "success");
            document.getElementById('form-entrada').reset();
        } catch (error) {
            // Erro tratado no utils
        }

        // Adicione este campo no HTML do formulário:
`
<div>
    <label class="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
    <div class="flex gap-2">
        <select id="in-cat" class="flex-1 border-slate-300 rounded-lg p-2.5 bg-white">
            <option value="">Carregando categorias...</option>
        </select>
        <button type="button" id="btn-nova-cat" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-lg">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
</div>

<!-- Modal para nova categoria -->
<div id="modal-nova-categoria" class="hidden fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-md w-full">
        <div class="p-6 border-b border-slate-200">
            <h3 class="text-xl font-bold text-slate-900">Nova Categoria</h3>
        </div>
        <div class="p-6">
            <input type="text" id="nova-cat-nome" class="w-full border-slate-300 rounded-lg p-2.5 mb-4" placeholder="Nome da categoria">
            <textarea id="nova-cat-desc" class="w-full border-slate-300 rounded-lg p-2.5" rows="3" placeholder="Descrição (opcional)"></textarea>
        </div>
        <div class="p-6 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" id="btn-cancelar-cat" class="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">
                Cancelar
            </button>
            <button type="button" id="btn-salvar-cat" class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">
                Salvar
            </button>
        </div>
    </div>
</div>
`async function carregarCategorias() {
    try {
        const categorias = await apiFetch('/api/categories');
        const select = document.getElementById('in-cat');
        
        if (categorias && categorias.length > 0) {
            select.innerHTML = '<option value="">Selecione uma categoria</option>' +
                categorias.map(cat => `<option value="${cat.nome}">${cat.nome}</option>`).join('');
        } else {
            select.innerHTML = '<option value="Geral">Geral</option>' +
                '<option value="Eletrônicos">Eletrônicos</option>' +
                '<option value="Ferramentas">Ferramentas</option>' +
                '<option value="Mecânica">Mecânica</option>' +
                '<option value="Construção">Construção</option>';
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        document.getElementById('in-cat').innerHTML = `
            <option value="Geral">Geral</option>
            <option value="Eletrônicos">Eletrônicos</option>
            <option value="Ferramentas">Ferramentas</option>
        `;
    }
}

function configurarNovaCategoria() {
    const btnNovaCat = document.getElementById('btn-nova-cat');
    const modalCat = document.getElementById('modal-nova-categoria');
    const btnCancelarCat = document.getElementById('btn-cancelar-cat');
    const btnSalvarCat = document.getElementById('btn-salvar-cat');
    
    if (!btnNovaCat || !modalCat) return;
    
    btnNovaCat.addEventListener('click', () => {
        modalCat.classList.remove('hidden');
    });
    
    btnCancelarCat.addEventListener('click', () => {
        modalCat.classList.add('hidden');
        document.getElementById('nova-cat-nome').value = '';
        document.getElementById('nova-cat-desc').value = '';
    });
    
    btnSalvarCat.addEventListener('click', async () => {
        const nome = document.getElementById('nova-cat-nome').value.trim();
        const desc = document.getElementById('nova-cat-desc').value.trim();
        
        if (!nome) {
            showToast('Digite o nome da categoria', 'error');
            return;
        }
        
        try {
            await apiFetch('/api/categories', {
                method: 'POST',
                body: JSON.stringify({ nome, descricao: desc })
            });
            
            showToast('Categoria criada com sucesso!', 'success');
            modalCat.classList.add('hidden');
            document.getElementById('nova-cat-nome').value = '';
            document.getElementById('nova-cat-desc').value = '';
            
            // Recarregar categorias e selecionar a nova
            await carregarCategorias();
            document.getElementById('in-cat').value = nome;
            
        } catch (error) {
            // Erro já tratado
        }
// Verificar se item já existe (busca local)
const itemExistente = todosItens.find(item => 
    item.id === payload.id || 
    (payload.codigoBarras && item.codigoBarras === payload.codigoBarras)
);

if (itemExistente) {
    const confirmar = confirm(
        `⚠️ ITEM JÁ CADASTRADO!\n\n` +
        `ID: ${itemExistente.id}\n` +
        `Nome: ${itemExistente.nome}\n` +
        `Estoque atual: ${itemExistente.quantidade}\n\n` +
        `Deseja adicionar ${payload.quantidade} unidades ao estoque existente?`
    );
    
    if (!confirmar) {
        showToast('Operação cancelada', 'info');
        return;
    }
}
        
    });
}
    });
}
