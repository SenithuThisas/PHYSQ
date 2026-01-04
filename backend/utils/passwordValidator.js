const validator = require('validator');

/**
 * Validates password strength according to security best practices
 * @param {string} password - The password to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return 'Password is required';
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters long`;
    }

    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter';
    }

    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter';
    }

    if (!hasNumbers) {
        return 'Password must contain at least one number';
    }

    if (!hasSpecialChar) {
        return 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
    }

    return null; // Password is valid
}

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    return validator.isEmail(email);
}

/**
 * Sanitizes user input to prevent XSS
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    return validator.escape(input.trim());
}

module.exports = {
    validatePassword,
    validateEmail,
    sanitizeInput
};
