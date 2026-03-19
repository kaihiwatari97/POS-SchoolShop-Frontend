const isAdmin = getRole() === 'ADMIN';

const sidebarHTML = `
<div class="w-16 flex flex-col items-center py-3 gap-2 h-screen fixed left-0 top-0" style="background:#111111;">
    <div class="w-11 h-11 rounded-lg flex flex-col items-center justify-center mb-1" style="background:#1a1a1a;border:1px solid #2a2a2a;">
        <span style="font-size:11px;font-weight:700;color:#e0e0e0;letter-spacing:1px;line-height:1.2;">POS</span>
        <span style="font-size:7px;color:#666;letter-spacing:1px;">TIENDA</span>
    </div>
    <a href="index.html" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background:${location.pathname.includes('index') || location.pathname.endsWith('/') ? '#2a2a2a' : 'transparent'}">🛒</a>
    ${isAdmin ? `
    <a href="students.html" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background:${location.pathname.includes('students') ? '#2a2a2a' : 'transparent'}">👥</a>
    <a href="inventory.html" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background:${location.pathname.includes('inventory') ? '#2a2a2a' : 'transparent'}">📦</a>
    <a href="reports.html" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background:${location.pathname.includes('reports') ? '#2a2a2a' : 'transparent'}">📊</a>
    <a href="users.html" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background:${location.pathname.includes('users') ? '#2a2a2a' : 'transparent'}">🔑</a>` : ''}
    <div class="flex-1"></div>
    <div style="font-size:9px;color:#555;text-align:center;width:52px;padding:0 4px;line-height:1.3;">
        <div style="color:#888;font-size:10px;margin-bottom:2px;">${getUsername() || ''}</div>
        <div id="terminal-ip" style="background:#1e1e1e;border:1px solid #2a2a2a;border-radius:6px;padding:3px 4px;color:#555;font-size:8px;">...</div>
    </div>
    ${isAdmin ? `
    <a href="settings.html" class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style="background:${location.pathname.includes('settings') ? '#2a2a2a' : 'transparent'}">⚙️</a>` : ''}
    <button onclick="logout()" title="Cerrar sesión"
        class="w-10 h-9 flex items-center justify-center rounded-lg transition-colors" style="background:#7f1d1d;">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" style="color:#fca5a5;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v1"/>
        </svg>
    </button>
</div>
`;

document.getElementById('sidebar').innerHTML = sidebarHTML;

fetch(`${API}/api/terminal/ip`, { headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
        const el = document.getElementById('terminal-ip');
        if (el) el.textContent = data.ip || '—';
    })
    .catch(() => {
        const el = document.getElementById('terminal-ip');
        if (el) el.textContent = 'local';
    });