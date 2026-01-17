const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Gym = require('../models/Gym');
const User = require('../models/User');

// @route   POST /api/gyms
// @desc    Register a new Gym Clan
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { name, location, description } = req.body;

        let gym = new Gym({
            name,
            location,
            description,
            members: [req.user.id] // Creator is first member
        });

        await gym.save();

        // Update user
        await User.findByIdAndUpdate(req.user.id, { gym: gym._id });

        res.json(gym);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/gyms
// @desc    Search Gyms
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const gyms = await Gym.find(query).select('-activeCheckins').limit(20);
        res.json(gyms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/gyms/:id
// @desc    Get Gym Details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id)
            .populate('members', 'name email isPrivate')
            .populate('activeCheckins.user', 'name');

        if (!gym) return res.status(404).json({ msg: 'Gym not found' });

        // Clean up expired checkins before sending
        const now = new Date();
        const initialCount = gym.activeCheckins.length;
        gym.activeCheckins = gym.activeCheckins.filter(c => c.expiresAt > now);
        gym.currentOccupancy = gym.activeCheckins.length;

        if (initialCount !== gym.activeCheckins.length) {
            await gym.save();
        }

        res.json(gym);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/gyms/join/:id
// @desc    Join a Gym
// @access  Private
router.post('/join/:id', auth, async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) return res.status(404).json({ msg: 'Gym not found' });

        // Check if already in a gym? (Optional: Allow switching)
        const user = await User.findById(req.user.id);
        if (user.gym) {
            // Remove from old gym
            await Gym.findByIdAndUpdate(user.gym, { $pull: { members: req.user.id } });
        }

        // Add to new gym
        if (!gym.members.includes(req.user.id)) {
            gym.members.push(req.user.id);
            await gym.save();
        }

        user.gym = gym._id;
        await user.save();

        res.json(gym);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/gyms/leave
// @desc    Leave current Gym
// @access  Private
router.post('/leave', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.gym) return res.status(400).json({ msg: 'Not in a gym' });

        // Remove from gym members
        await Gym.findByIdAndUpdate(user.gym, { $pull: { members: req.user.id } });

        // Remove gym from user
        user.gym = null;
        await user.save();

        res.json({ msg: 'Left gym successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/gyms/checkin
// @desc    Toggle Check-in (Live Occupancy)
// @access  Private
router.post('/checkin', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.gym) return res.status(400).json({ msg: 'Join a gym first' });

        const gym = await Gym.findById(user.gym);

        // Check if already checked in
        const existingIndex = gym.activeCheckins.findIndex(c => c.user.toString() === req.user.id);

        if (existingIndex > -1) {
            // Checkout
            gym.activeCheckins.splice(existingIndex, 1);
            gym.currentOccupancy = Math.max(0, gym.currentOccupancy - 1);
            await gym.save();
            return res.json({ status: 'checked_out', occupancy: gym.currentOccupancy });
        } else {
            // Checkin (Expires in 2 hours)
            const expires = new Date();
            expires.setHours(expires.getHours() + 2);

            gym.activeCheckins.push({
                user: req.user.id,
                expiresAt: expires
            });
            gym.currentOccupancy += 1;
            gym.dailyVisits += 1;
            await gym.save();
            return res.json({ status: 'checked_in', occupancy: gym.currentOccupancy, expires });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
