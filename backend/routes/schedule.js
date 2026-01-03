const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const authenticate = require('../middleware/authMiddleware');

// GET /schedule - Get all user schedules
router.get('/', authenticate, async (req, res) => {
    try {
        const schedules = await Schedule.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /schedule - Create new schedule
router.post('/', authenticate, async (req, res) => {
    try {
        const { title, type, content } = req.body;
        const schedule = new Schedule({
            userId: req.user.userId,
            title,
            type,
            content
        });
        await schedule.save();
        res.status(201).json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /schedule/:id - Update existing schedule
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { title, type, content } = req.body;
        const schedule = await Schedule.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { title, type, content },
            { new: true }
        );
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /schedule/:id - Delete schedule
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json({ message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
