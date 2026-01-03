const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const authenticate = require('../middleware/authMiddleware');

// GET /exercises - Get all custom exercises for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const exercises = await Exercise.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /exercises - Create a new custom exercise
router.post('/', authenticate, async (req, res) => {
    try {
        const { name, muscle } = req.body;

        if (!name || !muscle) {
            return res.status(400).json({ error: 'Name and muscle group are required' });
        }

        // Check if exercise with same name already exists for this user
        const existingExercise = await Exercise.findOne({
            userId: req.user.userId,
            name: name.trim()
        });

        if (existingExercise) {
            return res.status(400).json({ error: 'You already have an exercise with this name' });
        }

        const exercise = new Exercise({
            userId: req.user.userId,
            name: name.trim(),
            muscle
        });

        await exercise.save();
        res.status(201).json(exercise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /exercises/:id - Update an existing custom exercise
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, muscle } = req.body;

        // Find the exercise and ensure it belongs to the authenticated user
        const exercise = await Exercise.findOne({ _id: id, userId: req.user.userId });

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // If name is being changed, check for duplicates
        if (name && name.trim() !== exercise.name) {
            const existingExercise = await Exercise.findOne({
                userId: req.user.userId,
                name: name.trim(),
                _id: { $ne: id } // Exclude current exercise
            });

            if (existingExercise) {
                return res.status(400).json({ error: 'You already have an exercise with this name' });
            }
            exercise.name = name.trim();
        }

        if (muscle) {
            exercise.muscle = muscle;
        }

        await exercise.save();
        res.json(exercise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /exercises/:id - Delete a custom exercise
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Exercise.deleteOne({
            _id: id,
            userId: req.user.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        res.json({ message: 'Exercise deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
