
const multer = require('multer');
const path = require('path');
const uploadService = require('../services/uploadedFiles.service')

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /csv|pdf|jpeg|jpg|png|gif/; 
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb('Error: File upload only supports the following filetypes: ' + filetypes);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20000000 },
  fileFilter: fileFilter 
}).single('myFile');

const uploadFile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Error uploading file.');
        }
        const { dataType, region,provider } = req.body;
        const fileDetails = {
            filename: req.file.filename,
            dataType,
            region,
            provider
        };
        try {
           const File = await uploadService.saveFileDetails(fileDetails);
            res.status(200).json({
                message: 'File uploaded successfully',
                data: File
            });
        } catch (error) {
            res.status(500).send('Error saving file details.');
        }
    });
};

module.exports = { uploadFile };