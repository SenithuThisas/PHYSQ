const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image'], required: true },
    content: { type: String, required: true }, // Text content or Image URL/Base64
}, {
    timestamps: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
