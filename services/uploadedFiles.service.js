
const fileSchema = require('../models/uploadedFiles.model.js');

const saveFileDetails = async (fileDetails) => {
    return await fileSchema.create(fileDetails)
};

const getAllFiles = async () => {
    return await fileSchema.find();
}

module.exports = { 
    saveFileDetails,
    getAllFiles  
};