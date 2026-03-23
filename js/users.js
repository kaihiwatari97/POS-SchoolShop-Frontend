requireAdmin();

async function loadUsers() {
    const res = await fetch(`${API}/api/auth/users`, { headers: authHeaders() });
    const users = await res.json();
    const tbody = document.getElementById('users-table');
    const currentUsername = getUsername();
    tbody.innerHTML = users.map((u, i) => `
        <tr class="border-t dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#262626] ${i % 2 === 0 ? 'dark:bg-[#222]' : 'dark:bg-[#1f1f1f]'}">
            <td class="px-4 py-3 font-semibold dark:text-gray-100">${u.username}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400'}">
                    ${u.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
                </span>
            </td>
            <td class="px-4 py-3">
                <div class="flex justify-end">
                    ${u.username !== currentUsername ? `
                    <button onclick="deleteUser(${u.id})" class="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Eliminar</button>
                    ` : '<span class="text-xs text-gray-400">Tú</span>'}
                </div>
            </td>
        </tr>
    `).join('');
}

function openUserModal() {
    document.getElementById('input-username').value = '';
    document.getElementById('input-password').value = '';
    document.getElementById('input-role').value = 'EMPLOYEE';
    document.getElementById('user-modal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
}

async function saveUser() {
    const username = document.getElementById('input-username').value;
    const password = document.getElementById('input-password').value;
    const role = document.getElementById('input-role').value;
    if (!username || !password) { alert('Usuario y contraseña son obligatorios'); return; }
    const res = await fetch(`${API}/api/auth/users`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ username, password, role }) });
    const data = await res.json();
    if (res.ok) { closeUserModal(); loadUsers(); } else { alert(data.error || 'Error al crear usuario'); }
}

async function deleteUser(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    const res = await fetch(`${API}/api/auth/users/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) { loadUsers(); } else { alert('Error al eliminar usuario'); }
}

document.querySelectorAll('input').forEach(input => input.setAttribute('autocomplete', 'off'));
loadUsers();
