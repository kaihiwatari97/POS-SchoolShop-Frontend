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