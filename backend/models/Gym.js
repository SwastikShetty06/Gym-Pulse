const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true }, // e.g., "New York, NY"
    description: { type: String },

    // Clan Members
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Live Occupancy Feature
    currentOccupancy: { type: Number, default: 0 },
    activeCheckins: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        checkInTime: { type: Date, default: Date.now },
        expiresAt: { type: Date }
    }],

    // Analytics
    dailyVisits: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gym', GymSchema);
