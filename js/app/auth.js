// Fake JWT Generator
function generateFakeJWT(email) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ email: email, exp: Date.now() + 86400000 }));
    const signature = btoa("fake-signature-for-local-demo");
    return `${header}.${payload}.${signature}`;
}

// Protected routes that require login
const protectedRoutes = ['engine.html', 'arrays.html', 'binary_search.html', 'dp.html', 'graphs.html', 'linkedlist.html', 'trees.html', 'twopointers.html', 'analyzer.html'];

// Check Authentication State
function checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    const authLink = document.getElementById('auth-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Protect engine routes

    // Protect auth routes
    if ((currentPage === "login.html" || currentPage === "register.html") && token) {
        window.location.href = "engine.html";
        return;
    }

    if (protectedRoutes.includes(currentPage) && !token) {
        window.location.href = 'login.html';
        return;
    }

    if (authLink) {
        if (token) {
            authLink.textContent = "LOGOUT";
            authLink.href = "#";
            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('auth_token');
                window.location.reload();
            });
        } else {
            authLink.textContent = "LOGIN";
            authLink.href = "login.html";
        }
    }

    // Check for toast
    const toastMsg = localStorage.getItem('login_toast');
    if (toastMsg) {
        showToast(toastMsg);
        localStorage.removeItem('login_toast');
    }
}

// Eye icon toggle helper
window.togglePassword = function(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        iconElement.textContent = '🙈';
    } else {
        input.type = 'password';
        iconElement.textContent = '👁️';
    }
}

// Toast UI
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.background = 'var(--primary)';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '50px';
    toast.style.fontWeight = '700';
    toast.style.boxShadow = 'var(--shadow)';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);
    
    // Fade out
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Run on load
document.addEventListener("DOMContentLoaded", checkAuthStatus);
