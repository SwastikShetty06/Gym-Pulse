const express = require('express');
const router = express.Router();
const PersonalRecord = require('../models/PersonalRecord');
const auth = require('../middleware/auth');

// @route   GET api/prs
// @desc    Get all personal records for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const prs = await PersonalRecord.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(prs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/prs
// @desc    Add or update a personal record
// @access  Private
router.post('/', auth, async (req, res) => {
    const { exercise, weight, reps } = req.body;
    try {
        let pr = await PersonalRecord.findOne({ userId: req.user.id, exercise });
        if (pr) {
            // Only update if the new weight is higher or same weight but more reps
            if (weight > pr.weight || (weight === pr.weight && reps > pr.reps)) {
                pr.weight = weight;
                pr.reps = reps;
                pr.date = Date.now();
                await pr.save();
            }
        } else {
            pr = new PersonalRecord({
                userId: req.user.id,
                exercise,
                weight,
                reps
            });
            await pr.save();
        }
        res.json(pr);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
