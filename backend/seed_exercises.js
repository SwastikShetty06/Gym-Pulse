const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('./models/Exercise');

const exercises = [
    { name: 'Bench Press', category: 'Chest', targetMuscles: ['Pectorals', 'Triceps', 'Shoulders'] },
    { name: 'Squats', category: 'Legs', targetMuscles: ['Quads', 'Glutes', 'Hamstrings'] },
    { name: 'Deadlifts', category: 'Back', targetMuscles: ['Lower Back', 'Hamstrings', 'Glutes'] },
    { name: 'Overhead Press', category: 'Shoulders', targetMuscles: ['Shoulders', 'Triceps'] },
    { name: 'Pull Ups', category: 'Back', targetMuscles: ['Lats', 'Biceps'] },
    { name: 'Barbell Rows', category: 'Back', targetMuscles: ['Lats', 'Rhomboids'] },
    { name: 'Dips', category: 'Chest', targetMuscles: ['Pectorals', 'Triceps'] },
    { name: 'Lunges', category: 'Legs', targetMuscles: ['Quads', 'Glutes'] },
    { name: 'Bicep Curls', category: 'Arms', targetMuscles: ['Biceps'] },
    { name: 'Tricep Pushdowns', category: 'Arms', targetMuscles: ['Triceps'] },
    { name: 'Lateral Raises', category: 'Shoulders', targetMuscles: ['Shoulders'] },
    { name: 'Leg Press', category: 'Legs', targetMuscles: ['Quads'] },
    { name: 'Calf Raises', category: 'Legs', targetMuscles: ['Calves'] },
    { name: 'Face Pulls', category: 'Shoulders', targetMuscles: ['Rear Delts'] },
    { name: 'Hammer Curls', category: 'Arms', targetMuscles: ['Brachialis', 'Biceps'] }
];

const seedExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for exercise seeding...');

        await Exercise.deleteMany({});
        await Exercise.insertMany(exercises);

        console.log('Seeded 15 common exercises.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedExercises();
