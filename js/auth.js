// js/auth.js
const ADMIN_PASSWORD = "100580";

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            
            if (password === ADMIN_PASSWORD) {
                // Store login state in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                errorMessage.textContent = 'Invalid password. Please try again.';
            }
        });
    }
    
    // Check if user is logged in on protected pages
    const currentPage = window.location.pathname;
    if (currentPage.includes('dashboard.html') || 
        currentPage.includes('prefects.html') || 
        currentPage.includes('attendance.html')) {
        
        if (!localStorage.getItem('adminLoggedIn')) {
            window.location.href = 'login.html';
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }
});