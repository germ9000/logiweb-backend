import { apiFetch, showToast } from './utils.js';

let todosItens = []; // Cache dos itens

export async function renderSaidas() {
  const container = document.getElementById('app-content');
  
  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6 pb-10 animate-fade-in">
      <div>
        <nav class="text-sm text-slate-400 mb-1">Operação / Saídas</nav>
        <h2 class="text-2xl font-bold text-slate-900">Registrar Saída</h2>
        <p class="text-slate-500">Registre a retirada de itens do estoque.</p>
      </div>

      <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <form id="form-saida" class="space-y-5">
          <!-- Campo para buscar/ selecionar item -->
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">
              Buscar Item
            </label>
            <div class="relative">
              <input 
                type="text" 
                id="buscar-item" 
                class="w-full border-slate-300 rounded-lg p-2.5 bg-slate-50"
                placeholder="Digite o nome ou ID do item..."
                autocomplete="off"
              >
              <div id="sugestoes-itens" class="hidden absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"></div>
            </div>
          </div>

          <!-- Informações do item selecionado -->
          <div id="info-item" class="hidden p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div class="flex items-start justify-between">
              <div>
                <h3 id="item-nome" class="font-bold text-slate-800 text-lg"></h3>
                <div class="flex items-center gap-4 mt-2">
                  <span id="item-id" class="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded"></span>
                  <span id="item-categoria" class="text-sm text-slate-500"></span>
                  <span id="item-local" class="text-sm text-slate-500"></span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-slate-800" id="item-estoque"></div>
                <div class="text-xs text-slate-500">Estoque disponível</div>
              </div>
            </div>
            <input type="hidden" id="item-selecionado-id">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">
                Quantidade *
              </label>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-menos" class="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold">
                  -
                </button>
                <input 
                  type="number" 
                  id="quantidade" 
                  class="flex-1 border-slate-300 rounded-lg p-2.5 text-center font-bold text-xl"
                  min="1" 
                  value="1" 
                  required
                >
                <button type="button" id="btn-mais" class="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold">
                  +
                </button>
              </div>
              <div class="mt-2">
                <span class="text-sm text-slate-500">
                  Estoque restante: <span id="estoque-restante" class="font-bold">0</span>
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">
                Data da Saída
              </label>
              <input 
                type="date" 
                id="data-saida" 
                class="w-full border-slate-300 rounded-lg p-2.5"
                required
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">
              Motivo da Saída *
            </label>
            <select 
              id="motivo" 
              class="w-full border-slate-300 rounded-lg p-2.5 bg-white"
              required
            >
              <option value="">Selecione um motivo...</option>
              <option value="Venda">Venda</option>
              <option value="Consumo Interno">Consumo Interno</option>
              <option value="Perda/Avaria">Perda/Avaria</option>
              <option value="Transferência">Transferência</option>
              <option value="Devolução">Devolução</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div id="campo-outro-motivo" class="hidden">
            <label class="block text-sm font-bold text-slate-700 mb-1">
              Especifique o motivo
            </label>
            <input 
              type="text" 
              id="outro-motivo" 
              class="w-full border-slate-300 rounded-lg p-2.5"
              placeholder="Digite o motivo da saída..."
            >
          </div>

          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">
              Observações (Opcional)
            </label>
            <textarea 
              id="observacoes" 
              rows="3" 
              class="w-full border-slate-300 rounded-lg p-2.5"
              placeholder="Detalhes adicionais sobre a saída..."
            ></textarea>
          </div>

          <div class="pt-6 border-t border-slate-200 flex justify-end gap-3">
            <button 
              type="button" 
              id="btn-cancelar"
              class="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition flex items-center gap-2"
            >
              <i class="fa-solid fa-arrow-up-from-bracket"></i>
              Confirmar Saída
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Configurar data atual
  document.getElementById('data-saida').valueAsDate = new Date();

  // Carregar itens
  await carregarItens();

  // Configurar eventos
  configurarEventos();
}

async function carregarItens() {
  try {
    showToast('Carregando itens...', 'info');
    const data = await apiFetch('/api/items');
    
    // Mapear os dados da planilha para objetos
    todosItens = data.map(row => ({
      id: row[0] || '',
      nome: row[1] || 'Sem nome',
      categoria: row[2] || 'Geral',
      quantidade: parseInt(row[3]) || 0,
      local: row[4] || 'N/A',
      status: row[5] || 'OK',
      ultimaAtualizacao: row[6] || ''
    })).filter(item => item.quantidade > 0); // Mostrar apenas itens com estoque
    
    console.log('Itens carregados:', todosItens.length);
  } catch (error) {
    console.error('Erro ao carregar itens:', error);
    showToast('Erro ao carregar itens do estoque', 'error');
  }
}

function configurarEventos() {
  const form = document.getElementById('form-saida');
  const buscarInput = document.getElementById('buscar-item');
  const sugestoesDiv = document.getElementById('sugestoes-itens');
  const motivoSelect = document.getElementById('motivo');
  const btnMenos = document.getElementById('btn-menos');
  const btnMais = document.getElementById('btn-mais');
  const quantidadeInput = document.getElementById('quantidade');
  const btnCancelar = document.getElementById('btn-cancelar');

  // Buscar item
  buscarInput.addEventListener('input', () => {
    const termo = buscarInput.value.toLowerCase().trim();
    
    if (termo.length < 2) {
      sugestoesDiv.classList.add('hidden');
      return;
    }

    const resultados = todosItens.filter(item => 
      item.nome.toLowerCase().includes(termo) || 
      item.id.toLowerCase().includes(termo)
    ).slice(0, 10); // Limitar a 10 resultados

    if (resultados.length === 0) {
      sugestoesDiv.innerHTML = `
        <div class="p-3 text-slate-500 text-sm">
          Nenhum item encontrado
        </div>
      `;
      sugestoesDiv.classList.remove('hidden');
      return;
    }

    sugestoesDiv.innerHTML = resultados.map(item => `
      <div 
        class="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
        data-id="${item.id}"
        data-nome="${item.nome}"
        data-categoria="${item.categoria}"
        data-local="${item.local}"
        data-estoque="${item.quantidade}"
      >
        <div class="font-bold text-slate-800">${item.nome}</div>
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>${item.id}</span>
          <span class="font-bold ${item.quantidade < 5 ? 'text-red-600' : 'text-green-600'}">
            Estoque: ${item.quantidade}
          </span>
        </div>
      </div>
    `).join('');

    sugestoesDiv.classList.remove('hidden');
  });

  // Selecionar item das sugestões
  sugestoesDiv.addEventListener('click', (e) => {
    const itemDiv = e.target.closest('[data-id]');
    if (!itemDiv) return;

    const item = {
      id: itemDiv.dataset.id,
      nome: itemDiv.dataset.nome,
      categoria: itemDiv.dataset.categoria,
      local: itemDiv.dataset.local,
      estoque: parseInt(itemDiv.dataset.estoque)
    };

    // Preencher informações
    document.getElementById('item-nome').textContent = item.nome;
    document.getElementById('item-id').textContent = item.id;
    document.getElementById('item-categoria').textContent = `Categoria: ${item.categoria}`;
    document.getElementById('item-local').textContent = `Local: ${item.local}`;
    document.getElementById('item-estoque').textContent = item.estoque;
    document.getElementById('item-selecionado-id').value = item.id;
    document.getElementById('buscar-item').value = `${item.nome} (${item.id})`;

    // Configurar quantidade máxima
    quantidadeInput.max = item.estoque;
    quantidadeInput.value = Math.min(1, item.estoque);
    
    // Calcular estoque restante
    calcularEstoqueRestante();

    // Mostrar informações do item
    document.getElementById('info-item').classList.remove('hidden');
    sugestoesDiv.classList.add('hidden');

    showToast(`Item "${item.nome}" selecionado`, 'success');
  });

  // Esconder sugestões ao clicar fora
  document.addEventListener('click', (e) => {
    if (!buscarInput.contains(e.target) && !sugestoesDiv.contains(e.target)) {
      sugestoesDiv.classList.add('hidden');
    }
  });

  // Controle de quantidade
  btnMenos.addEventListener('click', () => {
    let valor = parseInt(quantidadeInput.value) || 1;
    if (valor > 1) {
      quantidadeInput.value = valor - 1;
      calcularEstoqueRestante();
    }
  });

  btnMais.addEventListener('click', () => {
    let valor = parseInt(quantidadeInput.value) || 0;
    const max = parseInt(quantidadeInput.max) || 9999;
    if (valor < max) {
      quantidadeInput.value = valor + 1;
      calcularEstoqueRestante();
    } else {
      showToast(`Quantidade máxima: ${max}`, 'error');
    }
  });

  quantidadeInput.addEventListener('change', () => {
    calcularEstoqueRestante();
  });

  // Motivo "Outro"
  motivoSelect.addEventListener('change', () => {
    const outroCampo = document.getElementById('campo-outro-motivo');
    if (motivoSelect.value === 'Outro') {
      outroCampo.classList.remove('hidden');
      document.getElementById('outro-motivo').required = true;
    } else {
      outroCampo.classList.add('hidden');
      document.getElementById('outro-motivo').required = false;
    }
  });

  // Cancelar
  btnCancelar.addEventListener('click', () => {
    if (confirm('Deseja cancelar esta saída? Os dados preenchidos serão perdidos.')) {
      form.reset();
      document.getElementById('info-item').classList.add('hidden');
      document.getElementById('data-saida').valueAsDate = new Date();
      document.getElementById('buscar-item').value = '';
    }
  });

  // Enviar formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemId = document.getElementById('item-selecionado-id').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const motivo = document.getElementById('motivo').value;
    const outroMotivo = document.getElementById('outro-motivo').value;
    const observacoes = document.getElementById('observacoes').value;
    const data = document.getElementById('data-saida').value;

    // Validações
    if (!itemId) {
      showToast('Selecione um item primeiro', 'error');
      return;
    }

    if (isNaN(quantidade) || quantidade <= 0) {
      showToast('Quantidade inválida', 'error');
      return;
    }

    if (!motivo) {
      showToast('Selecione o motivo da saída', 'error');
      return;
    }

    if (motivo === 'Outro' && !outroMotivo.trim()) {
      showToast('Especifique o motivo da saída', 'error');
      return;
    }

    const item = todosItens.find(i => i.id === itemId);
    if (quantidade > item.quantidade) {
      showToast(`Quantidade indisponível. Estoque: ${item.quantidade}`, 'error');
      return;
    }

    // Confirmação final
    if (!confirm(`Confirmar saída de ${quantidade}x ${item.nome}?`)) {
      return;
    }

    try {
      showToast('Processando saída...', 'info');
      
      const payload = {
        action: 'saida',
        id: itemId,
        nome: item.nome,
        quantidade: quantidade,
        motivo: motivo === 'Outro' ? outroMotivo : motivo,
        observacoes: observacoes,
        data: data,
        usuario: JSON.parse(localStorage.getItem('logiUser') || '{}').nome || 'Usuário'
      };

      const resultado = await apiFetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast(resultado.message || 'Saída registrada com sucesso!', 'success');
      
      // Resetar formulário
      form.reset();
      document.getElementById('info-item').classList.add('hidden');
      document.getElementById('data-saida').valueAsDate = new Date();
      document.getElementById('buscar-item').value = '';
      
      // Recarregar itens (estoque atualizado)
      await carregarItens();
      
      // Se quiser redirecionar para dashboard após sucesso:
      // setTimeout(() => navigateTo('dashboard'), 2000);
      
    } catch (error) {
      // Erro já tratado no apiFetch
    }
  });
}

function calcularEstoqueRestante() {
  const estoqueAtual = parseInt(document.getElementById('item-estoque').textContent) || 0;
  const quantidade = parseInt(document.getElementById('quantidade').value) || 0;
  
  if (estoqueAtual > 0) {
    const restante = estoqueAtual - quantidade;
    const estoqueRestante = document.getElementById('estoque-restante');
    estoqueRestante.textContent = restante;
    
    // Colorir conforme disponibilidade
    if (restante < 0) {
      estoqueRestante.classList.add('text-red-600');
      estoqueRestante.classList.remove('text-green-600', 'text-yellow-600');
    } else if (restante < 5) {
      estoqueRestante.classList.add('text-yellow-600');
      estoqueRestante.classList.remove('text-green-600', 'text-red-600');
    } else {
      estoqueRestante.classList.add('text-green-600');
      estoqueRestante.classList.remove('text-red-600', 'text-yellow-600');
    }
  }
}
