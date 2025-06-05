function showNotification(message, type = 'info', duration = 3000) {
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification', type); // General class and type-specific class
    notificationElement.textContent = message;

    // Apply basic inline styles for now, can be enhanced by CSS classes
    notificationElement.style.position = 'fixed';
    notificationElement.style.bottom = '20px';
    notificationElement.style.left = '20px';
    notificationElement.style.padding = '15px';
    notificationElement.style.margin = '10px';
    notificationElement.style.borderRadius = '5px';
    notificationElement.style.color = 'white';
    notificationElement.style.zIndex = '1050'; // Ensure it's above most elements

    // Type-specific styling (can be overridden by CSS classes if defined)
    switch (type) {
        case 'success':
            notificationElement.style.backgroundColor = '#28a745'; // Green
            notificationElement.style.borderColor = '#1e7e34';
            break;
        case 'error':
            notificationElement.style.backgroundColor = '#dc3545'; // Red
            notificationElement.style.borderColor = '#b02a37';
            break;
        case 'info':
        default:
            notificationElement.style.backgroundColor = '#17a2b8'; // Blue/Info
            notificationElement.style.borderColor = '#117a8b';
            break;
    }
    notificationElement.style.border = '1px solid'; // Apply border color set above

    document.body.appendChild(notificationElement);

    setTimeout(() => {
        notificationElement.remove();
    }, duration);
}

window.showSuccessNotification = function(message, duration = 3000) {
    showNotification(message, 'success', duration);
};

window.showErrorNotification = function(message, duration = 3000) {
    showNotification(message, 'error', duration);
};

window.showInfoNotification = function(message, duration = 3000) {
    showNotification(message, 'info', duration);
};
