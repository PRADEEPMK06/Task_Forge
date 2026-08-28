/**
 * TaskForge Enterprise Core Client Utilities
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar Toggle functionality
  const sidebar = document.getElementById('taskforge-sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });
  }

  // Toast Notification Container
  if (!document.getElementById('tf-toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'tf-toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }
});

/**
 * Global Toast helper
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 */
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('tf-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClasses = {
    success: 'bg-emerald-800 text-emerald-50 border border-emerald-600',
    error: 'bg-rose-800 text-rose-50 border border-rose-600',
    warning: 'bg-amber-800 text-amber-50 border border-amber-600',
    info: 'bg-slate-900 text-white border border-slate-700',
  }[type] || 'bg-slate-900 text-white border border-slate-700';

  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-fade-in ${bgClasses}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="ml-2 text-slate-300 hover:text-white" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

/**
 * Global CSRF Fetch helper for API calls
 */
window.tfFetch = async function(url, options = {}) {
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken') || '',
    ...(options.headers || {})
  };

  return fetch(url, { ...options, headers });
};
