const express = require('express');

const UploadController = require('../controllers/upload.controller.js');
const { uploadSingle, handleMulterError } = require('../middleware/upload.js');
const multer = require('multer');

const router = express.Router();

// Configure multer for multiple files
const uploadMultiple = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for documents
  fileFilter: (req, file, cb) => {
    const supportedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml',
      // Documents  
      'application/pdf', 'text/csv', 'application/csv', 'text/plain',
      // Microsoft Office
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Other formats
      'application/rtf', 'application/zip', 'application/x-rar-compressed', 'application/json', 'application/xml', 'text/xml'
    ];
    
    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Supported types: Images, Documents (PDF, CSV, TXT), Office files (Excel, PowerPoint, Word), and Archives.'), false);
    }
  }
}).array('files', 10); // Max 10 files

/**
 * @route POST /api/upload
 * @description Upload a single file to Cloudinary
 * @body {File} file - The file to upload
 * @body {String} [folder] - Optional folder name in Cloudinary
 * @body {Boolean} [use_filename] - Use original filename
 * @body {Boolean} [unique_filename] - Generate unique filename
 * @body {Boolean} [overwrite] - Overwrite existing file
 */
router.post(
  '/',
  uploadSingle,
  handleMulterError,
  UploadController.uploadFile
);

/**
 * @route POST /api/upload/multiple
 * @description Upload multiple files to Cloudinary
 * @body {File[]} files - Array of files to upload
 */
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
  UploadController.uploadMultipleFiles
);

/**
 * @route GET /api/upload/details/:publicId
 * @description Get details of an uploaded file
 * @param {String} publicId - Public ID of the file
//  */
// router.get('/details/:publicId', UploadController.getFileDetails);

/**
 * @route GET /api/upload/proxy/:publicId
 * @description Proxy file access with proper content-type headers
 * @param {String} publicId - Public ID of the file to proxy
 */
// router.get('/proxy/:publicId', UploadController.proxyFile);

/**
 * @route GET /api/upload/proxy-url
 * @description Proxy file access using full URL with proper content-type headers
 * @query {String} url - Full Cloudinary URL to proxy
 */
// router.get('/proxy-url', UploadController.proxyFileByUrl);

/**
 * @route GET /api/upload/serve/:publicId
 * @description Serve file directly using Cloudinary SDK with signed URLs
 * @param {String} publicId - Public ID of the file to serve
 */
// router.get('/serve/:publicId', UploadController.serveFile);

/**
 * @route GET /api/upload/force-download
 * @description Force file download with proper attachment headers
 * @query {String} url - Full Cloudinary URL to download
 * @query {String} filename - Original filename for download
 */
// router.get('/force-download', UploadController.forceDownload);

/**
 * @route DELETE /api/upload/:publicId
 * @description Delete a file from Cloudinary
 * @param {String} publicId - Public ID of the file to delete
 */
// router.delete('/:publicId', UploadController.deleteFile);

module.exports = router;
