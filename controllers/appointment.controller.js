const appointmentService = require('../services/appointment.service')
const userService = require("../services/user.service.js");


const createAppointment = async (req, res) => {
    const {appointmentData} = req.body
    if (!appointmentData) {
    return res.status(400).json({ message: "appointment data is required."});
    }
    try{
        const appointment = await appointmentService.createAppointment(appointmentData);
        res.status(201).json({data:appointment, message: 'appointment registered successfully' });

    }catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            message: 'Error creating appointment',
            error: error.message
        });
    }
}
const getAllAppointments = async (req, res) => {
    try {
        const appointment = await appointmentService.getAllAppointment();
        return res.status(200).json({message: "Success", data:appointment})

    } catch(error) {
        console.error({mesage:"an error occured while fetching all the appointments",error:error.message})
    }
}

const deleteAppointment = async(req, res) =>{
    const {id} = req.params;
    try {
        const appointment = await appointmentService.deleteAppointment(id);
        if(!appointment){
            return res.status(404).json('appointment does not exist')
        }
        return res.status(200).json({message: "Appointment deleted successfully", data:appointment})
    } catch(error) {
        console.error({mesage:"an error occured while deleting the appointment",error:error.message})

    }
}
const updateAppointment = async (req, res) => {
    const {id} = req.params;
    const appointment = req.body;
    console.log(id,appointment);  
    try {
        let Appointment = await appointmentService.updateAppointment(id, appointment);
        
        return res.status(200).json({message: "Appointment updated successfully", data:Appointment})
    } catch(error) {
        console.error({mesage:"an error occured while updating the appointment",error:error.message})
        
    }
}
module.exports = {
    createAppointment,
    deleteAppointment,
    updateAppointment,
    getAllAppointments
}