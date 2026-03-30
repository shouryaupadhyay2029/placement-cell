/**
 * toast.js - Reusable Notification System
 * Usage: showToast("Message", "success" | "error" | "info")
 */

const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
document.body.appendChild(toastContainer);

function showToast(message, type = "info") {
    // Generate Icon
    let icon = "ℹ";
    if (type === "success") icon = "✔";
    if (type === "error") icon = "✖";

    // Create Toast Body
    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-content">${message}</div>
        <button class="toast-close">&times;</button>
        <div class="toast-progress"></div>
    `;

    // Append to Container
    toastContainer.appendChild(toast);

    // Auto Hide Logic
    const closeToast = () => {
        toast.classList.add("exit");
        setTimeout(() => {
            if (toast.parentNode) {
                toastContainer.removeChild(toast);
            }
        }, 1000);
    };

    // Click Close Button
    toast.querySelector(".toast-close").onclick = (e) => {
        e.stopPropagation();
        closeToast();
    };

    // Auto-disappear after 3s
    setTimeout(closeToast, 3000);
}

// Export globally
window.showToast = showToast;
