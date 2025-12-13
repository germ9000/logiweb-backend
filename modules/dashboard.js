import { apiFetch, showToast } from './utils.js';

export async function render() {
    console.log('Renderizando dashboard...');
    
    const container = document.getElementById('app-content');
    
    container.innerHTML = `
        <div class="max-w-7xl mx-auto space-y-6 pb-10">
            <div>
                <nav class="text-sm text-slate-400 mb-1">Home / Dashboard</nav>
                <h2 class="text-2xl font-bold text-slate-900">Painel de Controle</h2>
                <p class="text-slate-500">Bem-vindo ao LogiTrack!</p>
            </div>
            
            <!-- Estatísticas -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-slate-500">Itens em Estoque</p>
                            <p id="total-itens" class="text-2xl font-bold text-slate-800">Carregando...</p>
                        </div>
                        <i class="fa-solid fa-box text-3xl text-slate-300"></i>
                    </div>
                </div>
                
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-slate-500">Status do Sistema</p>
                            <p class="text-2xl font-bold text-green-600">Online</p>
                        </div>
                        <i class="fa-solid fa-wifi text-3xl text-green-300"></i>
                    </div>
                </div>
            </div>
            
            <!-- Ações Rápidas -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 class="font-bold text-slate-800 mb-4">Ações Rápidas</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onclick="navigateTo('entradas')" 
                            class="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-bold text-center">
                        <i class="fa-solid fa-arrow-down text-xl mb-2"></i><br>
                        Nova Entrada
                    </button>
                    
                    <button onclick="navigateTo('saidas')" 
                            class="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-bold text-center">
                        <i class="fa-solid fa-arrow-up text-xl mb-2"></i><br>
                        Nova Saída
                    </button>
                    
                    <button onclick="navigateTo('estoque')" 
                            class="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-bold text-center">
                        <i class="fa-solid fa-boxes-stacked text-xl mb-2"></i><br>
                        Ver Estoque
                    </button>
                    
                    <button onclick="navigateTo('perfil')" 
                            class="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-bold text-center">
                        <i class="fa-solid fa-users-gear text-xl mb-2"></i><br>
                        Perfis
                    </button>
                </div>
            </div>
            
            <!-- Mensagem de boas-vindas -->
            <div class="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-8 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-bold mb-2">Olá, <span id="welcome-name">Usuário</span>!</h3>
                        <p>Seu sistema de gestão de estoque está pronto para uso.</p>
                    </div>
                    <i class="fa-solid fa-rocket text-5xl opacity-50"></i>
                </div>
            </div>
        </div>
    `;
    
    // Carregar nome do usuário
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    if (user.nome) {
        document.getElementById('welcome-name').textContent = user.nome;
    }
    
    // Tentar carregar dados
    try {
        const items = await apiFetch('/api/items');
        if (items && Array.isArray(items)) {
            document.getElementById('total-itens').textContent = items.length;
        }
    } catch (error) {
        console.log('Não foi possível carregar itens, mas a página funciona');
    }
}
