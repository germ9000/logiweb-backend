
// modules/utils.js

export const state = {
    user: JSON.parse(localStorage.getItem('logiUser')) || { name: 'Admin', role: 'admin' },
    itemsCache: null
};

// --- FORMATADORES ---
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// --- MAPEAMENTO DE DADOS (Array -> Objeto) ---
export function mapItems(rows) {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map((row, index) => {
        // Gera preço aleatório entre 50 e 500 pois a planilha não tem preço
        const randomPrice = Math.floor(Math.random() * (500 - 50 + 1) + 50);
        
        return {
            id: row[0] || `SKU-${index}`,
            name: row[1] || 'Sem Nome',
            category: row[2] || 'Geral',
            qty: parseInt(row[3]) || 0,
            local: row[4] || 'N/A',
            status: row[5] || 'OK',
            lastUpdate: row[6] || new Date().toISOString(),
            price: randomPrice 
        };
    });
}

// --- UX: LOADER E TOASTS ---
export function showLoader(show) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        if(show) loader.classList.remove('hidden');
        else loader.classList.add('hidden');
    }
}

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colorClass = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    
    toast.className = `fixed top-5 right-5 ${colorClass} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[100] animate-bounce-in transition-all transform duration-500`;
    toast.innerHTML = `${icon} <span class="font-bold">${message}</span>`;
    
    document.body.appendChild(toast);
    
    // Remove após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- API WRAPPER ---
export async function apiFetch(endpoint, options = {}) {
    showLoader(true);
    try {
        const res = await fetch(endpoint, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        
        if (!res.ok) throw new Error(`Erro API: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("API Error", error);
        
        // FALLBACK: Retorna dados falsos se a API falhar (para não travar o teste)
        if(endpoint.includes('items') && options.method !== 'POST') {
            showToast("Modo Offline: Usando dados de teste", "error");
            return [
                ["SKU-001", "Parafusadeira Bosch", "Ferramentas", "12", "Depósito A", "OK", "2023-10-01"],
                ["SKU-002", "Notebook Dell", "Eletrônicos", "3", "TI", "Crítico", "2023-10-05"],
                ["SKU-003", "Cadeira Ergonomica", "Móveis", "45", "Sala 2", "OK", "2023-10-10"]
            ];
        }
        
        showToast(error.message, 'error');
        throw error;
    } finally {
        showLoader(false);
    }
}
