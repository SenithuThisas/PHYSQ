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
        const { timePeriod, timezoneOffset } = req.query; // offset in minutes
        const userId = req.user.userId;

        // Helper: Convert UTC date to Client's Local Date object (Shifted)
        const offsetMinutes = parseInt(timezoneOffset) || 0;
        const toClientDate = (date) => {
            return new Date(date.getTime() - (offsetMinutes * 60000));
        };

        const now = new Date();
        const clientNow = toClientDate(now);
        const today = new Date(clientNow.getFullYear(), clientNow.getMonth(), clientNow.getDate());

        let startDate = new Date(today);

        if (timePeriod === '6 Months') {
            startDate.setMonth(today.getMonth() - 6);
        } else if (timePeriod === 'Year-to-Date') {
            startDate = new Date(today.getFullYear(), 0, 1);
        } else {
            // Default 3 Months
            startDate.setMonth(today.getMonth() - 3);
        }

        const queryDate = new Date(startDate.getTime() + (offsetMinutes * 60000) - 86400000);

        // 2. Fetch Sessions
        const sessions = await WorkoutSession.find({
            userId,
            date: { $gte: queryDate }
        }).sort({ date: 1 });

        // 3. Process "This Week" Stats
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        let weeklyMinutes = 0;
        let weeklyMuscles = new Set();

        const allExerciseDocs = await require('../models/Exercise').find({ userId });
        const exerciseMap = {};
        allExerciseDocs.forEach(e => exerciseMap[e.name] = e.muscle);

        // 4. Calendar Data & Streak Calculation
        const allSessions = await WorkoutSession.find({ userId }).sort({ date: -1 });

        const dailyStats = {}; // Map of dateStr -> { xp, level, count }
        const uniqueDates = new Set();

        const getClientDateStr = (d) => {
            const clientD = toClientDate(d);
            const year = clientD.getUTCFullYear();
            const month = String(clientD.getUTCMonth() + 1).padStart(2, '0');
            const day = String(clientD.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        allSessions.forEach(s => {
            const dateStr = getClientDateStr(s.date);

            // Calculate XP
            const durationXP = (s.duration || 0) * 1.5;
            const volumeXP = (s.totalVolume || 0) * 0.001;
            const sessionXP = Math.round(durationXP + volumeXP + 10);

            if (!dailyStats[dateStr]) {
                dailyStats[dateStr] = { xp: 0, count: 0, level: 0 };
            }

            dailyStats[dateStr].xp += sessionXP;
            dailyStats[dateStr].count += 1;

            // Determine Level (0-4)
            const totalXP = dailyStats[dateStr].xp;
            let level = 0;
            if (totalXP > 0) level = 1;
            if (totalXP > 50) level = 2;
            if (totalXP > 100) level = 3;
            if (totalXP > 200) level = 4;

            dailyStats[dateStr].level = level;
            uniqueDates.add(dateStr);
        });

        // Calculate Current & Best Streak
        let currentStreak = 0;
        let bestStreak = 0;
        const sortedDates = Array.from(uniqueDates).sort().reverse(); // Newest first

        if (sortedDates.length > 0) {
            const todayStr = getClientDateStr(new Date());
            const todayClient = toClientDate(new Date());
            const yestClient = new Date(todayClient);
            yestClient.setDate(yestClient.getDate() - 1);

            const tStr = `${todayClient.getUTCFullYear()}-${String(todayClient.getUTCMonth() + 1).padStart(2, '0')}-${String(todayClient.getUTCDate()).padStart(2, '0')}`;
            const yStr = `${yestClient.getUTCFullYear()}-${String(yestClient.getUTCMonth() + 1).padStart(2, '0')}-${String(yestClient.getUTCDate()).padStart(2, '0')}`;

            if (sortedDates.includes(tStr) || sortedDates.includes(yStr)) {
                let checkDate = sortedDates.includes(tStr) ? todayClient : yestClient;
                let ptr = new Date(checkDate);

                while (true) {
                    const year = ptr.getUTCFullYear();
                    const month = String(ptr.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(ptr.getUTCDate()).padStart(2, '0');
                    const sStr = `${year}-${month}-${day}`;

                    if (sortedDates.includes(sStr)) {
                        currentStreak++;
                        ptr.setDate(ptr.getDate() - 1);
                    } else {
                        break;
                    }
                }
            }
        }

        // Best Streak
        const chronologicalDates = [...sortedDates].reverse();
        if (chronologicalDates.length > 0) {
            let maxS = 1;
            let tempS = 1;

            for (let i = 1; i < chronologicalDates.length; i++) {
                const prev = new Date(chronologicalDates[i - 1]);
                const curr = new Date(chronologicalDates[i]);
                const diffTime = Math.abs(curr - prev);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempS++;
                } else {
                    tempS = 1;
                }
                if (tempS > maxS) maxS = tempS;
            }
            bestStreak = maxS;
        }

        // Badges
        const badges = [
            { id: 'first_step', label: 'First Step', icon: 'footsteps', unlocked: allSessions.length >= 1, description: 'Completed your first workout' },
            { id: 'on_fire', label: 'On Fire', icon: 'flame', unlocked: currentStreak >= 3, description: '3 Day Streak' },
            { id: 'week_warrior', label: 'Week Warrior', icon: 'calendar', unlocked: currentStreak >= 7, description: '7 Day Streak' },
            { id: 'consistent', label: 'Consistency', icon: 'trophy', unlocked: bestStreak >= 14, description: '14 Day Best Streak' },
            { id: 'beast_mode', label: 'Beast Mode', icon: 'barbell', unlocked: Object.values(dailyStats).some(d => d.level === 4), description: 'Reached Level 4 Intensity' }
        ];

        // 5. Chart Data
        const chartLabels = [];
        const chartDuration = [];
        const chartVolume = [];
        const chartWorkouts = [];
        const weeks = {};

        sessions.forEach(session => {
            const clientSessionDate = toClientDate(session.date);
            const d = clientSessionDate;
            const onejan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNum = Math.ceil((((d - onejan) / 86400000) + onejan.getUTCDay() + 1) / 7);
            const key = `${d.getUTCFullYear()}-W${weekNum}`;

            if (!weeks[key]) {
                weeks[key] = { duration: 0, volume: 0, count: 0, label: `W${weekNum}` };
            }
            weeks[key].duration += session.duration || 0;
            weeks[key].volume += session.totalVolume || 0;
            weeks[key].count += 1;

            if (clientSessionDate >= startOfWeek) {
                weeklyMinutes += session.duration || 0;
                session.exercisesPerformed.forEach(ex => {
                    const muscle = exerciseMap[ex.exerciseName];
                    if (muscle) weeklyMuscles.add(muscle);
                });
            }
        });

        Object.keys(weeks).sort().forEach(key => {
            chartLabels.push(weeks[key].label);
            chartDuration.push(weeks[key].duration);
            chartVolume.push(weeks[key].volume);
            chartWorkouts.push(weeks[key].count);
        });

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
            bestStreak,
            totalWorkouts: allSessions.length,
            dailyStats,
            badges,
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
