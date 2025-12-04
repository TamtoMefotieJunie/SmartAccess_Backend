const CloudinaryService = require('./cloudinary.service.js');
const constants = require('../config/constants.js');

const { FILE_CATEGORIES } = constants;

class UploadService {
  /**
   * Process file upload
   * @param {Object} file - File object from multer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Processed upload result
   */
  static async uploadFile(file, options = {}) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.buffer) {
      throw new Error('File buffer not found');
    }

    try {
      // Determine resource type for Cloudinary based on file type
      const resourceType = this.getCloudinaryResourceType(file.mimetype);
      
      // Generate a clean public ID from filename (preserve extension for raw files)
      const cleanFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const publicId = options.use_filename ? 
        `${options.folder || 'uploads'}/${cleanFilename}` : 
        undefined;
      
      // Upload to Cloudinary with proper settings
      const uploadResult = await CloudinaryService.uploadFile(file.buffer, {
        resource_type: resourceType,
        folder: options.folder,
        use_filename: options.use_filename || true,
        unique_filename: options.unique_filename !== false,
        overwrite: options.overwrite || false,
        public_id: publicId,
        ...options.cloudinary
      });

      // Process and return relevant data
      const processedResult = this.processUploadResult(uploadResult, file);
      
      return processedResult;
    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Determine Cloudinary resource type based on MIME type
   * @param {string} mimetype - File MIME type
   * @returns {string} - Cloudinary resource type
   */
  static getCloudinaryResourceType(mimetype) {
    if (FILE_CATEGORIES.IMAGES.includes(mimetype)) {
      return 'image';
    } else if (mimetype.startsWith('video/')) {
      return 'video';
    } else {
      // For documents, office files, etc.
      return 'raw';
    }
  }

  /**
   * Get file category for display purposes
   * @param {string} mimetype - File MIME type
   * @returns {string} - File category
   */
  static getFileCategory(mimetype) {
    for (const [category, types] of Object.entries(FILE_CATEGORIES)) {
      if (types.includes(mimetype)) {
        return category.toLowerCase();
      }
    }
    return 'other';
  }

  /**
   * Process upload result and extract relevant information
   * @param {Object} uploadResult - Raw result from Cloudinary
   * @param {Object} originalFile - Original file object
   * @returns {Object} - Processed result
   */
  static processUploadResult(uploadResult, originalFile) {
    const fileCategory = this.getFileCategory(originalFile.mimetype);
    const resourceType = uploadResult.resource_type;
    const fileExtension = originalFile.originalname.split('.').pop().toLowerCase();
    
    // Generate different URL types based on file type
    const viewUrl = uploadResult.secure_url; // Clean direct access URL
    const downloadUrl = this.generateDownloadUrl(uploadResult, originalFile); // Download with proper headers
    
    // For PDFs, provide both direct view and download options
    let directAccessUrl = uploadResult.secure_url;
    let previewUrl = uploadResult.secure_url;
    
    return {
      public_id: uploadResult.public_id,
      url: viewUrl,
      secure_url: uploadResult.secure_url,
      download_url: downloadUrl,
      preview_url: previewUrl,
      direct_access_url: directAccessUrl,
      resource_type: resourceType,
      format: uploadResult.format || fileExtension,
      bytes: uploadResult.bytes,
      created_at: uploadResult.created_at,
      original_filename: originalFile.originalname,
      mimetype: originalFile.mimetype,
      file_category: fileCategory,
      // Conditional properties based on resource type
      ...(uploadResult.width && { width: uploadResult.width }),
      ...(uploadResult.height && { height: uploadResult.height }),
      ...(uploadResult.pages && { pages: uploadResult.pages }),
      // Additional metadata
      metadata: {
        asset_id: uploadResult.asset_id,
        version: uploadResult.version,
        signature: uploadResult.signature,
        etag: uploadResult.etag,
        // Cloudinary URLs for different purposes
        cloudinary_urls: {
          view: viewUrl,
          download: downloadUrl,
          preview: previewUrl,
          direct_access: directAccessUrl
        }
      }
    };
  }

  /**
   * Generate download URL with proper content disposition
   * @param {Object} uploadResult - Cloudinary upload result
   * @param {Object} originalFile - Original file object
   * @returns {string} - Download URL
   */
  static generateDownloadUrl(uploadResult, originalFile) {
    try {
      const baseUrl = uploadResult.secure_url;
      const filename = originalFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      // For raw files, create a download URL with attachment disposition
      if (uploadResult.resource_type === 'raw') {
        // Create download URL with proper Content-Disposition header
        const downloadUrl = baseUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(filename)}/`);
        return downloadUrl;
      }
      
      // For images, return the secure URL
      return baseUrl;
    } catch (error) {
      console.error('Download URL generation error:', error);
      return uploadResult.secure_url; // fallback
    }
  }

  /**
   * Delete uploaded file
   * @param {string} publicId - Public ID of the file to delete
   * @returns {Promise<Object>} - Delete result
   */
  static async deleteFile(publicId) {
    if (!publicId) {
      throw new Error('Public ID is required for deletion');
    }

    try {
      const deleteResult = await CloudinaryService.deleteFile(publicId);
      
      return {
        success: deleteResult.result === 'ok',
        public_id: publicId,
        result: deleteResult.result
      };
    } catch (error) {
      console.error('Delete service error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get file details
   * @param {string} publicId - Public ID of the file
   * @returns {Promise<Object>} - File details
   */
  static async getFileDetails(publicId) {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    try {
      const details = await CloudinaryService.getFileDetails(publicId);
      
      return {
        public_id: details.public_id,
        url: details.secure_url,
        format: details.format,
        width: details.width,
        height: details.height,
        bytes: details.bytes,
        created_at: details.created_at,
        tags: details.tags || [],
        metadata: details.metadata || {}
      };
    } catch (error) {
      console.error('Get details service error:', error);
      throw new Error(`Failed to get file details: ${error.message}`);
    }
  }

 
  static validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
    } else {
      // Check file size (increased to 10MB for documents)
      if (file.size > 10 * 1024 * 1024) {
        errors.push('File size exceeds 10MB limit');
      }

      // Check if file type is supported
      const supportedTypes = Object.values(FILE_CATEGORIES).flat();
      if (!supportedTypes.includes(file.mimetype)) {
        errors.push(`File type ${file.mimetype} is not supported. Supported types: Images, Documents (PDF, CSV, TXT), Office files (Excel, PowerPoint, Word), and Archives.`);
      }

      // Check if file has content
      if (!file.buffer || file.buffer.length === 0) {
        errors.push('File appears to be empty');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports= UploadService;
