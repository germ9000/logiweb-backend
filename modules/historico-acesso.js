import { apiFetch, formatDate } from './utils.js';

export async function renderHistoricoAcesso() {
    const container = document.getElementById('app-content');
    const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
    const isAdmin = user.role === 'admin';

    container.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900">Histórico de Acesso</h2>
                    <p class="text-slate-500">Registro de logins e logouts do sistema.</p>
                </div>
                <div class="flex gap-3">
                    <button id="btn-exportar" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                        <i class="fa-solid fa-file-export mr-2"></i> Exportar CSV
                    </button>
                </div>
            </div>

            <!-- Filtros -->
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Data Inicial</label>
                        <input type="date" id="data-inicio" class="w-full border-slate-300 rounded-lg p-2.5">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Data Final</label>
                        <input type="date" id="data-fim" class="w-full border-slate-300 rounded-lg p-2.5" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    ${isAdmin ? `
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">Usuário</label>
                            <input type="text" id="filtro-usuario" class="w-full border-slate-300 rounded-lg p-2.5" placeholder="Email ou nome">
                        </div>
                    ` : ''}
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1">Ação</label>
                        <select id="filtro-acao" class="w-full border-slate-300 rounded-lg p-2.5">
                            <option value="">Todas</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <button id="btn-filtrar" class="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold">
                        <i class="fa-solid fa-filter mr-2"></i> Filtrar
                    </button>
                </div>
            </div>

            <!-- Tabela de Histórico -->
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                            <tr>
                                <th class="p-4">Data/Hora</th>
                                <th class="p-4">Usuário</th>
                                <th class="p-4">Email</th>
                                <th class="p-4">Permissão</th>
                                <th class="p-4">Ação</th>
                                <th class="p-4">IP</th>
                                <th class="p-4">Dispositivo</th>
                            </tr>
                        </thead>
                        <tbody id="tabela-historico">
                            <tr><td colspan="7" class="p-8 text-center text-slate-400">
                                <i class="fa-solid fa-spinner fa-spin mr-2"></i>Carregando histórico...
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Paginação -->
            <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-sm text-slate-500">
                    Mostrando <span id="total-registros">0</span> registros
                </div>
                <div class="flex gap-2">
                    <button id="btn-anterior" class="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fa-solid fa-chevron-left mr-1"></i> Anterior
                    </button>
                    <span class="px-3 py-1 text-slate-700">Página <span id="pagina-atual">1</span></span>
                    <button id="btn-proxima" class="px-3 py-1 border border-slate-300 rounded-lg text-slate-600">
                        Próxima <i class="fa-solid fa-chevron-right ml-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Carregar histórico
    await carregarHistorico();

    // Configurar eventos
    configurarEventos();
}

async function carregarHistorico(filtros = {}) {
    try {
        const user = JSON.parse(localStorage.getItem('logiUser') || '{}');
        
        // Construir query string
        const params = new URLSearchParams();
        if (filtros.dataInicio) params.append('inicio', filtros.dataInicio);
        if (filtros.dataFim) params.append('fim', filtros.dataFim);
        if (filtros.usuario && user.role === 'admin') params.append('usuario', filtros.usuario);
        if (filtros.acao) params.append('acao', filtros.acao);
        
        // Se não for admin, só mostrar os próprios acessos
        if (user.role !== 'admin') {
            params.append('email', user.email);
        }

        // Nota: Você precisará criar esta API
        // const historico = await apiFetch(`/api/access-history?${params}`);
        
        // Por enquanto, vamos simular dados
        const historico = [
            {
                data: new Date().toISOString(),
                email: user.email,
                nome: user.nome,
                role: user.role,
                acao: 'login',
                ip: '192.168.1.1',
                dispositivo: 'Chrome Windows'
            },
            {
                data: new Date(Date.now() - 86400000).toISOString(),
                email: user.email,
                nome: user.nome,
                role: user.role,
                acao: 'logout',
                ip: '192.168.1.1',
                dispositivo: 'Chrome Windows'
            }
        ];

        renderizarTabela(historico);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        document.getElementById('tabela-historico').innerHTML = `
            <tr><td colspan="7" class="p-4 text-center text-red-500">
                <i class="fa-solid fa-triangle-exclamation mr-2"></i>Erro ao carregar histórico
            </td></tr>`;
    }
}

function renderizarTabela(historico) {
    const tbody = document.getElementById('tabela-historico');
    
    if (!historico || historico.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" class="p-8 text-center text-slate-500">
                <i class="fa-solid fa-clock text-2xl mb-3 block text-slate-300"></i>
                Nenhum registro encontrado.
            </td></tr>`;
        return;
    }

    tbody.innerHTML = historico.map(entry => {
        const data = new Date(entry.data);
        const acaoClass = entry.acao === 'login' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
        
        return `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                <td class="p-4">
                    <div class="font-bold text-slate-800">${data.toLocaleDateString('pt-BR')}</div>
                    <div class="text-xs text-slate-500">${data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</div>
                </td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold">
                            ${entry.nome ? entry.nome.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <span class="font-medium">${entry.nome || 'Desconhecido'}</span>
                    </div>
                </td>
                <td class="p-4 text-slate-600 text-sm">${entry.email || '-'}</td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${entry.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}">
                        ${entry.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${acaoClass}">
                        ${entry.acao === 'login' ? 'LOGIN' : 'LOGOUT'}
                    </span>
                </td>
                <td class="p-4 font-mono text-xs text-slate-500">${entry.ip || '-'}</td>
                <td class="p-4 text-xs text-slate-500 truncate max-w-xs">${entry.dispositivo || '-'}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('total-registros').textContent = historico.length;
}

function configurarEventos() {
    // Filtrar
    document.getElementById('btn-filtrar').addEventListener('click', async () => {
        const filtros = {
            dataInicio: document.getElementById('data-inicio').value,
            dataFim: document.getElementById('data-fim').value,
            usuario: document.getElementById('filtro-usuario')?.value || '',
            acao: document.getElementById('filtro-acao').value
        };
        
        await carregarHistorico(filtros);
    });

    // Exportar CSV
    document.getElementById('btn-exportar').addEventListener('click', exportarCSV);
}

function exportarCSV() {
    // Implementar exportação para CSV
    alert('Funcionalidade de exportação em desenvolvimento!');
}
