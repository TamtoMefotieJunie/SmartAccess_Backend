const RecommendationSchema =require( "../models/recommendation.model.js");

const createRecommendation = async(Recommendation) => {
   try {
        const newRecommendation = new RecommendationSchema(Recommendation);
        return await newRecommendation.save();
    } catch (error) {
        throw new Error(`Failed to create recommendation: ${error.message}`);
    }
};

const updateRecommendation = async (id, updateData) => {
    return await RecommendationSchema.findByIdAndUpdate(id, updateData, {new: true }).populate([
        'recommended_hospital',
        'recommended_specialty_offering'
    ]);
};

const deleteRecommendation = async (id) => {
    return await RecommendationSchema.findByIdAndDelete(id);
};

const getAllRecommendations = async (filter = {}) => {
    return await RecommendationSchema.find(filter).populate([
        { path: 'recommended_hospital', select: 'hospital_name city region longitude latitude' },
        { path: 'recommended_specialty_offering', select: 'service_name service_description' },
        { path: 'patient_encounter', select: 'symptoms timestamp' }, 
        { path: 'desired_specialty', select: 'name description' } 
    ]).sort({ timestamp_generated: -1 });
};

const getRecommendationsByType = async (recommendation_case) => {
    return await getAllRecommendations({ recommendation_case });
};

const getRecommendationById = async (id) => {
    if (!id) throw new Error("ID is required");
    return await RecommendationSchema.findById(id).populate([
        'recommended_hospital',
        'recommended_specialty_offering',
        'patient_encounter',
        'desired_specialty'
    ]);
};

module.exports = {
    getAllRecommendations,
    deleteRecommendation,
    updateRecommendation,
    createRecommendation,
    getRecommendationsByType,
    getRecommendationById,
};