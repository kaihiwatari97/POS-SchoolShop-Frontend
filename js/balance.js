requireAdmin();

let students = [];
let balanceStudentId = null;

async function loadStudents() {
    const res = await fetch(`${API}/api/students`, { headers: authHeaders() });
    students = await res.json();
    renderStudents(students);
}

function renderStudents(list) {
    const tbody = document.getElementById('students-table');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-3 text-gray-400">Sin alumnos</td></tr>';
        return;
    }
    tbody.innerHTML = list.map((s, i) => `
        <tr class="border-t dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#262626] ${i % 2 === 0 ? 'dark:bg-[#222]' : 'dark:bg-[#1f1f1f]'}">
            <td class="px-4 py-3 font-semibold dark:text-gray-100">${s.name}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">${s.level || '—'}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">${s.grade ? s.grade + '°' : '—'}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">${s.group || '—'}</td>
            <td class="px-4 py-3">
                <span class="font-semibold ${s.prepaidBalance < 20 ? 'text-orange-500' : 'text-green-600'}">
                    $${s.prepaidBalance}
                </span>
            </td>
            <td class="px-4 py-3">
                <div class="flex gap-2 justify-end">
                    <button onclick="openBalanceModal(${s.id}, '${s.name}', ${s.prepaidBalance})"
                        class="px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700">
                        Cargar saldo
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openBalanceModal(id, name, currentBalance) {
    balanceStudentId = id;
    document.getElementById('balance-modal-name').textContent = name;
    document.getElementById('balance-modal-current').textContent = `$${currentBalance}`;
    document.getElementById('input-add-balance').value = '';
    document.getElementById('balance-modal').classList.remove('hidden');
}

function closeBalanceModal() {
    document.getElementById('balance-modal').classList.add('hidden');
    balanceStudentId = null;
}

async function addBalance() {
    const amount = parseFloat(document.getElementById('input-add-balance').value);
    if (!amount || amount <= 0) { alert('Ingresa un monto válido'); return; }
    const res = await fetch(`${API}/api/students/${balanceStudentId}/balance`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ amount }) });
    if (res.ok) { closeBalanceModal(); loadStudents(); } else { alert('Error al cargar saldo'); }
}

document.getElementById('search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    renderStudents(students.filter(s => s.name.toLowerCase().includes(q)));
});

document.querySelectorAll('input').forEach(input => input.setAttribute('autocomplete', 'off'));
loadStudents();
