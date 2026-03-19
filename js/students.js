requireAdmin();

let students = [];
let editingId = null;
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
                    <button onclick="openStudentModal(${s.id})"
                        class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
                        Editar
                    </button>
                    <button onclick="deleteStudent(${s.id})"
                        class="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openStudentModal(id = null) {
    editingId = id;
    document.getElementById('modal-title').textContent = id ? 'Editar alumno' : 'Agregar alumno';
    if (id) {
        const s = students.find(s => s.id === id);
        document.getElementById('input-name').value = s.name;
        document.getElementById('input-grade').value = s.grade || '';
        document.getElementById('input-level').value = s.level || '';
        document.getElementById('input-group').value = s.group || '';
        document.getElementById('input-balance').value = s.prepaidBalance;
    } else {
        document.getElementById('input-name').value = '';
        document.getElementById('input-grade').value = '';
        document.getElementById('input-level').value = '';
        document.getElementById('input-group').value = '';
        document.getElementById('input-balance').value = '';
    }
    document.getElementById('student-modal').classList.remove('hidden');
}

function closeStudentModal() {
    document.getElementById('student-modal').classList.add('hidden');
    editingId = null;
}

async function saveStudent() {
    const body = {
        name: document.getElementById('input-name').value,
        grade: document.getElementById('input-grade').value,
        level: document.getElementById('input-level').value,
        group: document.getElementById('input-group').value,
        prepaidBalance: parseFloat(document.getElementById('input-balance').value) || 0
    };
    if (!body.name) { alert('El nombre es obligatorio'); return; }
    const url = editingId ? `${API}/api/students/${editingId}` : `${API}/api/students`;
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
    if (res.ok) { closeStudentModal(); loadStudents(); } else { alert('Error al guardar alumno'); }
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
    const student = students.find(s => s.id === balanceStudentId);
    const body = { name: student.name, grade: student.grade, level: student.level, group: student.group, prepaidBalance: student.prepaidBalance + amount };
    const res = await fetch(`${API}/api/students/${balanceStudentId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
    if (res.ok) { closeBalanceModal(); loadStudents(); } else { alert('Error al cargar saldo'); }
}

async function deleteStudent(id) {
    if (!confirm('¿Eliminar este alumno?')) return;
    const res = await fetch(`${API}/api/students/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) { loadStudents(); } else { alert('Error al eliminar alumno'); }
}

document.getElementById('search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    renderStudents(students.filter(s => s.name.toLowerCase().includes(q)));
});

loadStudents();