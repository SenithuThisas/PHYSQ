const express = require('express');
const router = express.Router();
const WorkoutSession = require('../models/WorkoutSession');
const authenticate = require('../middleware/authMiddleware'); // Need to create this middleware!

// Helper for Epley E1RM
const calculateE1RM = (weight, reps) => {
    if (reps > 10) return 0; // Formula less accurate for high reps, requirement I2 says <= 10
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
};

// POST /workouts - Save a completed session
router.post('/', authenticate, async (req, res) => {
    try {
        const { date, duration, templateName, exercisesPerformed } = req.body;
        let totalVolume = 0;

        // Process exercises to calc E1RM and Volume
        const processedExercises = exercisesPerformed.map(exercise => {
            const processedSets = exercise.sets.map(set => {
                const e1rm = calculateE1RM(set.weight, set.reps);
                totalVolume += set.weight * set.reps;
                return { ...set, e1rm };
            });
            return { ...exercise, sets: processedSets };
        });

        const session = new WorkoutSession({
            userId: req.user.userId,
            date,
            duration,
            templateName,
            exercisesPerformed: processedExercises,
            totalVolume
        });

        await session.save();
        // TODO: Check for Personal Bests here (Feature I1) - Will implement later

        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /workouts - Get history (pagination support optional for now)
router.get('/', authenticate, async (req, res) => {
    try {
        const sessions = await WorkoutSession.find({ userId: req.user.userId })
            .sort({ date: -1 })
            .limit(20);
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /workouts/history - Get last session for specific exercise (Smart Suggestions)
router.get('/history', authenticate, async (req, res) => {
    try {
        const { exerciseName } = req.query;
        if (!exerciseName) return res.status(400).json({ error: 'Exercise Name required' });

        // Find the most recent session containing this exercise
        const lastSession = await WorkoutSession.findOne({
            userId: req.user.userId,
            'exercisesPerformed.exerciseName': exerciseName
        })
            .sort({ date: -1 });

        if (!lastSession) return res.json(null);

        const exerciseData = lastSession.exercisesPerformed.find(e => e.exerciseName === exerciseName);
        res.json({ date: lastSession.date, exerciseData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /workouts/:id - Update an existing workout
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, templateName, exercisesPerformed } = req.body;

        // Find the workout session
        const session = await WorkoutSession.findOne({ _id: id, userId: req.user.userId });
        if (!session) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Recalculate volume and E1RM
        let totalVolume = 0;
        const processedExercises = exercisesPerformed.map(exercise => {
            const processedSets = exercise.sets.map(set => {
                const e1rm = calculateE1RM(set.weight, set.reps);
                totalVolume += set.weight * set.reps;
                return { ...set, e1rm };
            });
            return { ...exercise, sets: processedSets };
        });

        // Update fields
        session.date = date || session.date;
        session.templateName = templateName || session.templateName;
        session.exercisesPerformed = processedExercises;
        session.totalVolume = totalVolume;

        await session.save();
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /workouts/weekly - Count workouts this week
router.get('/weekly', authenticate, async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
        startOfWeek.setHours(0, 0, 0, 0);

        const count = await WorkoutSession.countDocuments({
            userId: req.user.userId,
            date: { $gte: startOfWeek }
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /workouts/:id - Delete a workout session
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await WorkoutSession.deleteOne({
            _id: id,
            userId: req.user.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        res.json({ message: 'Workout deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
