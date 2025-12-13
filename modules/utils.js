// Função para fazer requisições à API
export async function apiFetch(endpoint, options = {}) {
    console.log('API Fetch:', endpoint);
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(endpoint, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição ${endpoint}:`, error);
        showToast(error.message || 'Erro de conexão', 'error');
        throw error;
    }
}

// Função para exibir notificações/toast
export function showToast(message, type = 'info') {
    console.log('Toast:', message, type);
    
    // Remove toast existente
    const existingToast = document.getElementById('global-toast');
    if (existingToast) existingToast.remove();

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Remover após 5 segundos
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
}

// Função para mostrar/esconder loader global
export function showLoader(show = true) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }
}
