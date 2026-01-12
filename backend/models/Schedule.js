const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    exercises: [{
        name: { type: String, required: true },
        sets: { type: Number, default: 3 },
        reps: { type: String, default: '10-12' },
        weight: { type: String, default: '' }
    }],
    notes: { type: String, default: '' }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
