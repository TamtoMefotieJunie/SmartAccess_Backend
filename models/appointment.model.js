const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema({
    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    appointment_time:String,
    appointment_date:Date,
    status:{
        type:String,
        enum:['Pending','Approved','Canceled','Rejected','Rescheduled'],
        default:"Pending"
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