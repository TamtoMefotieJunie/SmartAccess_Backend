const AppointmentSchema =require( "../models/appointment.model.js");

const createAppointment = async(appointment) => {
  return await AppointmentSchema.create(appointment);
};

const updateAppointment = async(id, appointment) => {
  return await AppointmentSchema.findByIdAndUpdate(id, appointment, {new:true});
};

const deleteAppointment = async(id) => {
  return await AppointmentSchema.findByIdAndDelete({id});
};

const getAllAppointment = async() => {
  return await AppointmentSchema.find();
};
const getAppointmentById=async(id)=>{
    return await AppointmentSchema.findById(id)
};

module.exports = {
    getAllAppointment,
    deleteAppointment,
    updateAppointment,
    createAppointment,
    getAppointmentById,
};