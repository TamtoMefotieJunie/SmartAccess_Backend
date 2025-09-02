const HospitalSpecialtyOffering = require("../models/HospitalSpecialtyOffering.model.js");
const mongoose = require('mongoose');

const getAllHospitalSpecialtyOfferings = async () => {
    return await HospitalSpecialtyOffering.find()
        .populate("hospital")
        .populate("speciality");
};

const createHospitalSpecialtyOffering = async (hospitalSpecialtyOfferingData) => {
    return await HospitalSpecialtyOffering.create(hospitalSpecialtyOfferingData);
};

const getHospitalSpecialtyOfferingById = async (id) => {
    return await HospitalSpecialtyOffering.findById(id)
        .populate("hospital")
        .populate("speciality");
};

const getHospitalSpecialtyOfferingsByHospitalId = async (hospitalId) => {
    return await HospitalSpecialtyOffering.find({ hospital: hospitalId })
        .populate("speciality");
};

const getHospitalSpecialtyOfferingsBySpecialtyId = async (specialtyId) => {
    return await HospitalSpecialtyOffering.find({ speciality: specialtyId })
        .populate("hospital");
};

const getOneHospitalSpecialtyOffering = async (query) => {
    return await HospitalSpecialtyOffering.findOne(query)
        .populate("hospital")
        .populate("speciality");
};

const updateHospitalSpecialtyOffering = async (id, updateData) => {
    return await HospitalSpecialtyOffering.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteHospitalSpecialtyOffering = async (id) => {
    return await HospitalSpecialtyOffering.findByIdAndDelete(id);
};

module.exports = {
    createHospitalSpecialtyOffering,
    getAllHospitalSpecialtyOfferings,
    getHospitalSpecialtyOfferingById,
    getHospitalSpecialtyOfferingsBySpecialtyId,
    getHospitalSpecialtyOfferingsByHospitalId,
    deleteHospitalSpecialtyOffering,
    updateHospitalSpecialtyOffering,
    getOneHospitalSpecialtyOffering,
};