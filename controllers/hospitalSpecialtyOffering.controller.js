const hospitalSpecialtyOfferingService = require("../services/hospitalSpec.service.js");
const hospitalservice = require("../services/hospital.service.js");
const specialtyService = require("../services/specialty.service.js");
const axios = require('axios')


const createHospitalSpecialtyOffering = async (req, res) => {
    console.log("hi")
    const { hospital, speciality, service_name, service_description, service_status, specialists,availability_time } = req.body;
    console.log("Request body received:", req.body);
    try {
        const hospitalExists = await hospitalservice.getHospitalById(hospital);
        if (!hospitalExists) {
            return res.status(404).json({ message: "Hospital not found." });
        }

        const specialtyExists = await specialtyService.getSpecialtyById(speciality);
        if (!specialtyExists) {
            return res.status(404).json({ message: "Specialty not found." });
        }

        const specialistArray = Array.isArray(specialists) ? specialists : [];
        const doctor_count = specialistArray.length;

        const newOfferingData = {
            hospital,
            speciality,
            service_name,
            service_description,
            service_status,
            availability_time,
            specialists: specialistArray,
            doctors_count_for_service: doctor_count
        };

        const createdOffering = await hospitalSpecialtyOfferingService.createHospitalSpecialtyOffering(newOfferingData);

        return res.status(201).json({
            message: "New hospital specialty offering added successfully!",
            data: createdOffering,
        });

    } catch (error) {
        console.error("Error creating the hospital specialty offering:", error);
        return res.status(500).json({
            message: "Failed to create hospital specialty offering.",
            error: error.message,
        });
    }
};

const getAllHospitalSpecialtyOfferings = async (req, res) => {
    try {
        const offerings = await hospitalSpecialtyOfferingService.getAllHospitalSpecialtyOfferings();
        return res.status(200).json({
            message: "All hospital specialty offerings fetched successfully!",
            data: offerings,
        });
    } catch (error) {
        console.error("Error fetching all offerings:", error);
        return res.status(500).json({
            message: "An error occurred while fetching offerings.",
            error: error.message,
        });
    }
};
const getHospitalSpecialtyOfferingsByHospitalId = async (req, res) => {
    const { id: hospitalId } = req.params;
    try {
        const offerings = await hospitalSpecialtyOfferingService.getHospitalSpecialtyOfferingsByHospitalId(hospitalId);
        if (!offerings) {
            return res.status(404).json({ message: "No offerings found for this hospital." });
        }
        return res.status(200).json({
            message: "Offerings fetched successfully!",
            data: offerings,
        });
    } catch (err) {
        console.error("Error fetching offerings by hospital ID:", err);
        return res.status(500).json({
            message: "An error occurred while fetching offerings.",
            error: err.message,
        });
    }
};

const getHospitalSpecialtyOfferingsBySpecialtyId = async (req, res) => {
    const { id: specialtyId } = req.params;
    try {
        const offerings = await hospitalSpecialtyOfferingService.getHospitalSpecialtyOfferingsBySpecialtyId(specialtyId);
        if (!offerings) {
            return res.status(404).json({ message: "No offerings found for this specialty." });
        }
        return res.status(200).json({
            message: "Offerings fetched successfully!",
            data: offerings,
        });
    } catch (err) {
        console.error("Error fetching offerings by specialty ID:", err);
        return res.status(500).json({
            message: "An error occurred while fetching offerings.",
            error: err.message,
        });
    }
};

module.exports = {
    createHospitalSpecialtyOffering,
    getAllHospitalSpecialtyOfferings,
    // getHospitalSpecialtyOfferingById,
    // getOneHospitalSpecialtyOffering,
    getHospitalSpecialtyOfferingsByHospitalId,
    getHospitalSpecialtyOfferingsBySpecialtyId,
    // updateHospitalSpecialtyOffering,
    // deleteHospitalSpecialtyOffering,
};