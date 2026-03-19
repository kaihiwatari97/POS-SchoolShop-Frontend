// guarda el token y los datos del usuario en localStorage al hacer login
function saveSession(token, role, username) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
}

// obtiene el token guardado
function getToken() {
    return localStorage.getItem('token');
}

// obtiene el rol guardado
function getRole() {
    return localStorage.getItem('role');
}

// obtiene el username guardado
function getUsername() {
    return localStorage.getItem('username');
}

// cierra sesión — borra todo y redirige al login
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// verifica si hay sesión activa — si no, redirige al login
function requireAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}

// agrega el token a los headers de fetch automáticamente
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}