const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const PersonalRecord = require('../models/PersonalRecord');

// @route   GET api/social/search?q=...
// @desc    Search for users
router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user.id }
        }).select('name email followers following friends friendRequests isPrivate');

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/social/request/:id
// @desc    Send a friend request
router.post('/request/:id', auth, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!targetUser) return res.status(404).json({ msg: 'User not found' });

        // Check if already friends
        if (currentUser.friends.includes(targetUser._id)) {
            return res.status(400).json({ msg: 'Already friends' });
        }

        // Check if request already pending
        const existingRequest = targetUser.friendRequests.find(
            r => r.user.toString() === req.user.id && r.status === 'pending'
        );
        if (existingRequest) return res.status(400).json({ msg: 'Request already pending' });

        // Add outgoing to current user
        currentUser.friendRequests.push({ user: targetUser._id, type: 'outgoing' });
        // Add incoming to target user
        targetUser.friendRequests.push({ user: currentUser._id, type: 'incoming' });

        await currentUser.save();
        await targetUser.save();

        res.json({ msg: 'Friend request sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/social/respond/:id
// @desc    Accept or reject friend request
router.put('/respond/:id', auth, async (req, res) => {
    const { action } = req.body; // 'accepted' or 'rejected'
    try {
        const currentUser = await User.findById(req.user.id);
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) return res.status(404).json({ msg: 'User not found' });

        // Update current user's request
        const currentReq = currentUser.friendRequests.find(
            r => r.user.toString() === req.params.id && r.type === 'incoming'
        );
        if (!currentReq) return res.status(400).json({ msg: 'No pending request found' });

        currentReq.status = action;

        // Update target user's request
        const targetReq = targetUser.friendRequests.find(
            r => r.user.toString() === req.user.id && r.type === 'outgoing'
        );
        if (targetReq) targetReq.status = action;

        if (action === 'accepted') {
            currentUser.friends.push(targetUser._id);
            targetUser.friends.push(currentUser._id);
        }

        // Clean up: Optional - remove processed requests or keep them for history
        // For now, let's just keep them marked

        await currentUser.save();
        await targetUser.save();

        res.json({ msg: `Request ${action}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/social/follow/:id
// @desc    Toggle follow/unfollow
router.post('/follow/:id', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) return res.status(404).json({ msg: 'User not found' });

        const isFollowing = currentUser.following.includes(targetUser._id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
        } else {
            // Follow
            currentUser.following.push(targetUser._id);
            targetUser.followers.push(currentUser._id);
        }

        await currentUser.save();
        await targetUser.save();

        res.json({ isFollowing: !isFollowing });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/social/network
// @desc    Get current user's network
router.get('/network', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'name email')
            .populate('followers', 'name email')
            .populate('following', 'name email')
            .populate('friendRequests.user', 'name email');

        res.json({
            friends: user.friends,
            followers: user.followers,
            following: user.following,
            requests: user.friendRequests
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/social/profile/:id
const Schedule = require('../models/Schedule');

// Helper to calculate streak (matching Dashboard.jsx logic)
const calculateStreak = (attendanceData) => {
    if (!attendanceData || attendanceData.length === 0) return 0;

    // Create unique set of dates
    const attSet = new Set(attendanceData.map(a => new Date(a.date).toDateString()));
    let streak = 0;
    let curr = new Date();
    curr.setHours(0, 0, 0, 0);

    // Fix: If today is not attended, start checking from yesterday
    if (!attSet.has(curr.toDateString())) {
        curr.setDate(curr.getDate() - 1);
    }

    let misses = 0;
    let window = [];

    while (true) {
        const dStr = curr.toDateString();
        const attended = attSet.has(dStr);
        window.push(attended);
        if (window.length > 7) {
            if (!window.shift()) misses--; // remove oldest from window, decrement misses if it was false
        }

        if (attended) {
            streak++;
        } else {
            misses++; // temporarily increment misses
        }

        // This is a direct port of the potentially flawed but "source of truth" dashboard logic
        if (misses > 1) break;

        curr.setDate(curr.getDate() - 1);
        if (streak > 500) break;
    }
    return streak;
};

// @desc    Get a user's progress and PRs (for social view)
router.get('/profile/:id', auth, async (req, res) => {
    try {
        const targetId = req.params.id;

        // Fetch data in parallel
        // Using limit(500) or removing limit entirely is safer for accurate history
        const [attendance, prs, schedule, user] = await Promise.all([
            Attendance.find({ userId: targetId }).sort({ date: -1 }).limit(365),
            PersonalRecord.find({ userId: targetId }).sort({ date: -1 }),
            Schedule.find({ userId: targetId }),
            User.findById(targetId).select('name email followers following friends isPrivate')
        ]);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Robust check for ObjectId array
        const isFriend = user.friends.some(friendId => friendId.toString() === req.user.id);
        const isSelf = targetId === req.user.id;

        console.log(`[Profile View] Target: ${user.name} (${targetId}), Viewer: ${req.user.id}, Private: ${user.isPrivate}, IsFriend: ${isFriend}, IsSelf: ${isSelf}`);

        // Privacy Check
        if (user.isPrivate && !isFriend && !isSelf) {
            console.log('--- RESTRICTING ACCESS ---');
            return res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isPrivate: true,
                    followers: user.followers,
                    following: user.following,
                },
                isPrivate: true,
                attendance: [],
                prs: [],
                schedule: [],
                streak: 0,
                consistency: 0
            });
        }

        const streak = calculateStreak(attendance);
        // Matching Attendance.jsx logic: (total / 158) * 100
        const consistency = Math.round((attendance.length / 158) * 100);

        res.json({
            user,
            attendance: attendance.slice(0, 30),
            prs,
            schedule,
            streak,
            consistency
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
