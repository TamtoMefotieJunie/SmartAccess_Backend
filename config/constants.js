module.exports = {
  PORT: process.env.PORT || 5000,
  
  // File upload limits
  FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB (increased for documents)
  
  // Cloudinary settings
  CLOUDINARY_UPLOAD_FOLDER: 'uploads',
  
  // Allowed file types (images and documents)
  ALLOWED_MIME_TYPES: [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'text/csv',
    'application/csv',
    'text/plain',
    // Microsoft Office
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Other common formats
    'application/rtf',
    'application/zip',
    'application/x-rar-compressed',
    'application/json',
    'application/xml',
    'text/xml',
  ],
  
  // File type categories for better handling
  FILE_CATEGORIES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'],
    DOCUMENTS: ['application/pdf', 'text/csv', 'application/csv', 'text/plain'],
    OFFICE: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    ARCHIVES: ['application/zip', 'application/x-rar-compressed'],
    DATA: ['application/json', 'application/xml', 'text/xml', 'application/rtf']
  },
  
  // CORS settings
  CORS_ORIGINS: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development'
};
