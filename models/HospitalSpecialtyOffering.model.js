const mongoose = require("mongoose");

const hospitalSpecialtyOfferingSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true,
    },
    speciality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Speciality',
        required: true,
    },
    //e.g cardiology department
    service_name: { 
        type: String,
        required: true,
    },
    service_description: {
        type: String,
        required: false,
    },

   doctors_count_for_service: { 
        type: Number,
        min: 0,
        default: 0,
    },
   service_status: {
        type: String,
        enum: ['Active', 'Inactive', 'Limited Capacity'],
        default: 'Active',
    }

}, {
    timestamps: true,
});

hospitalSpecialtyOfferingSchema.index({ hospital: 1, speciality: 1 }, { unique: true });

module.exports = mongoose.model('HospitalSpecialtyOffering', hospitalSpecialtyOfferingSchema);