const sidebarHTML = `
<div class="w-16 bg-gray-900 flex flex-col items-center py-4 gap-6 h-screen fixed left-0 top-0">
    <a href="index.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('index') || location.pathname.endsWith('/') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">🛒</span>
    </a>
    <a href="students.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('students') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">👥</span>
    </a>
    <a href="reports.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('reports') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">📊</span>
    </a>
    <div class="flex-1"></div>
    <a href="settings.html" class="p-2 rounded-lg w-12 flex items-center justify-center ${location.pathname.includes('settings') ? 'bg-gray-700' : 'hover:bg-gray-700'}">
        <span class="text-xl">⚙️</span>
    </a>
</div>
`;

document.getElementById('sidebar').innerHTML = sidebarHTML;