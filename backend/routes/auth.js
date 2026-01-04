const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { loginLimiter, signupLimiter, checkLimiter } = require('../middleware/rateLimiters');
const { validatePassword, validateEmail, sanitizeInput } = require('../utils/passwordValidator');

// GET /auth/check-email?email=value
// ⚠️ WARNING: This endpoint enables user enumeration attacks
// Protected with aggressive rate limiting (20 requests per 5 minutes)
router.get('/check-email', checkLimiter, async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || !validateEmail(email)) {
            return res.status(400).json({
                available: false,
                message: 'Invalid email format'
            });
        }

        // Check if email exists
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

        if (existingUser) {
            return res.json({
                available: false,
                message: 'This email is already in use'
            });
        }

        return res.json({
            available: true,
            message: 'Email is available'
        });
    } catch (err) {
        console.error('Check email error:', err);
        res.status(500).json({ error: 'Error checking email availability' });
    }
});


// GET /auth/check-username?username=value
// ⚠️ WARNING: This endpoint enables user enumeration attacks
// Protected with aggressive rate limiting (20 requests per 5 minutes)
router.get('/check-username', checkLimiter, async (req, res) => {
    try {
        const { username } = req.query;

        if (!username || username.trim().length < 3) {
            return res.status(400).json({
                available: false,
                message: 'Username must be at least 3 characters'
            });
        }

        // Check if username exists
        const existingUser = await User.findOne({ username: username.trim() });

        if (existingUser) {
            return res.json({
                available: false,
                message: 'Username is already taken'
            });
        }

        return res.json({
            available: true,
            message: 'Username is available'
        });
    } catch (err) {
        console.error('Check username error:', err);
        res.status(500).json({ error: 'Error checking username' });
    }
});

// POST /auth/signup
router.post('/signup', signupLimiter, async (req, res) => {
    try {
        const { fullName, email, password, username } = req.body;

        // Validate required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: 'Full name, email, and password are required' });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password strength
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        // Sanitize inputs to prevent XSS
        const sanitizedFullName = sanitizeInput(fullName);
        const sanitizedUsername = username ? sanitizeInput(username) : undefined;

        // Check email uniqueness
        const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
        if (existingEmail) {
            return res.status(409).json({ error: 'This email is already in use' });
        }

        // Check username uniqueness (if provided)
        if (username) {
            const existingUsername = await User.findOne({ username: username.trim() });
            if (existingUsername) {
                return res.status(409).json({ error: 'This username is already taken' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create new user with sanitized inputs
        const newUser = new User({
            fullName: sanitizedFullName,
            email: email.trim().toLowerCase(),
            passwordHash,
            username: sanitizedUsername
        });
        await newUser.save();

        console.log('✅ New user created:', newUser._id);

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                weight: newUser.weight,
                height: newUser.height,
                age: newUser.age,
                gender: newUser.gender,
                profilePicture: newUser.profilePicture
            }
        });
    } catch (err) {
        console.error('❌ Signup error:', err.message);
        res.status(500).json({ error: 'An error occurred during signup' });
    }
});

// POST /auth/login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Timing-safe authentication: Always hash password even if user doesn't exist
        // This prevents timing attacks that could reveal valid emails
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        // Use fake hash if user doesn't exist to maintain constant time
        const passwordHash = user?.passwordHash || '$2a$10$fakeHashToPreventTimingAttacksFakeHashValue';
        const isMatch = await bcrypt.compare(password, passwordHash);

        // Always check both conditions to prevent early exit
        if (!user || !isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                weight: user.weight,
                height: user.height,
                age: user.age,
                gender: user.gender,
                profilePicture: user.profilePicture
            }
        });
    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});

module.exports = router;
