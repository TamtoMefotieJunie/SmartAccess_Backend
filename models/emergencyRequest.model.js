const mongoose = require('mongoose')

const EmergencySchema = mongoose.Schema(
    {
        city: String,
        type:String,
        name:String,
        patient:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        related_symptoms: [{
            type: String, 
        }],
      
        symptom_severity: { 
            type: String,
            enum: ['Mild', 'Moderate', 'Severe', 'Critical'],
        },
        model_type:{
            type:String,
            ref:'AI_model',
        },
       
        status: { 
            type: String,
            enum: ['Pending Recommendation', 'Recommendation Generated', 'Appointment Booked', 'Completed'],
            default: 'Pending Recommendation',
        },

    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model('Emergency',EmergencySchema)