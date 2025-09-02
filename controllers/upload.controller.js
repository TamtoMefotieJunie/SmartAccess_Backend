const UploadService = require('../services/upload.service');
const File = require('../models/uploadedFiles.model'); 

class UploadController {
  /**
   * Handle single file upload
   */
  static async uploadFile(req, res, next) {
    try {
      const validation = UploadService.validateFile(req.file);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'File validation failed',
          details: validation.errors
        });
      }

      const uploadOptions = {
        folder: req.body.folder,
        use_filename: req.body.use_filename !== 'false',
        unique_filename: req.body.unique_filename !== 'false',
        overwrite: req.body.overwrite === 'true'
      };

      const uploadResult = await UploadService.uploadFile(req.file, uploadOptions);

      // Save uploaded file info to MongoDB
      const savedFile = await File.create({
        provider: req.user ? req.user._id : req.body.provider || null, 
        filename: uploadResult.original_filename || req.file.originalname,
        dataType: uploadResult.mimetype || req.file.mimetype,
        region: req.body.region || 'default',
        cloudinaryPublicId: uploadResult.public_id,
        cloudinaryUrl: uploadResult.secure_url,
        uploadedAt: new Date()
      });

      console.log('Upload successful:', {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url
      });

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: savedFile
      });

    } catch (error) {
      console.error('Upload controller error:', error);
      next(error);
    }
  }

  /**
   * Handle multiple file upload
   */
  static async uploadMultipleFiles(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
      }

      const uploadPromises = req.files.map(async (file) => {
        try {
          const validation = UploadService.validateFile(file);
          if (!validation.isValid) {
            return {
              filename: file.originalname,
              success: false,
              error: validation.errors.join(', ')
            };
          }

          const uploadResult = await UploadService.uploadFile(file);

          // Save uploaded file info to MongoDB
          const savedFile = await File.create({
            provider: req.user ? req.user._id : null,
            filename: uploadResult.original_filename || file.originalname,
            dataType: uploadResult.mimetype || file.mimetype,
            region: req.body.region || 'default',
            cloudinaryPublicId: uploadResult.public_id,
            cloudinaryUrl: uploadResult.secure_url,
            uploadedAt: new Date()
          });

          return {
            filename: file.originalname,
            success: true,
            data: savedFile
          };
        } catch (error) {
          return {
            filename: file.originalname,
            success: false,
            error: error.message
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.status(200).json({
        success: failCount === 0,
        message: `${successCount} files uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        data: {
          total: results.length,
          successful: successCount,
          failed: failCount,
          results
        }
      });

    } catch (error) {
      console.error('Multiple upload controller error:', error);
      next(error);
    }
  }

  /**
   * Handle file deletion
   */
  static async deleteFile(req, res, next) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: 'Public ID is required'
        });
      }

      const deleteResult = await UploadService.deleteFile(publicId);

      // Optionally remove from MongoDB
      await File.findOneAndDelete({ cloudinaryPublicId: publicId });

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: deleteResult
      });

    } catch (error) {
      console.error('Delete controller error:', error);
      next(error);
    }
  }

  /**
   * Handle get file details
   */
  static async getFileDetails(req, res, next) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: 'Public ID is required'
        });
      }

      const fileDetails = await UploadService.getFileDetails(publicId);

      res.status(200).json({
        success: true,
        message: 'File details retrieved successfully',
        data: fileDetails
      });

    } catch (error) {
      console.error('Get details controller error:', error);
      next(error);
    }
  }

  /**
   * Proxy file access for better content-type handling
   */
  static async proxyFile(req, res, next) {
    try {
      const { publicId } = req.params;
      if (!publicId) throw new Error('Public ID is required');

      const decodedPublicId = decodeURIComponent(publicId);
      const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${decodedPublicId}`;

      const fetch = (await import('node-fetch')).default;
      const response = await fetch(cloudinaryUrl);
      if (!response.ok) throw new Error(`Cloudinary returned ${response.status}`);

      const fileExtension = decodedPublicId.split('.').pop().toLowerCase();
      let contentType = 'application/octet-stream';
      if (fileExtension === 'pdf') contentType = 'application/pdf';
      if (fileExtension === 'txt') contentType = 'text/plain';
      if (fileExtension === 'json') contentType = 'application/json';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Access-Control-Allow-Origin', '*');
      response.body.pipe(res);

    } catch (error) {
      console.error('File proxy error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ... you can include proxyFileByUrl, serveFile, and forceDownload similarly if needed
}

module.exports = UploadController;
