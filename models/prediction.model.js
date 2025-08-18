const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({

    generated_by_model: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AI_Model', 
    },
    prediction_date: { 
        type: Date,
        default: Date.now,
    },
    prediction_type: { 
        type: String,
        enum: ['Population_Growth_Risk_for_Disease', 'Disease_Prevalence_Forecast', 'Service_Demand_Projection'],
    },
    
    region:String,
    city:String,
    predicted_chronic_disease: { 
        type: String, 
        ref:'Speciality'
    },
    population_growth_risk_for_disease: { 
        type: String,
        enum: ['Low', 'Moderate', 'High', 'Very High'], 
     
    },
    projected_population_growth_percent: { 
        type: Number, 
        min: 0,
    },
    projected_disease_incidence_rate: {
        type: Number, 
        min: 0,
    },
    
    current_population_in_zone: { 
        type: Number,
        min: 0,
    },
    historical_population_increase_rate: { 
        type: Number, 
       
    },
    historical_disease_metrics: { 
        total_cases_recorded: { type: Number, min: 0 },
        average_annual_incidence_rate: { type: Number, min: 0},
    },
    
    confidence_score: { 
        type: Number,
        min: 0,
        max: 1, 
    },
    reasoning_factors: {
        type: [String], 
        default: [],
    },
    
}, {
    timestamps: true, 
});

module.exports = mongoose.model('Prediction', predictionSchema);