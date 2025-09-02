const multer = require('multer');
const constants = require ('../config/constants');

const { FILE_SIZE_LIMIT, ALLOWED_MIME_TYPES, FILE_CATEGORIES } = constants;

// Configure multer for file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Create helpful error message based on file type
    const fileCategory = getFileCategory(file.mimetype);
    const errorMessage = fileCategory 
      ? `File type ${file.mimetype} is not supported. Supported types: Images, Documents (PDF, CSV, TXT), Office files (Excel, PowerPoint, Word), and Archives.`
      : `Only supported file types are allowed: Images, Documents (PDF, CSV, TXT), Office files (Excel, PowerPoint, Word), and Archives.`;
    
    cb(new Error(errorMessage), false);
  }
};

// Helper function to categorize file types
const getFileCategory = (mimetype) => {
  for (const [category, types] of Object.entries(FILE_CATEGORIES)) {
    if (types.includes(mimetype)) {
      return category;
    }
  }
  return null;
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = upload.single('file');

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 10MB.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false,
        error: 'Unexpected field name. Use "file" as the field name.' 
      });
    }
  }
  
  if (error.message.includes('File type') || error.message.includes('Only supported file types')) {
    return res.status(400).json({ 
      success: false,
      error: error.message
    });
  }
  
  next(error);
};

module.exports= {
  uploadSingle,
  handleMulterError,
  getFileCategory
};
