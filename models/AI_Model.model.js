const mongoose = require('mongoose')

const AIModelSchema = mongoose.Schema(
    {
        name:String,
        version:String,
        type:{
            type:String,
            enum:['Recommendation','Prediction','Classification'],
            required:true,
        },
        purpose:String,
        endpoint:String,
        
    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model('AI_model',AIModelSchema)