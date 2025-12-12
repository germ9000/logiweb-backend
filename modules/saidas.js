
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

        `
<!-- Opção de etiqueta -->
<div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
    <div class="flex items-center gap-3 mb-3">
        <input type="checkbox" id="gerar-etiqueta" class="w-5 h-5 text-brand-600 rounded">
        <label for="gerar-etiqueta" class="font-bold text-slate-800">Gerar etiqueta para esta saída</label>
    </div>
    
    <div id="opcoes-etiqueta" class="hidden space-y-3 mt-3">
        <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Tipo de etiqueta</label>
            <select id="tipo-etiqueta" class="w-full border-slate-300 rounded-lg p-2.5 bg-white">
                <option value="simples">Etiqueta Simples</option>
                <option value="codigo-barras">Com Código de Barras</option>
                <option value="completa">Etiqueta Completa</option>
            </select>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Quantidade de cópias</label>
                <input type="number" id="copias-etiqueta" class="w-full border-slate-300 rounded-lg p-2.5" value="1" min="1" max="10">
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Tamanho</label>
                <select id="tamanho-etiqueta" class="w-full border-slate-300 rounded-lg p-2.5 bg-white">
                    <option value="pequena">Pequena (50x30mm)</option>
                    <option value="media" selected>Média (70x40mm)</option>
                    <option value="grande">Grande (100x60mm)</option>
                </select>
            </div>
        </div>
        
        <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Observação na etiqueta (opcional)</label>
            <input type="text" id="obs-etiqueta" class="w-full border-slate-300 rounded-lg p-2.5" placeholder="Ex: Para cliente X, projeto Y...">
        </div>
        
        <div class="pt-2">
            <button type="button" id="btn-preview-etiqueta" class="text-brand-600 font-bold text-sm hover:text-brand-800">
                <i class="fa-solid fa-eye mr-1"></i> Visualizar etiqueta
            </button>
        </div>
    </div>
</div>
`function gerarEtiqueta(item, quantidade, motivo, opcoes = {}) {
    const {
        tipo = 'simples',
        copias = 1,
        tamanho = 'media',
        observacao = ''
    } = opcoes;
    
    // Criar uma nova janela para a etiqueta
    const janelaEtiqueta = window.open('', '_blank', 'width=600,height=800,scrollbars=yes');
    
    // Definir estilo baseado no tamanho
    const tamanhos = {
        pequena: { width: '50mm', height: '30mm', fontSize: '10px' },
        media: { width: '70mm', height: '40mm', fontSize: '12px' },
        grande: { width: '100mm', height: '60mm', fontSize: '14px' }
    };
    
    const estilo = tamanhos[tamanho] || tamanhos.media;
    
    // Gerar conteúdo HTML da etiqueta
    const data = new Date().toLocaleDateString('pt-BR');
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const usuario = JSON.parse(localStorage.getItem('logiUser') || '{}').nome || 'Usuário';
    
    // Gerar código de barras fictício (em produção, use uma biblioteca como JsBarcode)
    const codigoBarrasHTML = item.codigoBarras ? 
        `<div class="barcode">${item.codigoBarras}</div>` : 
        '<div class="barcode-placeholder">SEM CÓDIGO DE BARRAS</div>';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Etiqueta - ${item.id}</title>
            <meta charset="UTF-8">
            <style>
                @media print {
                    body { margin: 0; padding: 0; }
                    .etiqueta-container { break-inside: avoid; }
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    background: #f5f5f5;
                    padding: 20px;
                }
                
                .etiqueta-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }
                
                .etiqueta {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    overflow: hidden;
                    position: relative;
                }
                
                .header {
                    background: #1a73e8;
                    color: white;
                    padding: 8px 12px;
                    font-weight: bold;
                    text-align: center;
                    font-size: ${parseInt(estilo.fontSize) + 2}px;
                }
                
                .content {
                    padding: 12px;
                }
                
                .linha {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-size: ${estilo.fontSize};
                }
                
                .label {
                    font-weight: bold;
                    color: #555;
                    min-width: 100px;
                }
                
                .value {
                    color: #222;
                    text-align: right;
                    flex: 1;
                }
                
                .barcode-section {
                    text-align: center;
                    margin: 10px 0;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: ${parseInt(estilo.fontSize) + 4}px;
                    font-weight: bold;
                    letter-spacing: 2px;
                }
                
                .barcode-placeholder {
                    color: #999;
                    font-size: ${estilo.fontSize};
                }
                
                .footer {
                    border-top: 1px dashed #ddd;
                    padding-top: 8px;
                    margin-top: 8px;
                    font-size: ${parseInt(estilo.fontSize) - 2}px;
                    color: #666;
                    text-align: center;
                }
                
                .observacao {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 4px;
                    padding: 6px 8px;
                    margin-top: 8px;
                    font-size: ${parseInt(estilo.fontSize) - 1}px;
                    color: #856404;
                }
                
                /* Tamanhos específicos */
                .tamanho-pequena { width: 50mm; height: 30mm; }
                .tamanho-media { width: 70mm; height: 40mm; }
                .tamanho-grande { width: 100mm; height: 60mm; }
                
                @media print {
                    .no-print { display: none; }
                    .etiqueta { break-inside: avoid; page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
                <h2 style="color: #1a73e8; margin-bottom: 10px;">Pré-visualização da Etiqueta</h2>
                <p style="color: #666; margin-bottom: 15px;">
                    Quantidade: ${copias} cópias | Tamanho: ${tamanho} | Tipo: ${tipo}
                </p>
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.print()" style="background: #1a73e8; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        <i class="fa-solid fa-print"></i> Imprimir Etiquetas
                    </button>
                    <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        <i class="fa-solid fa-times"></i> Fechar
                    </button>
                </div>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            </div>
            
            <div class="etiqueta-container">
    `;
    
    // Gerar múltiplas cópias
    for (let i = 0; i < copias; i++) {
        html += `
            <div class="etiqueta tamanho-${tamanho}" style="width: ${estilo.width}; height: ${estilo.height};">
                <div class="header">SAÍDA DE ESTOQUE</div>
                <div class="content">
                    <div class="linha">
                        <span class="label">ID:</span>
                        <span class="value">${item.id}</span>
                    </div>
                    <div class="linha">
                        <span class="label">Item:</span>
                        <span class="value">${item.nome.substring(0, 30)}${item.nome.length > 30 ? '...' : ''}</span>
                    </div>
                    <div class="linha">
                        <span class="label">Qtd Saída:</span>
                        <span class="value" style="color: #e74c3c; font-weight: bold;">${quantidade} un</span>
                    </div>
                    <div class="linha">
                        <span class="label">Estoque Restante:</span>
                        <span class="value">${item.quantidade - quantidade} un</span>
                    </div>
                    <div class="linha">
                        <span class="label">Motivo:</span>
                        <span class="value">${motivo}</span>
                    </div>
                    <div class="linha">
                        <span class="label">Data:</span>
                        <span class="value">${data} ${hora}</span>
                    </div>
                    <div class="linha">
                        <span class="label">Retirado por:</span>
                        <span class="value">${usuario}</span>
                    </div>
                    
                    ${tipo !== 'simples' ? `
                    <div class="barcode-section">
                        ${codigoBarrasHTML}
                    </div>
                    ` : ''}
                    
                    ${observacao ? `
                    <div class="observacao">
                        <strong>Obs:</strong> ${observacao}
                    </div>
                    ` : ''}
                    
                    <div class="footer">
                        Gerado por LogiTrack • ${item.local || 'Local não informado'}
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `
            </div>
            
            <script>
                // Adicionar ícones do Font Awesome
                const faLink = document.createElement('link');
                faLink.rel = 'stylesheet';
                faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
                document.head.appendChild(faLink);
                
                // Configurar impressão
                function configurarImpressao() {
                    window.onbeforeprint = function() {
                        document.querySelector('.no-print').style.display = 'none';
                    };
                    
                    window.onafterprint = function() {
                        document.querySelector('.no-print').style.display = 'block';
                    };
                }
                
                // Configurar quando a janela carregar
                window.onload = function() {
                    configurarImpressao();
                    // Auto-print se apenas uma cópia (opcional)
                    // if (${copias} === 1 && ${tipo} === 'simples') {
                    //     setTimeout(() => window.print(), 500);
                    // }
                };
            </script>
        </body>
        </html>
    `;
    
    // Escrever na janela
    janelaEtiqueta.document.open();
    janelaEtiqueta.document.write(html);
    janelaEtiqueta.document.close();
}

// Configurar eventos da etiqueta
function configurarEtiqueta() {
    const checkbox = document.getElementById('gerar-etiqueta');
    const opcoesDiv = document.getElementById('opcoes-etiqueta');
    const btnPreview = document.getElementById('btn-preview-etiqueta');
    
    if (!checkbox || !opcoesDiv) return;
    
    // Mostrar/ocultar opções
    checkbox.addEventListener('change', () => {
        opcoesDiv.classList.toggle('hidden', !checkbox.checked);
    });
    
    // Pré-visualizar
    if (btnPreview) {
        btnPreview.addEventListener('click', () => {
            const itemId = document.getElementById('item-selecionado-id').value;
            const item = todosItens.find(i => i.id === itemId);
            
            if (!item) {
                showToast('Selecione um item primeiro', 'error');
                return;
            }
            
            const quantidade = parseInt(document.getElementById('quantidade').value) || 1;
            const motivo = document.getElementById('motivo').value;
            
            const opcoesEtiqueta = {
                tipo: document.getElementById('tipo-etiqueta').value,
                copias: parseInt(document.getElementById('copias-etiqueta').value) || 1,
                tamanho: document.getElementById('tamanho-etiqueta').value,
                observacao: document.getElementById('obs-etiqueta').value || ''
            };
            
            gerarEtiqueta(item, quantidade, motivo, opcoesEtiqueta);
        });
    }
}// Gerar etiqueta se solicitado
if (document.getElementById('gerar-etiqueta')?.checked) {
    const opcoesEtiqueta = {
        tipo: document.getElementById('tipo-etiqueta').value,
        copias: parseInt(document.getElementById('copias-etiqueta').value) || 1,
        tamanho: document.getElementById('tamanho-etiqueta').value,
        observacao: document.getElementById('obs-etiqueta').value || ''
    };
    
    gerarEtiqueta(item, quantidade, motivo, opcoesEtiqueta);
}
    });
}
