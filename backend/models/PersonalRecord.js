const mongoose = require('mongoose');

const PersonalRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exercise: { type: String, required: true },
    weight: { type: Number, required: true },
    reps: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PersonalRecord', PersonalRecordSchema);
