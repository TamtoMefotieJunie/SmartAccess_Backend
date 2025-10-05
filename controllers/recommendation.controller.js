const recommendationService = require('../services/recommendation.service');
const emergencyService = require('../services/emergencyRequest.service')
const axios = require('axios');

const createRecommendation = async (req, res) => {
    try {
        const { emergencyId } = req.params;
        if (!emergencyId) {
            return res.status(400).json({
                message: "emergencyId is required in URL params",
            });
        }

        const emergency = await emergencyService.getEmergencyById(emergencyId);
        if (!emergency) {
            return res.status(404).json({
                message: "Emergency not found",
            });
        }

        // Prepare data for AI service
        const emergencyData = {
            "Number of symptoms": emergency.related_symptoms.length,
            "symptoms": emergency.related_symptoms
        };

        let aiResponse;
        let predictionResult = {
            predicted_disease: "Unknown",
            recommended_specialist: "General Practitioner",
            confidence_score: 0,
            reasoning_factors: [],
            status: "Failed",
            recommended_hospitals: [],
            patient_encounter: emergencyId,
            recommendation_case: "emergency_analysis"
        };

        try {
            // ✅ Call your Flask AI service
            aiResponse = await axios.post('http://127.0.0.1:5000/recommend', emergencyData, {
                timeout: 10000 // 10s timeout
            });

            const aiData = aiResponse.data;

            // Validate critical fields
            if (!aiData.predicted_disease || !aiData.recommended_specialist) {
                throw new Error("AI service returned incomplete prediction");
            }

            // ✅ Build prediction result using Flask's response
            predictionResult = {
                predicted_disease: aiData.predicted_disease,
                recommended_specialist: aiData.recommended_specialist,
                confidence_score: aiData.confidence || aiData.probability || 0,
                reasoning_factors: aiData.decision_reason?.factors || [
                    `Recommended based on ${emergencyData["Number of symptoms"]} symptoms.`,
                    `Confidence: ${(aiData.confidence || 0).toFixed(2)}`
                ],
                status: "Resolved",
                model_type: "Ensemble-6-Models",
                patient_encounter: emergencyId,
                recommendation_case: "emergency_analysis",
                recommended_hospitals: aiData.recommended_hospitals || []
            };

        } catch (axiosError) {
            console.error(`❌ AI service error for emergency ${emergencyId}:`, axiosError.message);

            predictionResult.reasoning_factors = [
                "AI prediction failed",
                axiosError.message,
                axiosError.response?.data?.error || "No error details from AI service"
            ];
            predictionResult.status = "Failed";
        }

        // ✅ Save recommendation
        const newRecommendation = await recommendationService.createRecommendation(predictionResult);

        // ✅ Update emergency status
        emergency.status = predictionResult.status === "Resolved" 
            ? "Recommendation Generated" 
            : "Pending Recommendation";

        await emergencyService.updateEmergency(emergencyId, emergency);

        return res.status(201).json({
            message: "Recommendation processed successfully!",
            data: newRecommendation
        });

    } catch (error) {
        console.error("❌ Error in createRecommendation controller:", error);
        return res.status(500).json({
            message: `Failed to create recommendation: ${error.message}`,
            data: null
        });
    }
};


const getRecommendationById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Recommendation ID is required",
                data: null
            });
        }
        const recommendation = await recommendationService.getRecommendationById(id);
        if (!recommendation) {
            return res.status(404).json({
                message: "Recommendation not found",
                data: null
            });
        }
        return res.status(200).json({
            message: "Recommendation fetched successfully",
            data: recommendation
        });

    } catch (error) {
        console.error("Error in getRecommendationById controller:", error);
        return res.status(500).json({
            message: `Failed to fetch recommendation: ${error.message}`,
            data: null
        });
    }
};

const getRecommendationsByLocation = async (req, res) => {
    try {
        const { city, region, hospital_name } = req.query;
        let filter = {};
        if (city) {
            filter["recommended_hospitals.hospital_list.city"] = city;
        }
        if (region) {
            filter["recommended_hospitals.hospital_list.region"] = region;
        }
        if (hospital_name) {
            filter["recommended_hospitals.hospital_list.hospital_name"] = hospital_name;
        }
        if (Object.keys(filter).length === 0) {
            return res.status(400).json({
                message: "Please provide at least one location filter: city, region, or hospital_name",
                data: null
            });
        }
        const recommendations = await recommendationService.getAllRecommendations(filter);
        if (recommendations.length === 0) {
            return res.status(404).json({
                message: "No recommendations found for the given location",
                data: []
            });
        }
        return res.status(200).json({
            message: "Recommendations fetched successfully",
            data: recommendations,
            count: recommendations.length
        });

    } catch (error) {
        console.error("Error in getRecommendationsByLocation controller:", error);
        return res.status(500).json({
            message: `Failed to fetch recommendations by location: ${error.message}`,
            data: null
        });
    }
};

const deleteRecommendation = async (req, res) => {
    try {
        const { id } = req.params; 
        if (!id) {
            return res.status(400).json({
                message: "Recommendation ID is required",
                data: null
            });
        }
        const deletedRecommendation = await recommendationService.deleteRecommendation(id);
        if (!deletedRecommendation) {
            return res.status(404).json({
                message: "Recommendation not found or already deleted",
                data: null
            });
        }
        return res.status(200).json({
            message: "Recommendation deleted successfully",
            data: deletedRecommendation
        });

    } catch (error) {
        console.error("Error in deleteRecommendation controller:", error);
        return res.status(500).json({
            message: `Failed to delete recommendation: ${error.message}`,
            data: null
        });
    }
};

const updateRecommendation = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = req.body;
        if (!id) {
            return res.status(400).json({
                message: "Recommendation ID is required",
                data: null
            });
        }
        if (!updateData) {
            return res.status(400).json({
                message: "No update data provided",
                data: null
            });
        }
        const updatedRecommendation = await recommendationService.updateRecommendation(id, updateData);
        if (!updatedRecommendation) {
            return res.status(404).json({
                message: "Recommendation not found",
                data: null
            });
        }
        return res.status(200).json({
            message: "Recommendation updated successfully",
            data: updatedRecommendation
        });

    } catch (error) {
        console.error("Error in updateRecommendation controller:", error);
        return res.status(500).json({
            message: `Failed to update recommendation: ${error.message}`,
            data: null
        });
    }
};

const getAllRecommendations = async (req, res) => {
    try {
        const filter = req.query; 
        const recommendations = await recommendationService.getAllRecommendations(filter);
        return res.status(200).json({
            message: "Recommendations fetched successfully",
            data: recommendations,
            count: recommendations.length
        });
    } catch (error) {
        console.error("Error in getAllRecommendations controller:", error);
        return res.status(500).json({
            message: `Failed to fetch recommendations: ${error.message}`,
            data: null
        });
    }
};

const getRecommendationsByType = async (req, res) => {
    try {
        const { type } = req.params; 

        if (!type) {
            return res.status(400).json({
                message: "Recommendation type is required",
                data: null
            });
        }
        const recommendations = await recommendationService.getRecommendationsByType(type);
        return res.status(200).json({
            message: `Recommendations of type '${type}' fetched successfully`,
            data: recommendations,
            count: recommendations.length
        });

    } catch (error) {
        console.error("Error in getRecommendationsByType controller:", error);
        return res.status(500).json({
            message: `Failed to fetch recommendations by type: ${error.message}`,
            data: null
        });
    }
};

const getRecommendationsByEmergencyId = async (req, res) => {
    try {
        const { emergencyId } = req.params; 

        if (!emergencyId ) {
            return res.status(400).json({
                message: "emergency id is required",
                data: null
            });
        }
        const recommendations = await recommendationService.getRecommendationsByEmergencyId(emergencyId);
        return res.status(200).json({
            message: `Recommendations for emergency' ${emergencyId}' fetched successfully`,
            data: recommendations,
        });

    } catch (error) {
        console.error("Error in getRecommendationsByEmergencyId controller:", error);
        return res.status(500).json({
            message: `Failed to fetch recommendations by emergencyId : ${error.message}`,
            data: null
        });
    }
};

module.exports = {
    createRecommendation,
    getRecommendationById,
    deleteRecommendation,
    updateRecommendation,
    getAllRecommendations,
    getRecommendationsByType,
    getRecommendationsByLocation,
    getRecommendationsByEmergencyId,
};