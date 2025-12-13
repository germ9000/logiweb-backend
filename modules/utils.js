// Função para fazer requisições à API
export async function apiFetch(endpoint, options = {}) {
    // URL BASE para Netlify
    const baseURL = '';
    
    // Se não for uma URL completa, adiciona /api/
    let url = endpoint;
    if (!endpoint.startsWith('http') && !endpoint.startsWith('/api/')) {
        url = `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição ${url}:`, error);
        showToast(error.message || 'Erro de conexão com o servidor', 'error');
        throw error;
    }
}
