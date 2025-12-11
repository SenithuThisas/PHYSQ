const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    rpe: { type: Number, default: null },
    e1rm: { type: Number, default: 0 } // Calculated Epley 1RM
});

const ExercisePerformedSchema = new mongoose.Schema({
    exerciseName: { type: String, required: true },
    sets: [SetSchema]
});

const WorkoutSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 }, // in minutes
    templateName: { type: String, default: null }, // If loaded from a template
    exercisesPerformed: [ExercisePerformedSchema],
    totalVolume: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('WorkoutSession', WorkoutSessionSchema);
