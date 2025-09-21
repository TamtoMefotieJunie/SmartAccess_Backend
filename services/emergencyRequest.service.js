const EmergencySchema = require('../models/emergencyRequest.model')

const getAllEmergency = async () => {
    return await EmergencySchema.find();
};
   
const createEmergency = async (Emergency) => {
    return await EmergencySchema.create(Emergency);
};
const getEmergencyById = async (id) => {
  return await EmergencySchema.findById(id);
};

const getEmergencysByLocation = async (location) => {
  return await EmergencySchema.find({location})
}
   
const updateEmergency = async (id, Emergency) => {
  return await EmergencySchema.findByIdAndUpdate(id, Emergency, { new: true });
};
   
const DeleteEmergency = async (id) => {
  return await EmergencySchema.findByIdAndDelete(id);
};
module.exports = {
  createEmergency,
  getAllEmergency,
  getEmergencyById,
  getEmergencysByLocation,
  updateEmergency,
  DeleteEmergency
};
