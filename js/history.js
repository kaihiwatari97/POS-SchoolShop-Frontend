requireAdmin();

let activityLogs = [];

async function loadHistory() {
    const res = await fetch(`${API}/api/activity-log`, { headers: authHeaders() });
    activityLogs = await res.json();
    renderHistory(activityLogs);
}

function renderHistory(list) {
    const tbody = document.getElementById('history-table');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-gray-400">Sin actividad registrada</td></tr>';
        return;
    }
    tbody.innerHTML = list.map((log, i) => {
        const date = new Date(log.timestamp);
        const dateStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        return `
            <tr class="border-t dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#262626] ${i % 2 === 0 ? 'dark:bg-[#222]' : 'dark:bg-[#1f1f1f]'}">
                <td class="px-4 py-3">
                    <div class="font-semibold dark:text-gray-100">${dateStr}</div>
                    <div class="text-xs text-gray-400">${timeStr}</div>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">${log.action}</td>
                <td class="px-4 py-3 font-semibold dark:text-gray-100">${log.amount != null ? '$' + log.amount.toFixed(2) : '—'}</td>
                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">${log.username || '—'}</td>
            </tr>
        `;
    }).join('');
}

document.getElementById('search-input').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    renderHistory(activityLogs.filter(l => l.action.toLowerCase().includes(q) || (l.username || '').toLowerCase().includes(q)));
});

document.querySelectorAll('input').forEach(input => input.setAttribute('autocomplete', 'off'));
loadHistory();
