const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const auth = require('../middleware/auth');

// @route   GET api/exercises
// @desc    Get all exercises
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const exercises = await Exercise.find().sort({ name: 1 });
        res.json(exercises);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
