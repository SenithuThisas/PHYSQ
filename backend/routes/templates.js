const express = require('express');
const router = express.Router();
const Template = require('../models/Template');
const authenticate = require('../middleware/authMiddleware');

// GET /templates
router.get('/', authenticate, async (req, res) => {
    try {
        const templates = await Template.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /templates
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, exercises } = req.body;
        if (!name) return res.status(400).json({ error: 'Template name required' });

        const newTemplate = new Template({
            userId: req.user.userId,
            name,
            exercises
        });

        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
