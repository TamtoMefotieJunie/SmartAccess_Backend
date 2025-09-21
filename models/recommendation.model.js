const mongoose  = require("mongoose");

const RecommendationSchema = mongoose.Schema(
    {
        predicted_disease: {
            type: String,
        },
        recommended_specialist: {
            type: String,
        },
        confidence_score: {
            type: Number,
            min: 0,
            max: 1,
            required: true,
        },
        recommended_hospitals: [
        {
        hospital_list: {
          
            hospital_name: { type: String, required: true },
            city: { type: String, required: true },
            region: { type: String, required: true },
            specialties: [{ type: String }], 
            website_or_page: String,
            map_link: String,
            ownership: String,
            level: String,
            longitude:Number,
            latitude:Number,
        },
        
        matched_specialty_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Specialty',
                default: [],
            },
        ],
        },
        ],

        recommendation_case: {
        type: String,
        enum: ['new_establishment', 'emergency_analysis'],
        default: 'emergency_analysis',
        required: true,
        },

        timestamp_generated: {
        type: Date,
        default: Date.now,
        },

        status: {
        type: String,
        enum: ['Resolved', 'ongoing', 'Failed'],
        default: 'ongoing',
        },
            
        reasoning_factors: [
        String,   
        ],

        model_type:{
            type:String,
            ref:'AI_model',
        },
    
        // for emergencies
        patient_encounter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Emergency', 
            
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

        // for new establishments
        recommended_City: {
            type: String,
            
        },
        recommended_region: { 
            type: String,
            
        },
    
        prediction:{
            type:String,
            ref:'Prediction'
        },
        desired_specialty:{
            type:String,
            ref:'Speciality',
            
        },

    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model('Recommendation',RecommendationSchema)