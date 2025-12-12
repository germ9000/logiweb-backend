export const state = {
  user: JSON.parse(localStorage.getItem('logiUser')) || null,
  itemsCache: null
};

// Formatar moeda
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Formatar data
export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
}

// Mapear itens
export function mapItems(rows) {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map((row, index) => ({
    id: row[0] || `SKU-${index}`,
    name: row[1] || 'Sem Nome',
    category: row[2] || 'Geral',
    qty: parseInt(row[3]) || 0,
    local: row[4] || 'N/A',
    status: row[5] || 'OK',
    lastUpdate: row[6] || new Date().toISOString(),
    price: Math.floor(Math.random() * (500 - 50 + 1) + 50) // Preço aleatório
  }));
}

// Mostrar/ocultar loader
export function showLoader(show) {
  const loader = document.getElementById('global-loader');
  if (loader) {
    if (show) {
      loader.classList.remove('hidden');
    } else {
      loader.classList.add('hidden');
    }
  }
}

// Mostrar toast
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const colorClass = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? 
    '<i class="fa-solid fa-check-circle"></i>' : 
    '<i class="fa-solid fa-circle-exclamation"></i>';

  toast.className = `fixed top-5 right-5 ${colorClass} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[100] animate-bounce-in transition-all transform duration-500`;
  toast.innerHTML = `${icon} <span class="font-bold">${message}</span>`;
  document.body.appendChild(toast);

  // Remover após 3 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// API Fetch wrapper
export async function apiFetch(endpoint, options = {}) {
  showLoader(true);
  
  try {
    const res = await fetch(endpoint, {
      headers: { 
        'Content-Type': 'application/json',
        ...options.headers 
      },
      ...options
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    showToast(error.message || 'Erro na requisição', 'error');
    throw error;
  } finally {
    showLoader(false);
  }
}
