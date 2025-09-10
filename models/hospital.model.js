const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
    name: String,
    address: String,
    city: {
        type: String,
    },
    region: {
        type: String, 
    },
    longitude: Number,
    latitude: Number,
    telephone_general:String,  
    telephone_emergency: String,
    hospital_type: {
        type: String,
        enum: ['Public', 'Private', 'Missionary', 'Military'], 
    },
    hospital_level: {
        type: String,
        enum: ['Primary Health Center', 'District Hospital', 'Regional Hospital', 'National Referral Hospital', 'Specialized Clinic'], 
    },
   
    total_bed_capacity: {
        type: Number,
        min: 0,
    },
    staff_count_doctors: { type: Number, min: 0, default: 0 },
    staff_count_specialists: { type: Number, min: 0, default: 0 },  
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, 
}, {
    timestamps: true, 
});

module.exports = mongoose.model("Hospital", hospitalSchema);