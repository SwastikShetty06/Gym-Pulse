const mongoose = require('mongoose');
require('dotenv').config();
const PersonalRecord = require('./models/PersonalRecord');

const userId = '6964b3bfd339422f65fa3b08'; // Gym Pro

const prs = [
    { userId, exercise: 'Bench Press', weight: 100, reps: 5, date: new Date('2026-01-01') },
    { userId, exercise: 'Squats', weight: 140, reps: 3, date: new Date('2026-01-05') },
    { userId, exercise: 'Deadlifts', weight: 180, reps: 1, date: new Date('2026-01-10') }
];

const seedPRs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for PR seeding...');
        await PersonalRecord.deleteMany({ userId });
        await PersonalRecord.insertMany(prs);
        console.log('Seeded 3 Personal Records.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPRs();
