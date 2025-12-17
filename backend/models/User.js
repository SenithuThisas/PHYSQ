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
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Prefer not to say', 'Other'],
        default: 'Prefer not to say'
    },
    height: {
        value: Number,
        unit: {
            type: String,
            enum: ['cm', 'ft'],
            default: 'cm'
        }
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg'
        }
    },
    weightHistory: [{
        value: Number,
        unit: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    heightHistory: [{
        value: Number,
        unit: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    profilePicture: {
        type: String // URL or Base64
    },
    scheduleImage: {
        type: String // URL or Base64   
    },
    workoutSessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutSession'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
