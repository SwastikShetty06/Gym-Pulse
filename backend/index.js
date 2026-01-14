const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/prs', require('./routes/prs'));
app.use('/api/social', require('./routes/social'));
app.use('/api/gyms', require('./routes/gyms'));

app.get('/', (req, res) => {
    res.send('Gym Pulse API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
