const mongoose = require('mongoose');

const TemplateExerciseSchema = new mongoose.Schema({
    exerciseName: { type: String, required: true },
    defaultSets: { type: Number, default: 3 },
    defaultReps: { type: Number, default: 10 }
});

const TemplateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    exercises: [TemplateExerciseSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model('Template', TemplateSchema);
