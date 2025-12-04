const mongoose = require('mongoose');

const patientDemographicFileSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recordType: {
    type: String,
    enum: ['patientRecords', 'staffCredentials', 'hospitalInventory'],
    required: true,
  },
  uploadDescription: {
    type: String,
    default: ''
  },
  filename: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('PatientDemographicFile', patientDemographicFileSchema);