// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.innerHTML = theme === 'light' ? '🌙' : '☀️';
        btn.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
}

// Global Init
document.addEventListener('DOMContentLoaded', initTheme);

// Expose to window
window.toggleTheme = toggleTheme;
window.initTheme = initTheme;
