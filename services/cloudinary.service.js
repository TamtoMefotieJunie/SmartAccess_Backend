const { cloudinary } = require('../config/cloudinary.js');
const constants = require('../config/constants.js');

const { CLOUDINARY_UPLOAD_FOLDER } = constants;

class CloudinaryService {

  static async uploadFile(fileBuffer, options = {}) {
    try {
      const uploadOptions = {
        resource_type: options.resource_type || 'auto',
        folder: options.folder || CLOUDINARY_UPLOAD_FOLDER,
        use_filename: options.use_filename !== false, 
        unique_filename: options.unique_filename !== false, 
        overwrite: options.overwrite || false,
        public_id: options.public_id || undefined,
        ...(options.resource_type === 'raw' && { 
          quality: 'auto',
          fetch_format: 'auto'
        }),
        ...options
      };

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(fileBuffer);
      });

      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
  }


  static async deleteFile(publicId, options = {}) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, options);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
  }

  static async getFileDetails(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary get details error:', error);
      throw new Error(`Failed to get file details: ${error.message}`);
    }
  }

  static getTransformedUrl(publicId, transformations = {}) {
    try {
      return cloudinary.url(publicId, transformations);
    } catch (error) {
      console.error('URL transformation error:', error);
      throw new Error(`Failed to generate transformed URL: ${error.message}`);
    }
  }

  static getDownloadUrl(publicId, resourceType = 'raw', originalFilename = null) {
    try {
      const options = {
        resource_type: resourceType,
        flags: 'attachment'
      };
  
      if (originalFilename) {
      
        const extension = originalFilename.split('.').pop();
        if (extension) {
          options.format = extension;
        }
      }
      
      return cloudinary.url(publicId, options);
    } catch (error) {
      console.error('Download URL generation error:', error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  static getPreviewUrl(publicId, resourceType = 'raw') {
    try {
      if (resourceType === 'image') {
        return cloudinary.url(publicId, { resource_type: 'image' });
      }
      
      return cloudinary.url(publicId, { 
        resource_type: 'raw',
        flags: 'immutable_cache'
      });
    } catch (error) {
      console.error('Preview URL generation error:', error);
      throw new Error(`Failed to generate preview URL: ${error.message}`);
    }
  }

  static async listFiles(folder = CLOUDINARY_UPLOAD_FOLDER, options = {}) {
    try {
      const listOptions = {
        type: 'upload',
        prefix: folder,
        max_results: options.max_results || 100,
        ...options
      };

      const result = await cloudinary.api.resources(listOptions);
      return result;
    } catch (error) {
      console.error('Cloudinary list files error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}

module.exports= CloudinaryService;
