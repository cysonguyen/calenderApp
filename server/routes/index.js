const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

// Mount routes
router.use('/auth', authRoutes);

// Add more route modules here as needed
// Example: router.use('/users', userRoutes);
// Example: router.use('/events', eventRoutes);

module.exports = router; 