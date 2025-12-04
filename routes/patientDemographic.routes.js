const express = require('express');

const PatientDemographicController = require('../controllers/patientDemographics.controller.js');
const { uploadSingle, handleMulterError } = require('../middleware/upload.js');
const multer = require('multer');

const router = express.Router();

const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const supportedTypes = [
    
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml',
      
      'application/pdf', 'text/csv', 'application/csv', 'text/plain',
      
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     
      'application/rtf', 'application/zip', 'application/x-rar-compressed', 'application/json', 'application/xml', 'text/xml'
    ];
    
    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Supported types: Images, Documents (PDF, CSV, TXT), Office files (Excel, PowerPoint, Word), and Archives.'), false);
    }
  }
}).array('files', 10); 


router.post(
  '/',
  uploadSingle,
  handleMulterError,
  PatientDemographicController.uploadFile
);


router.post(
  '/multiple',
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  PatientDemographicController.uploadMultipleFiles
);



module.exports = router;
