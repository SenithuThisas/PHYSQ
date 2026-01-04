const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login attempts
 * Strict limit to prevent brute force attacks
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Too many login attempts from this IP. Please try again in 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Rate limiter for signup attempts
 * Prevents spam account creation
 */
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 signups per hour per IP
    message: {
        error: 'Too many accounts created from this IP. Please try again in an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for email/username availability checks
 * Prevents user enumeration attacks while maintaining UX
 */
const checkLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 checks per window
    message: {
        error: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * General auth endpoint rate limiter
 * Fallback protection for all auth routes
 */
const generalAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests from this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    signupLimiter,
    checkLimiter,
    generalAuthLimiter
};
