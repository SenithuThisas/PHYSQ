const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const authenticate = require('../middleware/authMiddleware');

// GET /schedule - Get user's schedule
router.get('/', authenticate, async (req, res) => {
    try {
        let schedule = await Schedule.findOne({ userId: req.user.userId });
        if (!schedule) {
            // Return empty default if not found
            return res.json({ type: 'text', content: '' });
        }
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /schedule - Update user's schedule
router.put('/', authenticate, async (req, res) => {
    try {
        const { type, content } = req.body;

        // Upsert: update if exists, insert if not
        const schedule = await Schedule.findOneAndUpdate(
            { userId: req.user.userId },
            { type, content },
            { new: true, upsert: true }
        );

        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
