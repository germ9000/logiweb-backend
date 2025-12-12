
// modules/dashboard.js
import { apiFetch, mapItems, formatCurrency, showToast } from './utils.js';

let chartInstance = null; // Para destruir o gráfico antes de recriar

export async function renderDashboard() {
    const container = document.getElementById('app-content');
    
    // Skeleton Loading Inicial
    container.innerHTML = `<div class="p-10 text-center text-slate-400"><i class="fa-solid fa-circle-notch fa-spin text-3xl"></i><p>Carregando métricas...</p></div>`;

    try {
        const rawData = await apiFetch('/api/items');
        const items = mapItems(rawData);

        // 1. Cálculos de KPI
        const totalItems = items.length;
        const totalValue = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
        const criticalItems = items.filter(i => i.qty < 5).length;

        // 2. HTML do Dashboard
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in pb-10">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">Visão Geral</h2>
                        <p class="text-slate-500 text-sm">Monitoramento em tempo real do estoque.</p>
                    </div>
                    <button onclick="navigateTo('saidas')" class="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-brand-500/20 transition">
                        <i class="fa-solid fa-arrow-up-from-bracket mr-2"></i> Nova Saída
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition text-brand-600 text-6xl"><i class="fa-solid fa-boxes-stacked"></i></div>
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total SKUs</p>
                        <h3 class="text-3xl font-bold text-slate-800 mt-1">${totalItems}</h3>
                        <span class="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">+ Novos itens</span>
                    </div>

                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition text-green-600 text-6xl"><i class="fa-solid fa-sack-dollar"></i></div>
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor em Estoque</p>
                        <h3 class="text-3xl font-bold text-slate-800 mt-1">${formatCurrency(totalValue)}</h3>
                        <span class="text-xs text-slate-400 mt-2 inline-block">Estimativa baseada em custo médio</span>
                    </div>

                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition ${criticalItems > 0 ? 'border-l-4 border-l-red-500' : ''}">
                        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition text-red-500 text-6xl"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Itens Críticos</p>
                        <h3 class="text-3xl font-bold ${criticalItems > 0 ? 'text-red-600' : 'text-slate-800'} mt-1">${criticalItems}</h3>
                        <span class="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full mt-2 inline-block">Requer atenção</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-800 mb-4">Distribuição por Categoria</h4>
                        <div class="h-64 w-full">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 class="font-bold text-slate-800 mb-4">Últimas Movimentações</h4>
                        <div class="space-y-3">
                            ${items.slice(0, 5).map(item => `
                                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                                    <div class="w-10 h-10 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                                        ${item.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-bold text-slate-800 truncate">${item.name}</p>
                                        <p class="text-xs text-slate-500">${item.local}</p>
                                    </div>
                                    <span class="text-xs font-bold ${item.qty < 5 ? 'text-red-500' : 'text-slate-600'}">${item.qty} un</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 3. Renderizar Gráfico
        renderChart(items);

    } catch (e) {
        container.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg">Erro ao carregar dashboard: ${e.message}</div>`;
    }
}

function renderChart(items) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Prepara dados (Agrupa por categoria)
    const categories = {};
    items.forEach(i => { categories[i.category] = (categories[i.category] || 0) + 1 });

    if (chartInstance) chartInstance.destroy(); // Limpa anterior

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#1a73e8', '#ef4444', '#f59e0b', '#10b981', '#6366f1'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}
