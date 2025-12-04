const patientDemographicService = require('../services/PatientDemographic.service');
const File = require('../models/patientDemographics.model'); 

class PatientDemographicController {
  
 // controllers/PatientDemographic.controller.js
static async uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const validation = patientDemographicService.validateFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'File validation failed',
        details: validation.errors
      });
    }

    // ✅ Use hardcoded, safe upload options for CSV/raw files
    const uploadOptions = {
      folder: 'patient_demographics',
      resource_type: 'raw', // ← CRITICAL for CSV
      use_filename: true,
      unique_filename: false,
      overwrite: false
    };

    const uploadResult = await patientDemographicService.uploadFile(req.file, uploadOptions);

    // ✅ Save ONLY fields that exist in your model AND are sent by frontend
    const savedFile = await File.create({
      provider: req.user ? req.user._id : req.body.provider || null,
      recordType: req.body.recordType,        // ← from frontend select
      uploadDescription: req.body.uploadDescription || '',
      filename: req.file.originalname,
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.secure_url,
      uploadedAt: new Date()
    });

    console.log('✅ Patient demographic file uploaded:', savedFile.filename);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: savedFile
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: error.message
    });
  }
}

  
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
          const validation = patientDemographicService.validateFile(file);
          if (!validation.isValid) {
            return {
              filename: file.originalname,
              success: false,
              error: validation.errors.join(', ')
            };
          }

          const uploadResult = await patientDemographicService.uploadFile(file);

          const savedFile = await File.create({
            provider: req.user ? req.user._id : null,
            filename: uploadResult.original_filename || file.originalname,
            uploadDescription: uploadResult.mimetype || file.mimetype,
            recordType: req.body.region || 'default',
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

  
  static async deleteFile(req, res, next) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: 'Public ID is required'
        });
      }

      const deleteResult = await patientDemographicService.deleteFile(publicId);

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

 
  static async getFileDetails(req, res, next) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: 'Public ID is required'
        });
      }

      const fileDetails = await patientDemographicService.getFileDetails(publicId);

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

}

module.exports = PatientDemographicController;
