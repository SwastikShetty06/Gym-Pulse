const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    attended: { type: Boolean, default: true },
    mood: { type: String, enum: ['Killer', 'Good', 'Meh', 'Tired'], default: 'Good' },
    duration: { type: Number }, // in minutes
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
