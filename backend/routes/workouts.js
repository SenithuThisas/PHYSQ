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

// GET /workouts/stats - Aggregate statistics for Progress page
router.get('/stats', authenticate, async (req, res) => {
    try {
        const { timePeriod } = req.query; // '3 Months', '6 Months', 'Year-to-Date'
        const userId = req.user.userId;

        // 1. Calculate Date Range
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let startDate = new Date();

        if (timePeriod === '6 Months') {
            startDate.setMonth(now.getMonth() - 6);
        } else if (timePeriod === 'Year-to-Date') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else {
            // Default 3 Months
            startDate.setMonth(now.getMonth() - 3);
        }

        // 2. Fetch Sessions
        const sessions = await WorkoutSession.find({
            userId,
            date: { $gte: startDate }
        }).sort({ date: 1 });

        // 3. Process "This Week" Stats
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        let weeklyMinutes = 0;
        let weeklyMuscles = new Set();

        // Also fetch all exercises to map names to muscles (optimization: could populate, but map is fine)
        const allExerciseDocs = await require('../models/Exercise').find({ userId });
        const exerciseMap = {};
        allExerciseDocs.forEach(e => exerciseMap[e.name] = e.muscle);

        // 4. Calendar Data & Streak Calculation
        // Need ALL sessions for accurate streak, not just the filtered timePeriod
        const allSessions = await WorkoutSession.find({ userId }).sort({ date: -1 });

        const calendarData = {};
        const uniqueDates = new Set();

        // Helper to get local YYYY-MM-DD
        const getLocalDateStr = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        allSessions.forEach(s => {
            const d = new Date(s.date);
            const dateStr = getLocalDateStr(d);

            // For Calendar
            if (!calendarData[dateStr]) {
                calendarData[dateStr] = { marked: true, dotColor: '#CCFF00' }; // Primary color
            }
            uniqueDates.add(dateStr);
        });

        // Calculate Streak
        let currentStreak = 0;
        const sortedDates = Array.from(uniqueDates).sort().reverse(); // Newest first

        if (sortedDates.length > 0) {
            const yesterdayDate = new Date(today);
            yesterdayDate.setDate(today.getDate() - 1);

            const todayStr = getLocalDateStr(today);
            const yesterdayStr = getLocalDateStr(yesterdayDate);

            // If valid streak exists (worked out today or yesterday)
            if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
                // Start checking from today if present, else yesterday
                let datePointer = sortedDates.includes(todayStr) ? new Date(today) : new Date(yesterdayDate);

                // Infinite loop protection/sanity check: match streak length to dates
                // However, iterating sorted dates is safer if gaps exist.
                // We need to check consecutive days.

                while (true) {
                    const checkStr = getLocalDateStr(datePointer);
                    if (sortedDates.includes(checkStr)) {
                        currentStreak++;
                        datePointer.setDate(datePointer.getDate() - 1); // Move back one day
                    } else {
                        break;
                    }
                }
            }
        }

        // 5. Chart Data Aggregation (Weekly buckets)
        const chartLabels = [];
        const chartDuration = [];
        const chartVolume = [];
        const chartWorkouts = [];

        // Helper to bucket by week
        const weeks = {};

        sessions.forEach(session => {
            const d = new Date(session.date);
            // Simple "Week Number" key: Year-Week
            const onejan = new Date(d.getFullYear(), 0, 1);
            const weekNum = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            const key = `${d.getFullYear()}-W${weekNum}`;

            if (!weeks[key]) {
                weeks[key] = { duration: 0, volume: 0, count: 0, label: `W${weekNum}` };
            }
            weeks[key].duration += session.duration || 0;
            weeks[key].volume += session.totalVolume || 0;
            weeks[key].count += 1;

            // This Week Calculation
            if (d >= startOfWeek) {
                weeklyMinutes += session.duration || 0;
                session.exercisesPerformed.forEach(ex => {
                    const muscle = exerciseMap[ex.exerciseName];
                    if (muscle) weeklyMuscles.add(muscle);
                });
            }
        });

        // Convert Map to Arrays (Sort keys just in case)
        Object.keys(weeks).sort().forEach(key => {
            chartLabels.push(weeks[key].label);
            chartDuration.push(weeks[key].duration);
            chartVolume.push(weeks[key].volume);
            chartWorkouts.push(weeks[key].count);
        });

        // Ensure we have at least some data points to avoid empty chart crashes
        if (chartLabels.length === 0) {
            chartLabels.push('No Data');
            chartDuration.push(0);
            chartVolume.push(0);
            chartWorkouts.push(0);
        }

        res.json({
            weeklyMinutes,
            weeklyMuscles: Array.from(weeklyMuscles),
            currentStreak,
            calendarData,
            chartData: {
                labels: chartLabels,
                datasets: {
                    Duration: chartDuration,
                    Volume: chartVolume,
                    Workouts: chartWorkouts
                }
            }
        });

    } catch (err) {
        console.error(err);
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
