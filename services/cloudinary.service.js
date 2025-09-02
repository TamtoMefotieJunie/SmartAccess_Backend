const { cloudinary } = require('../config/cloudinary.js');
const constants = require('../config/constants.js');

const { CLOUDINARY_UPLOAD_FOLDER } = constants;

class CloudinaryService {
  /**
   * Upload file buffer to Cloudinary
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Upload result from Cloudinary
   */
  static async uploadFile(fileBuffer, options = {}) {
    try {
      const uploadOptions = {
        resource_type: options.resource_type || 'auto',
        folder: options.folder || CLOUDINARY_UPLOAD_FOLDER,
        use_filename: options.use_filename !== false, // Changed default to true to preserve filenames
        unique_filename: options.unique_filename !== false, // default true
        overwrite: options.overwrite || false,
        // Remove flags that might interfere with file access - handle via URL generation instead
        // Preserve original filename for downloads - important for raw files
        public_id: options.public_id || undefined,
        // For raw files, ensure they're handled properly
        ...(options.resource_type === 'raw' && { 
          // Preserve file integrity
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

  /**
   * Delete file from Cloudinary
   * @param {string} publicId - Public ID of the file to delete
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} - Delete result from Cloudinary
   */
  static async deleteFile(publicId, options = {}) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, options);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
  }

  /**
   * Get file details from Cloudinary
   * @param {string} publicId - Public ID of the file
   * @returns {Promise<Object>} - File details from Cloudinary
   */
  static async getFileDetails(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary get details error:', error);
      throw new Error(`Failed to get file details: ${error.message}`);
    }
  }

  /**
   * Transform image URL
   * @param {string} publicId - Public ID of the image
   * @param {Object} transformations - Transformation options
   * @returns {string} - Transformed image URL
   */
  static getTransformedUrl(publicId, transformations = {}) {
    try {
      return cloudinary.url(publicId, transformations);
    } catch (error) {
      console.error('URL transformation error:', error);
      throw new Error(`Failed to generate transformed URL: ${error.message}`);
    }
  }

  /**
   * Get download URL with proper content disposition
   * @param {string} publicId - Public ID of the file
   * @param {string} resourceType - Resource type (image, raw, etc.)
   * @param {string} originalFilename - Original filename for download
   * @returns {string} - Download URL
   */
  static getDownloadUrl(publicId, resourceType = 'raw', originalFilename = null) {
    try {
      const options = {
        resource_type: resourceType,
        flags: 'attachment'
      };
      
      // Add original filename if provided
      if (originalFilename) {
        // Extract extension from original filename
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

  /**
   * Get preview URL for documents
   * @param {string} publicId - Public ID of the document
   * @param {string} resourceType - Resource type
   * @returns {string} - Preview URL
   */
  static getPreviewUrl(publicId, resourceType = 'raw') {
    try {
      if (resourceType === 'image') {
        return cloudinary.url(publicId, { resource_type: 'image' });
      }
      
      // For documents, return the raw URL
      return cloudinary.url(publicId, { 
        resource_type: 'raw',
        flags: 'immutable_cache'
      });
    } catch (error) {
      console.error('Preview URL generation error:', error);
      throw new Error(`Failed to generate preview URL: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   * @param {string} folder - Folder path
   * @param {Object} options - List options
   * @returns {Promise<Object>} - List of files
   */
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
