// ============================================================================
// UTILS.JS - Núcleo da Aplicação
// ============================================================================
// Gerenciamento de estado global, formatação, API e dados mockados

// Estado Global
export const state = {
  user: { name: 'Admin', role: 'Gerenciador' },
  items: [],
  historico: [],
  loading: false,
};

// Dados Mockados (fallback caso API falhe)
const mockItems = [
  ['001', 'Furadeira Makita', 'Ferramentas', '5', 'Depósito A', 'OK', '45 dias'],
  ['002', 'Parafuso M8', 'Fixação', '150', 'Prateleira 2', 'OK', '120 dias'],
  ['003', 'Tinta Acrílica 5L', 'Tintas', '8', 'Depósito B', 'Atenção', '15 dias'],
  ['004', 'Cimento Portland', 'Construção', '25', 'Depósito C', 'OK', '60 dias'],
  ['005', 'Cabo HDMI 2m', 'Eletrônicos', '3', 'Prateleira 1', 'Crítico', '5 dias'],
];

const mockHistorico = [
  { id: '001', item: 'Furadeira Makita', tipo: 'Entrada', qtd: 2, motivo: 'Compra', data: '2025-01-10 14:30', usuario: 'João Silva' },
  { id: '002', item: 'Parafuso M8', tipo: 'Saída', qtd: 50, motivo: 'Venda', data: '2025-01-09 10:15', usuario: 'Maria Santos' },
  { id: '003', item: 'Tinta Acrílica 5L', tipo: 'Entrada', qtd: 5, motivo: 'Devolução', data: '2025-01-08 16:45', usuario: 'Pedro Costa' },
  { id: '004', item: 'Cimento Portland', tipo: 'Saída', qtd: 10, motivo: 'Uso Interno', data: '2025-01-07 09:00', usuario: 'Admin' },
  { id: '005', item: 'Cabo HDMI 2m', tipo: 'Entrada', qtd: 1, motivo: 'Compra', data: '2025-01-06 13:20', usuario: 'João Silva' },
];

// ============================================================================
// FORMATAÇÃO
// ============================================================================

/**
 * Formata número para BRL (Real)
 * @param {number} value - Valor a formatar
 * @returns {string} - Valor formatado (ex: "R$ 1.234,56")
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data para DD/MM/YYYY HH:MM
 * @param {string|Date} date - Data a formatar
 * @returns {string} - Data formatada
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================================
// TOAST (Notificações Flutuantes)
// ============================================================================

/**
 * Exibe notificação flutuante no topo da página
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
export function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse`;
  toast.innerHTML = `<span class="text-xl">${icon}</span><span>${message}</span>`;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Cria container para toasts se não existir
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-50 space-y-2';
  document.body.appendChild(container);
  return container;
}

// ============================================================================
// LOADER GLOBAL
// ============================================================================

/**
 * Ativa/desativa loader global
 * @param {boolean} show - true para mostrar, false para esconder
 */
export function setLoading(show) {
  state.loading = show;
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

// ============================================================================
// API FETCH COM TRATAMENTO DE ERRO
// ============================================================================

/**
 * Wrapper do fetch com tratamento de erro e loader
 * @param {string} url - URL da API
 * @param {object} options - Opções do fetch
 * @returns {Promise} - Resposta JSON ou null em caso de erro
 */
export async function apiFetch(url, options = {}) {
  setLoading(true);
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    setLoading(false);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    showToast(`Erro: ${error.message}`, 'error');
    setLoading(false);
    return null;
  }
}

// ============================================================================
// MAPEAMENTO DE DADOS
// ============================================================================

/**
 * Mapeia array de arrays do backend para array de objetos
 * Estrutura esperada: [id, nome, categoria, qtd, local, status, previsao]
 * @param {array} rows - Array de arrays do backend
 * @returns {array} - Array de objetos { id, name, category, qty, local, status, forecast, price }
 */
export function mapItems(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return mockItems.map(row => mapSingleItem(row));
  }

  return rows.map(row => mapSingleItem(row));
}

/**
 * Mapeia uma linha individual
 */
function mapSingleItem(row) {
  const price = Math.floor(Math.random() * (500 - 50 + 1)) + 50; // Preço aleatório R$ 50-500
  
  return {
    id: row[0] || '',
    name: row[1] || '',
    category: row[2] || '',
    qty: parseInt(row[3]) || 0,
    local: row[4] || '',
    status: row[5] || 'OK',
    forecast: row[6] || 'N/A',
    price: price,
  };
}

// ============================================================================
// CARREGAMENTO DE DADOS
// ============================================================================

/**
 * Carrega itens do backend ou usa mock
 */
export async function loadItems() {
  const data = await apiFetch('/api/items');
  
  if (data && data.items) {
    state.items = mapItems(data.items);
  } else {
    state.items = mapItems(mockItems);
  }
  
  return state.items;
}

/**
 * Carrega histórico do backend ou usa mock
 */
export async function loadHistorico() {
  const data = await apiFetch('/api/historico');
  
  if (data && data.historico) {
    state.historico = data.historico;
  } else {
    state.historico = mockHistorico;
  }
  
  return state.historico;
}

// ============================================================================
// OPERAÇÕES DE ESTOQUE
// ============================================================================

/**
 * Registra uma entrada de estoque
 * @param {string} itemId - ID do item
 * @param {number} quantidade - Quantidade
 * @param {string} motivo - Motivo (Compra, Devolução, etc)
 * @returns {Promise} - Resultado da operação
 */
export async function registrarEntrada(itemId, quantidade, motivo) {
  const payload = {
    action: 'entrada',
    id: itemId,
    quantidade: parseInt(quantidade),
    motivo: motivo,
    data: new Date().toISOString(),
  };

  const result = await apiFetch('/api/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result && result.ok) {
    showToast('Entrada registrada com sucesso!', 'success');
    await loadItems();
    await loadHistorico();
    return true;
  }

  return false;
}

/**
 * Registra uma saída de estoque
 * @param {string} itemId - ID do item
 * @param {number} quantidade - Quantidade
 * @param {string} motivo - Motivo (Venda, Uso Interno, Perda)
 * @returns {Promise} - Resultado da operação
 */
export async function registrarSaida(itemId, quantidade, motivo) {
  // Validação crítica
  const item = state.items.find(i => i.id === itemId);
  if (!item || item.qty < parseInt(quantidade)) {
    showToast('Quantidade insuficiente em estoque!', 'error');
    return false;
  }

  const payload = {
    action: 'saida',
    id: itemId,
    quantidade: parseInt(quantidade),
    motivo: motivo,
    data: new Date().toISOString(),
  };

  const result = await apiFetch('/api/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result && result.ok) {
    showToast('Saída registrada com sucesso!', 'success');
    await loadItems();
    await loadHistorico();
    return true;
  }

  return false;
}

// ============================================================================
// CÁLCULOS E ANÁLISES
// ============================================================================

/**
 * Calcula valor total em estoque
 * @returns {number} - Valor total
 */
export function calcularValorTotal() {
  return state.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
}

/**
 * Conta itens críticos (qty < 5)
 * @returns {number} - Quantidade de itens críticos
 */
export function contarItensCriticos() {
  return state.items.filter(item => item.qty < 5).length;
}

/**
 * Conta total de SKUs
 * @returns {number} - Total de SKUs
 */
export function contarTotalSKUs() {
  return state.items.length;
}

/**
 * Agrupa itens por categoria para gráfico
 * @returns {object} - { labels: [], data: [] }
 */
export function agruparPorCategoria() {
  const grouped = {};
  
  state.items.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = 0;
    }
    grouped[item.category] += item.qty;
  });

  return {
    labels: Object.keys(grouped),
    data: Object.values(grouped),
  };
}

/**
 * Retorna últimos N itens do histórico
 * @param {number} limit - Quantidade de itens
 * @returns {array} - Últimos itens
 */
export function getUltimosItens(limit = 5) {
  return state.historico.slice(0, limit);
}
