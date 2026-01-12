const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Schedule = require('./models/Schedule');
const Attendance = require('./models/Attendance');

const userId = '6964b3bfd339422f65fa3b08'; // Gym Pro ID from user screenshot

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Create Weekly Schedule (Mon-Sat)
        const weeklyWorkouts = [
            { day: 'Monday', exercises: [{ name: 'Bench Press', sets: 4, reps: '8-10' }, { name: 'Incline DB Press', sets: 3, reps: '10-12' }, { name: 'Tricep Pushdowns', sets: 3, reps: '15' }] },
            { day: 'Tuesday', exercises: [{ name: 'Deadlifts', sets: 3, reps: '5' }, { name: 'Lat Pulldowns', sets: 4, reps: '10' }, { name: 'Bicep Curls', sets: 3, reps: '12' }] },
            { day: 'Wednesday', exercises: [{ name: 'Squats', sets: 4, reps: '8-10' }, { name: 'Leg Press', sets: 3, reps: '12' }, { name: 'Calf Raises', sets: 4, reps: '15' }] },
            { day: 'Thursday', exercises: [{ name: 'Overhead Press', sets: 4, reps: '10' }, { name: 'Lateral Raises', sets: 4, reps: '15' }, { name: 'Face Pulls', sets: 3, reps: '15' }] },
            { day: 'Friday', exercises: [{ name: 'Weighted Pullups', sets: 3, reps: '8' }, { name: 'Barbell Rows', sets: 4, reps: '10' }, { name: 'Hammer Curls', sets: 3, reps: '12' }] },
            { day: 'Saturday', exercises: [{ name: 'HIIT Sprints', sets: 10, reps: '30s' }, { name: 'Core Circuit', sets: 3, reps: '20' }] }
        ];

        await Schedule.deleteMany({ userId });
        for (const workout of weeklyWorkouts) {
            await new Schedule({ userId, ...workout }).save();
        }
        console.log('Schedules created.');

        // 2. Create 6 Months of Attendance (Exclude Sundays)
        await Attendance.deleteMany({ userId });
        const attendances = [];
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        for (let d = new Date(sixMonthsAgo); d < today; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay(); // 0 is Sunday

            // Keep Sundays as rest days
            if (dayOfWeek === 0) continue;

            // Randomly skip a day here and there (approx 1-2 per month)
            if (Math.random() < 0.05) continue;

            attendances.push({
                userId,
                date: new Date(d),
                attended: true,
                mood: ['Killer', 'Good', 'Meh'][Math.floor(Math.random() * 3)],
                duration: 45 + Math.floor(Math.random() * 30)
            });
        }

        await Attendance.insertMany(attendances);
        console.log(`Seeded ${attendances.length} attendance records.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
