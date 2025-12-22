const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// GET /auth/check-username?username=value
router.get('/check-username', async (req, res) => {
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
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password, username } = req.body;
        console.log('Signup attempt for:', email);
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is missing in .env');
        }

        if (!fullName || !email || !password) return res.status(400).json({ error: 'Full name, email, and password required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        // Check if username is already taken (if provided)
        if (username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) return res.status(400).json({ error: 'Username already taken' });
        }

        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        console.log('Saving user to DB...');
        const newUser = new User({ fullName, email, passwordHash, username: username || undefined });
        await newUser.save();
        console.log('User saved:', newUser._id);

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('Token generated');
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
        console.error('Signup Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

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
        console.error('Signup Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
