requireAdmin();

let allSales = [];
let currentFilter = 'day';

async function loadSales() {
    const res = await fetch(`${API}/api/sales`, { headers: authHeaders() });
    allSales = await res.json();
    renderSales();
}

function setFilter(filter) {
    currentFilter = filter;
    ['day', 'week', 'month', 'year', 'all'].forEach(f => {
        const btn = document.getElementById(`btn-${f}`);
        btn.className = `px-4 py-2 rounded-lg text-sm font-semibold ${f === filter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
    });
    renderSales();
}

function filterSales() {
    const now = new Date();
    return allSales.filter(sale => {
        const date = new Date(sale.date);
        if (currentFilter === 'day') {
            return date.toDateString() === now.toDateString();
        } else if (currentFilter === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
        } else if (currentFilter === 'month') {
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        } else if (currentFilter === 'year') {
            return date.getFullYear() === now.getFullYear();
        }
        return true;
    });
}

function getPrintHeader() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const from = weekAgo.toLocaleDateString('es-MX', { day: '2-digit', month: 'long' });
    const to = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    const labels = {
        day: {
            title: 'Reporte diario',
            subtitle: now.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
        },
        week: {
            title: 'Reporte semanal',
            subtitle: `${from} — ${to}`
        },
        month: {
            title: 'Reporte mensual',
            subtitle: now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
        },
        year: {
            title: `Reporte anual ${now.getFullYear()}`,
            subtitle: `Enero — ${now.toLocaleDateString('es-MX', { month: 'long' })} ${now.getFullYear()}`
        },
        all: {
            title: 'Reporte general',
            subtitle: 'Todas las ventas registradas'
        }
    };
    return labels[currentFilter];
}

function printReport() {
    const header = getPrintHeader();
    document.getElementById('print-title').textContent = header.title;
    document.getElementById('print-period').textContent = header.subtitle;
    window.print();
}

function printTicket() {
    alert('Función no disponible — requiere impresora térmica. Se habilitará en la Fase 7.');
}

function renderSales() {
    const filtered = filterSales();
    const tbody = document.getElementById('sales-table');

    const total = filtered.reduce((sum, s) => sum + s.total, 0);
    const avg = filtered.length > 0 ? total / filtered.length : 0;

    document.getElementById('metric-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('metric-count').textContent = filtered.length;
    document.getElementById('metric-avg').textContent = `$${avg.toFixed(2)}`;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-3 text-gray-400">Sin ventas en este periodo</td></tr>';
        return;
    }

    tbody.innerHTML = [...filtered].reverse().map(sale => {
        const date = new Date(sale.date);
        const dateStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        const products = sale.saleDetails.map(d => `<li>${d.product.name} x${d.quantity}</li>`).join('');
        const method = sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Saldo';

        return `
            <tr class="border-t hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="font-semibold">${dateStr}</div>
                    <div class="text-xs text-gray-400">${timeStr}</div>
                </td>
                <td class="px-4 py-3 text-gray-600">${sale.student}</td>
                <td class="px-4 py-3 text-gray-500 text-xs"><ul class="list-disc list-inside">${products}</ul></td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-xs font-semibold ${sale.paymentMethod === 'CASH' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'}">
                        ${method}
                    </span>
                </td>
                <td class="px-4 py-3 font-bold">$${sale.total.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
}

loadSales();