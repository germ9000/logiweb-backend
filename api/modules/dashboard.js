export function renderDashboard() {
    document.getElementById('app-content').innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <h2 class="text-2xl font-bold text-slate-800">Dashboard</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p class="text-xs text-slate-500 uppercase">Status</p>
                    <h3 class="text-2xl font-bold text-green-600">Sistema Online</h3>
                </div>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl shadow-sm h-96 relative overflow-hidden">
                <div class="absolute inset-0 flex items-center justify-center text-slate-400">Carregando Gráficos...</div>
                <iframe src="" frameborder="0" class="w-full h-full absolute inset-0"></iframe> 
            </div>
        </div>
    `;
}
