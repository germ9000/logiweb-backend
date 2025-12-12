export const state = { user: JSON.parse(localStorage.getItem('logiUser')) || null };

export function showLoader(show) {
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

export async function apiFetch(endpoint, options = {}) {
    showLoader(true);
    try {
        const res = await fetch(endpoint, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Erro na API');
        return await res.json();
    } catch (error) {
        alert("Erro: " + error.message);
        throw error;
    } finally {
        showLoader(false);
    }
}

export function formatCurrency(val) { return new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(val); }
