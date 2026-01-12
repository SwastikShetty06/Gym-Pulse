const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');

// Get attendance history
router.get('/', auth, async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark attendance for a date
router.post('/', auth, async (req, res) => {
    try {
        const { date, mood, duration } = req.body;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        let attendance = await Attendance.findOne({
            userId: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (attendance) {
            attendance.mood = mood;
            attendance.duration = duration;
            await attendance.save();
        } else {
            attendance = new Attendance({ userId: req.user.id, date, mood, duration });
            await attendance.save();
        }
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
