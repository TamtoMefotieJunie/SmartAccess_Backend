const mongoose  = require("mongoose");

const RecommendationSchema = mongoose.Schema(
    {
        model_type:{
            type:String,
            ref:'AI_model',
        },
        recommendation_case:{
            type:String,
            enum:['new_establishment','emergency_analysis'],
        },
        timestamp_generated: {
            type: Date,
            default: Date.now,
        },
        // for emergencies
        patient_encounter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Emergency', 
            required: function() { return this.recommendation_case === 'emergency_analysis'; },
        },
         recommended_hospital: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hospital',
        },
        recommended_specialty_offering: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HospitalSpecialtyOffering',
        },
        recommended_route_time_min: { 
            type: Number,
        },
        recommended_route_distance: { 
            type: Number,
        },
        status:{
            enum:['Resolved','ongoing','Failed']
        },

        // for new establishments
        recommended_City: {
            type: String,
            required: function () {
                return this.recommendation_case === 'new_establishment';
            },
        },
        recommended_region: { 
            type: String,
            required: true,
        },
    
        prediction:{
            type:String,
            ref:'Prediction'
        },
        desired_specialty:{
            type:String,
            ref:'Speciality',
            required: function () {
                return this.recommendation_case === 'new_establishment';
            },
        },

        confidence_score: {
            type: Number,
            min: 0,
            max: 1, 
        },
        reasoning_factors: [{ 
            type: String, 
        }],


    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model('Recommendation',RecommendationSchema)