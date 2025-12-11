const express = require('express');
const router = express.Router();
const WorkoutSession = require('../models/WorkoutSession');
const authenticate = require('../middleware/authMiddleware');

// GET /progress/e1rm?exerciseName=Squat
router.get('/e1rm', authenticate, async (req, res) => {
    try {
        const { exerciseName, period } = req.query; // period could be 'month', 'year', 'all'
        if (!exerciseName) return res.status(400).json({ error: 'Exercise Name required' });

        // Aggregate to get max E1RM per session for the exercise
        // This is a simplified approach; aggregation pipeline would be more performant for large data
        const sessions = await WorkoutSession.find({
            userId: req.user.userId,
            'exercisesPerformed.exerciseName': exerciseName
        })
            .sort({ date: 1 })
            .select('date exercisesPerformed');

        const data = sessions.map(session => {
            const exercise = session.exercisesPerformed.find(e => e.exerciseName === exerciseName);
            if (!exercise) return null;

            // Find max E1RM in this session
            const maxE1RM = Math.max(...exercise.sets.map(s => s.e1rm || 0));
            return { date: session.date, e1rm: maxE1RM };
        }).filter(item => item !== null && item.e1rm > 0);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /progress/volume
router.get('/volume', authenticate, async (req, res) => {
    try {
        // Return total volume per session for now
        const sessions = await WorkoutSession.find({ userId: req.user.userId })
            .sort({ date: 1 })
            .select('date totalVolume');

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
