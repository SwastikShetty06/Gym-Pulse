const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Schedule = require('../models/Schedule');

// Get all schedules for user
router.get('/', auth, async (req, res) => {
    try {
        const schedules = await Schedule.find({ userId: req.user.id });
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Bulk create or update schedules (for copying routines)
router.post('/bulk', auth, async (req, res) => {
    try {
        const { schedules } = req.body;

        if (!Array.isArray(schedules)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const operations = schedules.map(sched => ({
            updateOne: {
                filter: { userId: req.user.id, day: sched.day },
                update: { $set: { exercises: sched.exercises, notes: sched.notes } },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Schedule.bulkWrite(operations);
        }

        res.json({ message: 'Schedules updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create or update schedule for a day
router.post('/', auth, async (req, res) => {
    try {
        const { day, exercises, notes } = req.body;
        let schedule = await Schedule.findOne({ userId: req.user.id, day });

        if (schedule) {
            schedule.exercises = exercises;
            schedule.notes = notes;
            await schedule.save();
        } else {
            schedule = new Schedule({ userId: req.user.id, day, exercises, notes });
            await schedule.save();
        }
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
