const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    muscle: {
        type: String,
        required: true,
        enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate exercise names per user
ExerciseSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Exercise', ExerciseSchema);
