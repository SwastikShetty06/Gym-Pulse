const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true }, // Chest, Back, Legs, etc.
    description: String,
    targetMuscles: [String]
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
