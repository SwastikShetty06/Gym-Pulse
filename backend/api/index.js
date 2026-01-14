try {
    const app = require('../app');
    module.exports = app;
} catch (error) {
    console.error('Boot Error:', error);
    module.exports = (req, res) => {
        res.status(500).json({
            error: 'Server Boot Failed',
            message: error.message,
            stack: error.stack
        });
    };
}
