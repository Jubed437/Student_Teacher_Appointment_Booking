export function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
}

// Add CSS for toasts dynamically
const style = document.createElement('style');
style.textContent = `
    .toast {
        background: white;
        color: #1f2937;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 250px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        border-left: 4px solid #3b82f6;
    }
    .toast.show {
        transform: translateX(0);
    }
    .toast.success { border-left-color: #10b981; }
    .toast.success i { color: #10b981; }
    .toast.error { border-left-color: #ef4444; }
    .toast.error i { color: #ef4444; }
    .toast.info i { color: #3b82f6; }
    .toast-message { font-size: 14px; font-weight: 500; }
`;
document.head.appendChild(style);
