// Format date function
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Format time function
function formatTime(date) {
    const options = { 
        hour: '2-digit', 
        minute: '2-digit'
    };
    return date.toLocaleTimeString('en-US', options);
}

// Generate reservation ID
function generateReservationId() {
    return 'PK-' + Date.now().toString().substring(0, 10);
}

// Check if user is authenticated
function checkAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = 'index.html';
    }
}

// Clone and append a template
function appendTemplate(templateId, targetId) {
    const template = document.getElementById(templateId);
    const clone = document.importNode(template.content, true);
    document.getElementById(targetId).appendChild(clone);
    return document.getElementById(targetId).lastElementChild;
}

// Show error message with shake animation
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        
        const inputElement = document.getElementById(fieldId);
        if (inputElement) {
            inputElement.classList.add('border-red-500');
            inputElement.classList.add('shake');
            setTimeout(() => {
                inputElement.classList.remove('shake');
            }, 500);
        }
    }
}

// Clear all form errors
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('input, select');
    
    errorElements.forEach(element => {
        element.classList.add('hidden');
        element.textContent = '';
    });
    
    inputElements.forEach(element => {
        element.classList.remove('border-red-500');
    });
}