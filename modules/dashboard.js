import { apiFetch, showToast } from './utils.js';

export async function render() {
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-7xl mx-auto space-y-6 pb-10 animate-fade-in">
            <div>
                <nav class="text-sm text-slate-400 mb-1">Home / Dashboard</nav>
                <h2 class="text-2xl font-bold text-slate-900">Painel de Controle</h2>
                <p class="text-slate-500">Visão geral do seu estoque e movimentações.</p>
            </div>
            
            <!-- Estatísticas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-slate-500">Itens em Estoque</p>
                            <p id="total-itens" class="text-2xl font-bold text-slate-800">--</p>
                        </div>
                        <i class="fa-solid fa-box text-3xl text-slate-300"></i>
                    </div>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-slate-500">Total de Categorias</p>
                            <p id="total-categorias" class="text-2xl font-bold text-slate-800">--</p>
                        </div>
                        <i class="fa-solid fa-tags text-3xl text-slate-300"></i>
                    </div>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-slate-500">Entradas (30 dias)</p>
                            <p id="entradas-30dias" class="text-2xl font-bold text-slate-800">--</p>
                        </div>
                        <i class="fa-solid fa-arrow-down text-3xl text-green-300"></i>
                    </div>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-slate-500">Saídas (30 dias)</p>
                            <p id="saidas-30dias" class="text-2xl font-bold text-slate-800">--</p>
                        </div>
                        <i class="fa-solid fa-arrow-up text-3xl text-red-300"></i>
                    </div>
                </div>
            </div>
            
            <!-- Gráficos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold text-slate-800 mb-4">Movimentações Recentes</h3>
                    <div class="h-64">
                        <canvas id="movements-chart"></canvas>
                    </div>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold text-slate-800 mb-4">Itens com Baixo Estoque</h3>
                    <div id="low-stock-items" class="space-y-3">
                        <p class="text-slate-400 text-center py-8">Carregando...</p>
                    </div>
                </div>
            </div>
            
            <!-- Tabela de Movimentações Recentes -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="p-5 border-b border-slate-100">
                    <h3 class="font-bold text-slate-800">Últimas Movimentações</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th class="p-4 text-left">Data/Hora</th>
                                <th class="p-4 text-left">Item</th>
                                <th class="p-4 text-left">Tipo</th>
                                <th class="p-4 text-left">Quantidade</th>
                                <th class="p-4 text-left">Motivo</th>
                            </tr>
                        </thead>
                        <tbody id="recent-movements" class="divide-y divide-slate-100">
                            <tr><td colspan="5" class="p-4 text-center text-slate-400">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Carregar dados
    await loadDashboardData();
}

async function loadDashboardData() {
    try {
        // Carregar itens, categorias e movimentações
        const [items, categories, movements] = await Promise.all([
            apiFetch('/api/items'),
            apiFetch('/api/categories'),
            apiFetch('/api/movements')
        ]);
        
        // Atualizar estatísticas
        document.getElementById('total-itens').textContent = items.length;
        document.getElementById('total-categorias').textContent = categories.length;
        
        // Calcular entradas e saídas dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentMovements = movements.filter(m => new Date(m.data) >= thirtyDaysAgo);
        const entradas = recentMovements.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.quantidade, 0);
        const saidas = recentMovements.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.quantidade, 0);
        
        document.getElementById('entradas-30dias').textContent = entradas;
        document.getElementById('saidas-30dias').textContent = saidas;
        
        // Gráfico de movimentações
        renderMovementsChart(recentMovements);
        
        // Itens com baixo estoque (menos de 5 unidades)
        const lowStock = items.filter(item => parseInt(item[3]) < 5);
        const lowStockContainer = document.getElementById('low-stock-items');
        
        if (lowStock.length === 0) {
            lowStockContainer.innerHTML = '<p class="text-slate-400 text-center py-8">Nenhum item com estoque baixo</p>';
        } else {
            lowStockContainer.innerHTML = lowStock.map(item => `
                <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                        <p class="font-bold text-slate-800">${item[1]}</p>
                        <p class="text-xs text-slate-500">${item[0]} • ${item[2]}</p>
                    </div>
                    <span class="font-bold text-red-600">${item[3]} unidades</span>
                </div>
            `).join('');
        }
        
        // Tabela de movimentações recentes (últimas 10)
        const recentTable = document.getElementById('recent-movements');
        const last10 = movements.slice(0, 10);
        
        if (last10.length === 0) {
            recentTable.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">Sem movimentações recentes</td></tr>';
        } else {
            recentTable.innerHTML = last10.map(m => `
                <tr>
                    <td class="p-4 text-sm">${new Date(m.data).toLocaleString('pt-BR')}</td>
                    <td class="p-4">
                        <div class="font-bold text-slate-800">${m.nomeItem}</div>
                        <div class="text-xs text-slate-500">${m.itemId}</div>
                    </td>
                    <td class="p-4">
                        <span class="text-xs font-bold px-2 py-1 rounded ${m.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                            ${m.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                    </td>
                    <td class="p-4 font-bold ${m.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}">
                        ${m.tipo === 'entrada' ? '+' : '-'}${m.quantidade}
                    </td>
                    <td class="p-4 text-sm text-slate-600">${m.motivo}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        showToast('Erro ao carregar dados do dashboard', 'error');
    }
}

function renderMovementsChart(movements) {
    const ctx = document.getElementById('movements-chart').getContext('2d');
    
    // Agrupar por dia
    const dailyData = {};
    movements.forEach(m => {
        const date = new Date(m.data).toLocaleDateString('pt-BR');
        if (!dailyData[date]) {
            dailyData[date] = { entrada: 0, saida: 0 };
        }
        dailyData[date][m.tipo] += m.quantidade;
    });
    
    const labels = Object.keys(dailyData).slice(-7); // Últimos 7 dias
    const entradaData = labels.map(date => dailyData[date].entrada);
    const saidaData = labels.map(date => dailyData[date].saida);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradaData,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                },
                {
                    label: 'Saídas',
                    data: saidaData,
                    backgroundColor: '#ef4444',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    }
                }
            }
        }
    });
}
