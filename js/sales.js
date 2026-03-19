let products = [];
let order = [];
let paymentMethod = 'CASH';
let selectedStudent = null;

async function loadProducts() {
    const res = await fetch(`${API}/api/products`);
    products = await res.json();
    renderProducts(products);
}

async function loadRecentStudents() {
    const res = await fetch(`${API}/api/students`);
    const students = await res.json();
    const recent = students.slice(0, 4);
    const container = document.getElementById('recent-students');
    container.innerHTML = recent.map(s => `
        <div onclick="selectStudent(${s.id}, '${s.name}', ${s.prepaidBalance})"
            class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0 flex justify-between items-center">
            <span class="font-semibold text-sm">${s.name}</span>
            <span class="text-xs ${s.prepaidBalance < 20 ? 'text-orange-500' : 'text-green-600'}">$${s.prepaidBalance}</span>
        </div>
    `).join('');
}

function renderProducts(list) {
    const tbody = document.getElementById('products-table');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-gray-400">Sin resultados</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(p => `
        <tr class="border-t hover:bg-gray-50 ${p.stock === 0 ? 'opacity-50' : ''}">
            <td class="px-4 py-3">
                <div class="font-semibold">${p.name}</div>
                <div class="text-gray-400 text-xs">${p.description}</div>
                ${p.stock <= 5 ? `<div class="text-red-500 text-xs">Solo quedan ${p.stock}</div>` : ''}
            </td>
            <td class="px-4 py-3 font-semibold">$${p.price}</td>
            <td class="px-4 py-3 text-gray-500">${p.stock}</td>
            <td class="px-4 py-3">
                <button onclick="addToOrder(${p.id})"
                    class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 ${p.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${p.stock === 0 ? 'disabled' : ''}>
                    Agregar
                </button>
            </td>
        </tr>
    `).join('');
}

function addToOrder(productId) {
    const product = products.find(p => p.id === productId);
    const existing = order.find(o => o.productId === productId);
    if (existing) {
        if (existing.quantity >= product.stock) return;
        existing.quantity++;
    } else {
        order.push({ productId, name: product.name, price: product.price, quantity: 1 });
    }
    renderOrder();
}

function renderOrder() {
    const container = document.getElementById('order-items');
    if (order.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">Sin productos</p>';
        document.getElementById('order-total').textContent = '$0.00';
        document.getElementById('change-display').textContent = '$0.00';
        checkBalance();
        return;
    }
    container.innerHTML = order.map(item => `
        <div class="flex items-center justify-between mb-3">
            <div class="flex-1">
                <div class="text-sm font-semibold">${item.name}</div>
                <div class="text-xs text-gray-400">$${item.price} c/u</div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="changeQty(${item.productId}, -1)"
                    class="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-gray-300">-</button>
                <span class="text-sm font-semibold w-4 text-center">${item.quantity}</span>
                <button onclick="changeQty(${item.productId}, 1)"
                    class="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-gray-300">+</button>
            </div>
            <div class="ml-3 text-sm font-bold">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
    calcChange();
    checkBalance();
}

function changeQty(productId, delta) {
    const item = order.find(o => o.productId === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) order = order.filter(o => o.productId !== productId);
    renderOrder();
}

function checkBalance() {
    const warning = document.getElementById('balance-warning');
    if (!warning) return;
    if (paymentMethod !== 'PREPAID_BALANCE' || !selectedStudent) {
        warning.classList.add('hidden');
        return;
    }
    const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const diff = selectedStudent.balance - total;
    if (diff < 0) {
        warning.textContent = `Saldo insuficiente. Faltan $${Math.abs(diff).toFixed(2)}`;
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
}

function setPaymentMethod(method) {
    paymentMethod = method;
    document.getElementById('cash-section').classList.toggle('hidden', method !== 'CASH');
    document.getElementById('prepaid-section').classList.toggle('hidden', method !== 'PREPAID_BALANCE');
    document.getElementById('change-row').classList.toggle('hidden', method !== 'CASH');
    document.getElementById('btn-cash').className = `flex-1 py-2 rounded-lg text-sm font-semibold ${method === 'CASH' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
    document.getElementById('btn-prepaid').className = `flex-1 py-2 rounded-lg text-sm font-semibold ${method === 'PREPAID_BALANCE' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
    checkBalance();
}

function calcChange() {
    const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const received = parseFloat(document.getElementById('cash-input').value) || 0;
    const change = received - total;
    document.getElementById('change-display').textContent = `$${change.toFixed(2)}`;
    document.getElementById('change-display').className = `font-semibold ${change < 0 ? 'text-red-500' : 'text-green-600'}`;
}

async function searchStudent(query) {
    if (query.length < 2) {
        document.getElementById('student-list').innerHTML = '';
        return;
    }
    const res = await fetch(`${API}/api/students`);
    const students = await res.json();
    const filtered = students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    const list = document.getElementById('student-list');
    list.innerHTML = filtered.map(s => `
        <div onclick="selectStudent(${s.id}, '${s.name}', ${s.prepaidBalance})"
            class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-0">
            <span class="font-semibold">${s.name}</span>
            <span class="ml-2 ${s.prepaidBalance < 20 ? 'text-orange-500' : 'text-green-600'}">$${s.prepaidBalance}</span>
        </div>
    `).join('');
}

function selectStudent(id, name, balance) {
    selectedStudent = { id, balance };
    document.getElementById('student-list').innerHTML = '';
    document.getElementById('student-search').value = '';
    document.getElementById('recent-students').innerHTML = '';
    document.getElementById('selected-student').classList.remove('hidden');
    document.getElementById('selected-student-name').textContent = name;
    document.getElementById('selected-student-balance').textContent = `Saldo: $${balance}`;
    document.getElementById('selected-student-balance').className = `ml-2 ${balance < 20 ? 'text-orange-500' : 'text-green-600'}`;
    checkBalance();
}

function openModal() {
    if (order.length === 0) { alert('Agrega productos a la orden'); return; }
    if (paymentMethod === 'PREPAID_BALANCE' && !selectedStudent) { alert('Selecciona un alumno'); return; }

    const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (paymentMethod === 'PREPAID_BALANCE' && selectedStudent.balance < total) {
        alert(`Saldo insuficiente. Faltan $${(total - selectedStudent.balance).toFixed(2)}`);
        return;
    }

    const received = parseFloat(document.getElementById('cash-input').value) || 0;
    document.getElementById('modal-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('modal-method').textContent = paymentMethod === 'CASH' ? 'Efectivo' : 'Saldo prepagado';

    if (paymentMethod === 'CASH') {
        document.getElementById('modal-received-row').classList.remove('hidden');
        document.getElementById('modal-change-row').classList.remove('hidden');
        document.getElementById('modal-student-row').classList.add('hidden');
        document.getElementById('modal-received').textContent = `$${received.toFixed(2)}`;
        document.getElementById('modal-change').textContent = `$${(received - total).toFixed(2)}`;
    } else {
        document.getElementById('modal-student-row').classList.remove('hidden');
        document.getElementById('modal-received-row').classList.add('hidden');
        document.getElementById('modal-change-row').classList.add('hidden');
        document.getElementById('modal-student').textContent = document.getElementById('selected-student-name').textContent;
    }

    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
}

async function processSale(printTicket) {
    const body = {
        paymentMethod,
        items: order.map(i => ({ productId: i.productId, quantity: i.quantity }))
    };
    if (paymentMethod === 'PREPAID_BALANCE') body.studentId = selectedStudent.id;

    try {
        const res = await fetch(`${API}/api/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) { closeModal(); alert(data.error); return; }

        closeModal();
        alert(`Venta registrada. Total: $${data.total}`);
        order = [];
        selectedStudent = null;
        document.getElementById('cash-input').value = '';
        document.getElementById('selected-student').classList.add('hidden');
        renderOrder();
        loadProducts();
        loadRecentStudents();
    } catch (e) {
        closeModal();
        alert('Error al procesar la venta');
    }
}

document.getElementById('search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
});

loadProducts();
loadRecentStudents();