const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/health.controller.js');



/**
 * @route GET /api/health
 * @description Basic health check endpoint
 */
router.get('/', HealthController.checkHealth);

/**
 * @route GET /api/health/system
 * @description Detailed system information
 */
router.get('/system', HealthController.getSystemInfo);

module.exports = router;
