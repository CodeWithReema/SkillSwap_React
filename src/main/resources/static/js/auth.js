// Authentication helper functions
// TODO: Implement proper authentication when JWT is set up

function checkAuth() {
    // For now, just check if user is logged in via localStorage
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateAuthUI();
}

function clearAuth() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
}

function logout() {
    clearAuth();
    window.location.href = '/index.html';
}

function updateAuthUI() {
    const currentUser = checkAuth();
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'inline-block';
            // Remove any existing click handlers to avoid duplicates
            logoutLink.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutLink) {
            logoutLink.style.display = 'none';
            logoutLink.onclick = null;
        }
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthUI);
} else {
    updateAuthUI();
}
