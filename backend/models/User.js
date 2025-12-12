const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
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
