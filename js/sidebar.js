const sidebarHTML = `
<div class="w-16 bg-gray-900 flex flex-col items-center py-4 gap-6 h-screen fixed left-0 top-0">
    <a href="index.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('index') || location.pathname.endsWith('/') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">🛒</span>
    </a>
    <a href="students.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('students') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">👥</span>
    </a>
    <a href="inventory.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('inventory') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">📦</span>
    </a>
    <a href="reports.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('reports') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">📊</span>
    </a>
    <div class="flex-1"></div>
    <div class="text-gray-400 text-xs text-center w-12 truncate px-1">${getUsername() || ''}</div>
    <a href="settings.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('settings') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">⚙️</span>
    </a>
    <button onclick="logout()" title="Cerrar sesión"
        class="w-12 h-10 flex items-center justify-center rounded-lg bg-rose-800 hover:bg-rose-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v1"/>
        </svg>
    </button>
</div>
`;

document.getElementById('sidebar').innerHTML = sidebarHTML;