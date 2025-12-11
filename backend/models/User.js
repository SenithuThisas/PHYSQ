const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    workoutSessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutSession'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
