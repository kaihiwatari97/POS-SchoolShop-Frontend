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
        tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-3 text-gray-400">Sin productos</td></tr>';
        return;
    }
    tbody.innerHTML = list.map((p, i) => `
        <tr class="border-t dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#262626] ${i % 2 === 0 ? 'dark:bg-[#222]' : 'dark:bg-[#1f1f1f]'} ${p.stock === 0 ? 'bg-red-50 dark:bg-red-950' : p.stock <= 5 ? 'bg-orange-50 dark:bg-orange-950' : ''}">
            <td class="px-4 py-3">
                ${p.imageUrl ? `<img src="${p.imageUrl}" class="w-10 h-10 rounded object-cover">` : '<div class="w-10 h-10 rounded bg-gray-200 dark:bg-[#2a2a2a]"></div>'}
            </td>
            <td class="px-4 py-3 font-semibold dark:text-gray-100">${p.name}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">${p.description || '—'}</td>
            <td class="px-4 py-3 font-semibold dark:text-gray-100">$${p.price}</td>
            <td class="px-4 py-3">
                <span class="font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-orange-500' : 'dark:text-gray-100'}">
                    ${p.stock}
                </span>
                ${p.stock === 0 ? '<span class="ml-2 text-xs text-red-500">Sin stock</span>' : p.stock <= 5 ? '<span class="ml-2 text-xs text-orange-500">Stock bajo</span>' : ''}
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs">${p.barcode || '—'}</td>
            <td class="px-4 py-3">
                <div class="flex gap-2 justify-end">
                    <button onclick="openProductModal(${p.id})" class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">Editar</button>
                    <button onclick="deleteProduct(${p.id})" class="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProductModal(id = null) {
    editingId = id;
    document.getElementById('modal-title').textContent = id ? 'Editar producto' : 'Agregar producto';
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('input-image').value = '';
    if (id) {
        const p = products.find(p => p.id === id);
        document.getElementById('input-name').value = p.name;
        document.getElementById('input-description').value = p.description || '';
        document.getElementById('input-price').value = p.price;
        document.getElementById('input-stock').value = p.stock;
        document.getElementById('input-barcode').value = p.barcode || '';
        if (p.imageUrl) {
            document.getElementById('image-preview').src = p.imageUrl;
            document.getElementById('image-preview').classList.remove('hidden');
        }
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

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('image-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

async function saveProduct() {
    const name = document.getElementById('input-name').value;
    const description = document.getElementById('input-description').value;
    const price = parseFloat(document.getElementById('input-price').value) || 0;
    const stock = parseInt(document.getElementById('input-stock').value) || 0;
    const barcode = document.getElementById('input-barcode').value || null;
    const imageFile = document.getElementById('input-image').files[0];

    if (!name) { alert('El nombre es obligatorio'); return; }
    if (price <= 0) { alert('El precio debe ser mayor a 0'); return; }

    let imageUrl = null;
    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch(`${API}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: formData
        });
        if (!uploadRes.ok) { alert('Error al subir la imagen'); return; }
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.secure_url;
    } else if (editingId) {
        const existing = products.find(p => p.id === editingId);
        imageUrl = existing?.imageUrl || null;
    }

    const body = { name, description, price, stock, barcode, imageUrl };
    const url = editingId ? `${API}/api/products/${editingId}` : `${API}/api/products`;
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
    if (res.ok) { closeProductModal(); loadProducts(); } else { alert('Error al guardar producto'); }
}

async function deleteProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    const res = await fetch(`${API}/api/products/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) { loadProducts(); } else { alert('Error al eliminar producto'); }
}

document.getElementById('search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
});

document.querySelectorAll('input').forEach(input => input.setAttribute('autocomplete', 'off'));
loadProducts();