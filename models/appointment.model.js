const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema({
    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    appointment_time:Date,
    status:{
        type:String,
        enum:['Approved','Canceled','Rejected','Rescheduled']
    },
    provider:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hospital',
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Appointment',appointmentSchema);