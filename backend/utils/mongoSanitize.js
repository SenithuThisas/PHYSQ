/**
 * Manual sanitization for MongoDB queries
 * Removes/escapes characters used in NoSQL injection attacks
 * Compatible with Express v5
 */

/**
 * Sanitizes a value by removing MongoDB operators
 * @param {any} value - Value to sanitize
 * @returns {any} - Sanitized value
 */
function sanitizeValue(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Remove keys that start with $ or contain .
        const sanitized = {};
        for (const key in value) {
            if (!key.startsWith('$') && !key.includes('.')) {
                sanitized[key] = sanitizeValue(value[key]);
            }
        }
        return sanitized;
    }
    return value;
}

/**
 * Sanitizes request query, body, and params
 * @param {object} req - Express request object
 */
function sanitizeRequest(req) {
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    if (req.query) {
        req.query = sanitizeValue(req.query);
    }
    if (req.params) {
        req.params = sanitizeValue(req.params);
    }
}

/**
 * Express middleware for NoSQL injection protection
 */
function mongoSanitizeMiddleware(req, res, next) {
    sanitizeRequest(req);
    next();
}

module.exports = {
    sanitizeValue,
    sanitizeRequest,
    mongoSanitizeMiddleware
};
