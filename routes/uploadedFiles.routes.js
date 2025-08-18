
const express = require('express');
const uploadController = require('../controllers/uploadedFiles.controller');
const router = express.Router();

router.post('/upload_files', uploadController.uploadFile);

module.exports = router;