requireAdmin();

function updateToggle() {
    const isDark = document.documentElement.classList.contains('dark');
    const btn = document.getElementById('dark-toggle');
    btn.className = `relative w-12 h-6 rounded-full transition-colors focus:outline-none ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`;
    btn.innerHTML = `<span class="absolute top-0.5 ${isDark ? 'left-6' : 'left-0.5'} w-5 h-5 bg-white rounded-full shadow transition-all"></span>`;
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    updateToggle();
}

document.getElementById('current-user').textContent = getUsername();
document.getElementById('current-role').textContent = getRole() === 'ADMIN' ? 'Administrador' : 'Empleado';

updateToggle();