function saveSession(token, role, username) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
}

function getToken() {
    return localStorage.getItem('token');
}

function getRole() {
    return localStorage.getItem('role');
}

function getUsername() {
    return localStorage.getItem('username');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

function requireAdmin() {
    requireAuth();
    if (getRole() !== 'ADMIN') {
        window.location.href = 'index.html';
    }
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

// auto logout por inactividad
const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutos
let idleTimer;

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        logout();
    }, IDLE_TIMEOUT);
}

// eventos que cuentan como actividad
['mousemove', 'mousedown', 'keydown', 'touchstart', 'click', 'scroll'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, true);
});

// arrancar el timer al cargar
resetIdleTimer();