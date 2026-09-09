requireAuth();

let products = [];
let order = [];
let paymentMethod = 'CASH';
let selectedStudent = null;
let selectedFiadoStudent = null;
let currentView = localStorage.getItem('posView') || 'list';
let currentSort = localStorage.getItem('posSort') || 'name';

async function loadProducts() {
    const res = await fetch(`${API}/api/products`, { headers: authHeaders() });
    products = await res.json();
    renderProducts(products);
}

async function loadRecentStudents() {
    const res = await fetch(`${API}/api/students`, { headers: authHeaders() });
    const students = await res.json();
    const recent = students.slice(0, 4);

    const container = document.getElementById('recent-students');
    if (container) container.innerHTML = recentStudentsHtml(recent, 'selectStudent');

    const fiadoContainer = document.getElementById('fiado-recent-students');
    if (fiadoContainer) fiadoContainer.innerHTML = recentStudentsHtml(recent, 'selectStudentFiado');
}

function recentStudentsHtml(recent, selectFn) {
    return recent.map(s => `
        <div onclick="${selectFn}(${s.id}, '${s.name}', ${s.prepaidBalance})"
            class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer border-b dark:border-[#333] last:border-0 flex justify-between items-center">
            <span class="font-semibold text-sm dark:text-gray-100">${s.name}</span>
            <span class="text-xs ${s.prepaidBalance < 20 ? 'text-orange-500' : 'text-green-600'}">$${s.prepaidBalance}</span>
        </div>
    `).join('');
}

function toggleDropdown(id) {
    const dropdowns = ['sort-dropdown', 'view-dropdown'];
    dropdowns.forEach(d => {
        const el = document.getElementById(d);
        if (d === id) {
            el.classList.toggle('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.relative')) {
        document.getElementById('sort-dropdown')?.classList.add('hidden');
        document.getElementById('view-dropdown')?.classList.add('hidden');
    }
});

function setSortAndClose(sort, label) {
    currentSort = sort;
    localStorage.setItem('posSort', sort);
    document.getElementById('sort-label').textContent = label;
    document.getElementById('sort-dropdown').classList.add('hidden');
    renderProducts(getFilteredProducts());
}

function setViewAndClose(view) {
    currentView = view;
    localStorage.setItem('posView', view);
    document.getElementById('view-label').textContent = view === 'list' ? 'Lista' : 'Grid';
    document.getElementById('view-dropdown').classList.add('hidden');
    renderProducts(getFilteredProducts());
}

function setView(view) {
    currentView = view;
    localStorage.setItem('posView', view);
    const label = document.getElementById('view-label');
    if (label) label.textContent = view === 'list' ? 'Lista' : 'Grid';
    renderProducts(getFilteredProducts());
}

function getFilteredProducts() {
    const q = document.getElementById('search-input')?.value.toLowerCase() || '';
    let list = q ? products.filter(p =>
        p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q))
    ) : [...products];

    switch (currentSort) {
        case 'name':      list.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
        case 'price-asc': list.sort((a, b) => a.price - b.price); break;
        case 'price-desc':list.sort((a, b) => b.price - a.price); break;
        case 'stock-asc': list.sort((a, b) => a.stock - b.stock); break;
        case 'stock-desc':list.sort((a, b) => b.stock - a.stock); break;
    }
    return list;
}

function renderProducts(list) {
    const container = document.getElementById('products-container');
    if (!container) return;
    if (currentView === 'grid') {
        renderGrid(list, container);
    } else {
        renderList(list, container);
    }
}

function renderList(list, container) {
    container.innerHTML = `
        <table class="w-full bg-white dark:bg-[#222] rounded-lg shadow text-sm" style="border:1px solid #2a2a2a;">
            <thead class="bg-gray-50 dark:bg-[#2a2a2a] sticky top-0">
                <tr>
                    <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Producto</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Precio</th>
                    <th class="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Stock</th>
                    <th class="px-4 py-3"></th>
                </tr>
            </thead>
            <tbody id="products-table">
                ${list.length === 0 ? '<tr><td colspan="4" class="px-4 py-3 text-gray-400">Sin resultados</td></tr>' :
                list.map((p, i) => `
                    <tr class="border-t dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#262626] ${i % 2 === 0 ? 'dark:bg-[#222]' : 'dark:bg-[#1f1f1f]'} ${p.stock === 0 ? 'opacity-50' : ''}">
                        <td class="px-4 py-3">
                            <div class="font-semibold dark:text-gray-100">${p.name}</div>
                            <div class="text-gray-400 text-xs">${p.description || ''}</div>
                            ${p.stock <= 5 && p.stock > 0 ? `<div class="text-orange-500 text-xs">Solo quedan ${p.stock}</div>` : ''}
                        </td>
                        <td class="px-4 py-3 font-semibold dark:text-gray-100">$${p.price}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">${p.stock}</td>
                        <td class="px-4 py-3">
                            <button onclick="addToOrder(${p.id})"
                                class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 ${p.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                                ${p.stock === 0 ? 'disabled' : ''}>
                                Agregar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderGrid(list, container) {
    if (list.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">Sin resultados</p>';
        return;
    }
    container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">
            ${list.map(p => `
                <div class="bg-white dark:bg-[#222] rounded-xl shadow flex flex-col overflow-hidden ${p.stock === 0 ? 'opacity-50' : ''}" style="border:1px solid #2a2a2a;">
                    <div class="w-full h-32 bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                        ${p.imageUrl ? `<img src="${p.imageUrl}" class="w-full h-full object-cover">` : `<span style="font-size:36px;">🛍️</span>`}
                    </div>
                    <div class="p-3 flex flex-col flex-1">
                        <div class="font-semibold text-sm dark:text-gray-100 mb-1 leading-tight">${p.name}</div>
                        <div class="text-green-600 font-bold text-sm mb-1">$${p.price}</div>
                        <div class="text-xs text-gray-400 mb-2">
                            ${p.stock === 0 ? '<span class="text-red-500">Sin stock</span>' : p.stock <= 5 ? `<span class="text-orange-500">Stock: ${p.stock}</span>` : `Stock: ${p.stock}`}
                        </div>
                        <button onclick="addToOrder(${p.id})"
                            class="mt-auto w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 ${p.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${p.stock === 0 ? 'disabled' : ''}>
                            Agregar
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
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

function updateStudentBalance() {
    if (!selectedStudent) return;
    const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const remaining = selectedStudent.balance - total;
    const el = document.getElementById('student-remaining');
    if (!el) return;
    el.textContent = `Saldo restante: $${remaining.toFixed(2)}`;
    el.className = `text-xs mt-1 ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`;
}

function renderOrder() {
    const container = document.getElementById('order-items');
    if (order.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">Sin productos</p>';
        document.getElementById('order-total').textContent = '$0.00';
        document.getElementById('change-display').textContent = '$0.00';
        checkBalance();
        updateStudentBalance();
        return;
    }
    container.innerHTML = order.map(item => `
        <div class="flex items-center justify-between mb-3">
            <div class="flex-1">
                <div class="text-sm font-semibold dark:text-gray-100">${item.name}</div>
                <div class="text-xs text-gray-400">$${item.price} c/u</div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="changeQty(${item.productId}, -1)"
                    class="w-6 h-6 bg-gray-200 dark:bg-[#2a2a2a] dark:text-gray-300 rounded text-sm font-bold hover:bg-gray-300">-</button>
                <span class="text-sm font-semibold w-4 text-center dark:text-gray-100">${item.quantity}</span>
                <button onclick="changeQty(${item.productId}, 1)"
                    class="w-6 h-6 bg-gray-200 dark:bg-[#2a2a2a] dark:text-gray-300 rounded text-sm font-bold hover:bg-gray-300">+</button>
            </div>
            <div class="ml-3 text-sm font-bold dark:text-gray-100">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
    calcChange();
    checkBalance();
    updateStudentBalance();
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
    document.getElementById('fiado-section').classList.toggle('hidden', method !== 'FIADO');
    document.getElementById('change-row').classList.toggle('hidden', method !== 'CASH');
    document.getElementById('btn-cash').className = `flex-1 py-2 rounded-lg text-sm font-semibold ${method === 'CASH' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-400'}`;
    document.getElementById('btn-card').className = `flex-1 py-2 rounded-lg text-sm font-semibold ${method === 'CARD' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-400'}`;
    document.getElementById('btn-prepaid').className = `flex-1 py-2 rounded-lg text-sm font-semibold ${method === 'PREPAID_BALANCE' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-400'}`;
    document.getElementById('btn-fiado').className = `flex-1 py-2 rounded-lg text-sm font-semibold ${method === 'FIADO' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-400'}`;
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
    const res = await fetch(`${API}/api/students`, { headers: authHeaders() });
    const students = await res.json();
    const filtered = students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    const list = document.getElementById('student-list');
    list.innerHTML = filtered.map(s => `
        <div onclick="selectStudent(${s.id}, '${s.name}', ${s.prepaidBalance})"
            class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer border-b dark:border-[#333] last:border-0">
            <span class="font-semibold dark:text-gray-100">${s.name}</span>
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
    updateStudentBalance();
    checkBalance();
}

async function searchStudentFiado(query) {
    if (query.length < 2) {
        document.getElementById('fiado-student-list').innerHTML = '';
        return;
    }
    const res = await fetch(`${API}/api/students`, { headers: authHeaders() });
    const students = await res.json();
    const filtered = students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
    const list = document.getElementById('fiado-student-list');
    list.innerHTML = filtered.map(s => `
        <div onclick="selectStudentFiado(${s.id}, '${s.name}', ${s.prepaidBalance})"
            class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer border-b dark:border-[#333] last:border-0">
            <span class="font-semibold dark:text-gray-100">${s.name}</span>
            <span class="ml-2 text-xs text-gray-400">$${s.prepaidBalance}</span>
        </div>
    `).join('');
}

function selectStudentFiado(id, name, balance) {
    selectedFiadoStudent = { id, balance };
    document.getElementById('fiado-student-list').innerHTML = '';
    document.getElementById('fiado-student-search').value = '';
    document.getElementById('fiado-recent-students').innerHTML = '';
    document.getElementById('selected-student-fiado').classList.remove('hidden');
    document.getElementById('selected-student-fiado-name').textContent = name;
    document.getElementById('selected-student-fiado-balance').textContent = `Saldo actual: $${balance}`;
}

// Alta rápida de alumno desde el botón "+" del método Fiado
function openNewStudentModal() {
    document.getElementById('new-student-name').value = '';
    document.getElementById('new-student-level').value = 'kinder';
    document.getElementById('new-student-grade').value = '';
    document.getElementById('new-student-group').value = '';
    document.getElementById('new-student-modal').classList.remove('hidden');
}

function closeNewStudentModal() {
    document.getElementById('new-student-modal').classList.add('hidden');
}

async function saveNewStudent() {
    const body = {
        name: document.getElementById('new-student-name').value,
        grade: document.getElementById('new-student-grade').value,
        level: document.getElementById('new-student-level').value,
        group: document.getElementById('new-student-group').value
    };
    if (!body.name) { alert('El nombre es obligatorio'); return; }

    try {
        const res = await fetch(`${API}/api/students`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) { alert('Error al guardar alumno'); return; }

        closeNewStudentModal();
        loadRecentStudents();

        // Si el backend regresa el alumno creado (con id), se selecciona automáticamente para el fiado.
        // Si no regresa el id, hay que buscarlo manualmente en la lista.
        if (data && data.id) {
            selectStudentFiado(data.id, data.name || body.name, data.prepaidBalance ?? 0);
        } else {
            alert('Alumno agregado. Búscalo en la lista para seleccionarlo.');
        }
    } catch (e) {
        alert('Error al guardar alumno');
    }
}

/* ==== LÓGICA ORIGINAL DE COBRO (desactivada momentaneamente mientras se instala caja, impresora y scanner) ====

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

async function processSale(printTicket) {
    const body = {
        paymentMethod,
        items: order.map(i => ({ productId: i.productId, quantity: i.quantity }))
    };
    if (paymentMethod === 'PREPAID_BALANCE') body.studentId = selectedStudent.id;

    try {
        const res = await fetch(`${API}/api/sales`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) { closeModal(); alert(data.error); return; }

        closeModal();

        if (printTicket) {
            await fetch(`${API}/api/terminal/ticket/${data.id}`, {
                method: 'POST',
                headers: authHeaders()
            });
        }

        if (paymentMethod === 'CASH') {
            await fetch(`${API}/api/terminal/drawer/open`, {
                method: 'POST',
                headers: authHeaders()
            });
            showDrawerModal();
            await waitForDrawerClose();
            hideDrawerModal();
        }

        finalizeSale();
    } catch (e) {
        closeModal();
        alert('Error al procesar la venta');
    }
}

==== FIN LÓGICA ORIGINAL ==== */

function openModal() {
    if (order.length === 0) { alert('Agrega productos a la orden'); return; }
    if (paymentMethod === 'PREPAID_BALANCE' && !selectedStudent) { alert('Selecciona un alumno'); return; }
    if (paymentMethod === 'FIADO' && !selectedFiadoStudent) { alert('Selecciona un alumno'); return; }

    const total = order.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (paymentMethod === 'PREPAID_BALANCE' && selectedStudent.balance < total) {
        alert(`Saldo insuficiente. Faltan $${(total - selectedStudent.balance).toFixed(2)}`);
        return;
    }

    document.getElementById('charge-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    resetChargeModal();
}

function resetChargeModal() {
    document.getElementById('charge-idle-state').classList.remove('hidden');
    document.getElementById('charge-counting-state').classList.add('hidden');
}

function startChargeCountdown() {
    document.getElementById('charge-idle-state').classList.add('hidden');
    document.getElementById('charge-counting-state').classList.remove('hidden');

    let seconds = 3;
    const circle = document.getElementById('charge-circle');
    const countdown = document.getElementById('charge-countdown');
    const circumference = 238.8;

    circle.style.strokeDashoffset = '0';
    countdown.textContent = seconds;

    const interval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            countdown.textContent = seconds;
            circle.style.strokeDashoffset = ((3 - seconds) / 3) * circumference;
        } else {
            clearInterval(interval);
            circle.style.strokeDashoffset = circumference;
            countdown.textContent = '✓';
            processSaleTemp();
        }
    }, 1000);
}

// Venta simplificada mientras no hay caja, impresora ni scanner: solo registra la venta, sin ticket ni cajón.
async function processSaleTemp() {
    const body = {
        paymentMethod,
        items: order.map(i => ({ productId: i.productId, quantity: i.quantity }))
    };
    if (paymentMethod === 'PREPAID_BALANCE') body.studentId = selectedStudent.id;
    if (paymentMethod === 'FIADO') body.studentId = selectedFiadoStudent.id;

    try {
        const res = await fetch(`${API}/api/sales`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) { closeModal(); alert(data.error); return; }

        closeModal();
        finalizeSale();
    } catch (e) {
        closeModal();
        alert('Error al procesar la venta');
    }
}

function showDrawerModal() {
    document.getElementById('drawer-modal').classList.remove('hidden');
}

function hideDrawerModal() {
    document.getElementById('drawer-modal').classList.add('hidden');
}

// function waitForDrawerClose() {
//     return new Promise(resolve => {
//         const interval = setInterval(async () => {
//             try {
//                 const res = await fetch(`${API}/api/terminal/drawer/status`, { headers: authHeaders() });
//                 const data = await res.json();
//                 if (data.status === 'closed') {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             } catch (e) {
//                 clearInterval(interval);
//                 resolve();
//             }
//         }, 1000);
//     });
// }

function waitForDrawerClose() {
    return new Promise(resolve => {
        let seconds = 5;
        const circle = document.getElementById('drawer-circle');
        const countdown = document.getElementById('drawer-countdown');
        const circumference = 213.6;

        circle.style.strokeDashoffset = '0';
        countdown.textContent = seconds;

        const interval = setInterval(() => {
            seconds--;
            countdown.textContent = seconds;
            circle.style.strokeDashoffset = ((5 - seconds) / 5) * circumference;
            if (seconds <= 0) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
}

function finalizeSale() {
    order = [];
    selectedStudent = null;
    selectedFiadoStudent = null;
    document.getElementById('cash-input').value = '';
    document.getElementById('selected-student').classList.add('hidden');
    document.getElementById('selected-student-fiado').classList.add('hidden');
    renderOrder();
    loadProducts();
    loadRecentStudents();
}

document.getElementById('search-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const barcode = this.value.trim();
        if (!barcode) return;
        const product = products.find(p => p.barcode === barcode);
        if (product) {
            if (product.stock > 0) { addToOrder(product.id); this.value = ''; }
            else { alert(`Sin stock: ${product.name}`); this.value = ''; }
        } else {
            alert(`Código no encontrado: ${barcode}`);
            this.value = '';
        }
    }
});

document.getElementById('search-input').addEventListener('input', function() {
    renderProducts(getFilteredProducts());
});

// inicializar labels guardados
const sortLabels = {
    'name': 'Nombre', 'name-desc': 'Nombre Z-A',
    'price-asc': 'Precio ↑', 'price-desc': 'Precio ↓',
    'stock-asc': 'Stock ↑', 'stock-desc': 'Stock ↓'
};
const sortLabel = document.getElementById('sort-label');
const viewLabel = document.getElementById('view-label');
if (sortLabel) sortLabel.textContent = sortLabels[currentSort] || 'Nombre';
if (viewLabel) viewLabel.textContent = currentView === 'list' ? 'Lista' : 'Grid';

loadProducts();
loadRecentStudents();
document.getElementById('search-input').focus();
document.querySelectorAll('input').forEach(input => input.setAttribute('autocomplete', 'off'));