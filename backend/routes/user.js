const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token (should actally be a separate middleware file, but inlining for consistency with existing code if applicable, or I'll implement a quick one)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// GET /user/profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /user/profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, username, age, gender, height, weight, profilePicture } = req.body;

        // Build update object
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (username) updateData.username = username;
        if (age) updateData.age = age;
        if (gender) updateData.gender = gender;
        if (height) {
            updateData.height = height;
            // We use $push in the update query
        }
        if (weight) {
            updateData.weight = weight;
        }
        if (profilePicture) updateData.profilePicture = profilePicture;

        const updateQuery = { $set: updateData };
        const pushQuery = {};

        if (weight) {
            pushQuery.weightHistory = { value: weight.value, unit: weight.unit };
        }
        if (height) {
            pushQuery.heightHistory = { value: height.value, unit: height.unit };
        }

        if (Object.keys(pushQuery).length > 0) {
            updateQuery.$push = pushQuery;
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateQuery,
            { new: true }
        ).select('-passwordHash');

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
