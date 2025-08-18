
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    provider:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    filename:String,
    dataType: String,
    region: String,
    uploadedAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);
module.exports = File;