requireAdmin();

let products = [];
let editingId = null;

async function loadProducts() {
    const res = await fetch(`${API}/api/products`, { headers: authHeaders() });
    products = await res.json();
    renderProducts(products);
}

function renderProducts(list) {
    const tbody = document.getElementById('products-table');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-3 text-gray-400">Sin productos</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(p => `
        <tr class="border-t hover:bg-gray-50 ${p.stock === 0 ? 'bg-red-50' : p.stock <= 5 ? 'bg-orange-50' : ''}">
            <td class="px-4 py-3 font-semibold">${p.name}</td>
            <td class="px-4 py-3 text-gray-500">${p.description || '—'}</td>
            <td class="px-4 py-3 font-semibold">$${p.price}</td>
            <td class="px-4 py-3">
                <span class="font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}">
                    ${p.stock}
                </span>
                ${p.stock === 0 ? '<span class="ml-2 text-xs text-red-500">Sin stock</span>' : p.stock <= 5 ? '<span class="ml-2 text-xs text-orange-500">Stock bajo</span>' : ''}
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs">${p.barcode || '—'}</td>
            <td class="px-4 py-3">
                <div class="flex gap-2 justify-end">
                    <button onclick="openProductModal(${p.id})"
                        class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
                        Editar
                    </button>
                    <button onclick="deleteProduct(${p.id})"
                        class="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProductModal(id = null) {
    editingId = id;
    document.getElementById('modal-title').textContent = id ? 'Editar producto' : 'Agregar producto';
    if (id) {
        const p = products.find(p => p.id === id);
        document.getElementById('input-name').value = p.name;
        document.getElementById('input-description').value = p.description || '';
        document.getElementById('input-price').value = p.price;
        document.getElementById('input-stock').value = p.stock;
        document.getElementById('input-barcode').value = p.barcode || '';
    } else {
        document.getElementById('input-name').value = '';
        document.getElementById('input-description').value = '';
        document.getElementById('input-price').value = '';
        document.getElementById('input-stock').value = '';
        document.getElementById('input-barcode').value = '';
    }
    document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    editingId = null;
}

async function saveProduct() {
    const body = {
        name: document.getElementById('input-name').value,
        description: document.getElementById('input-description').value,
        price: parseFloat(document.getElementById('input-price').value) || 0,
        stock: parseInt(document.getElementById('input-stock').value) || 0,
        barcode: document.getElementById('input-barcode').value || null
    };

    if (!body.name) { alert('El nombre es obligatorio'); return; }
    if (body.price <= 0) { alert('El precio debe ser mayor a 0'); return; }

    const url = editingId ? `${API}/api/products/${editingId}` : `${API}/api/products`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body)
    });

    if (res.ok) {
        closeProductModal();
        loadProducts();
    } else {
        alert('Error al guardar producto');
    }
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    const res = await fetch(`${API}/api/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (res.ok) {
        loadProducts();
    } else {
        alert('Error al eliminar producto');
    }
}

document.getElementById('search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
});

loadProducts();