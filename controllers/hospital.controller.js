
const hospitalservice = require("../services/hospital.service.js");
const userService = require("../services/user.service.js");
const bcrypt = require('bcrypt');


const createHospital = async (req, res) => {
    const { hospital, admin } = req.body; 
    console.log("Request Body:", req.body);
    if (!admin?.adminPassword) {
        return res.status(400).json({ message: 'adminPassword is required' });
    }
    try { 
        const hashedPassword = await bcrypt.hash(admin.adminPassword, 10);
        console.log("Hashed Password:", hashedPassword);

        const adminData = {
            name: admin.adminName,
            email: admin.adminEmail,
            password: hashedPassword,
            matriculationID: admin.adminMatricule,
            role: admin.role,
            telephone:admin.telephone
        };

        const savedAdmin = await userService.registerUser(adminData);
        const hospitalData = {
            name: hospital.name || hospital.hospitalName,
            address: hospital.address || hospital.hospitalAddress,
            region: hospital.region,
            longitude: hospital.longitude,
            latitude: hospital.latitude,
            telephone_general: hospital.telephone_general,
            admin: savedAdmin._id 
        };

        const savedHospital = await hospitalservice.createHospital(hospitalData);
        savedAdmin.hospital = savedHospital._id;
        await userService.updateUser(savedAdmin._id, savedAdmin);

        return res.status(201).json({
            message: 'Hospital and Admin created successfully',
            hospital: savedHospital,
            admin: savedAdmin
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            message: 'Error creating hospital and admin',
            error: error.message
        });
    }
};

const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await hospitalservice.getAllHospitals();
        return res.status(200).json({message: "Success", data:hospitals})

    } catch(error) {
        console.error({mesage:"an error occured while fetching all the hopsitals",error:error.message})
    }
}

const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const Hospital = await hospitalservice.getHospitalById(id);
    if (!Hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    res.status(200).json(Hospital);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Hospital' });
  }
};

const getOneHospital = async(req,res) => {
    const admin = req.body;
    try {
    const hospital = await hospitalservice.getOneHospital(admin);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    return res.status(200).json({ message: "Success", data: hospital });
    } catch (error) {
        console.log({ message: "An error occurred while fetching the hospital", error: error.message });
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
}


const DeleteHospitals = async(req, res) =>{
    const {id} = req.params;
    try {
        const hospital = await hospitalservice.DeleteHospital(id);
        return res.status(200).json({message: "Hospital deleted successfully", data:hospital})
    } catch(error) {
        console.error({mesage:"an error occured while deleting the hopsitals",error:error.message})

    }
}

const updateHospitals = async (req, res) => {
    const {id} = req.params;
    const hospital = req.body;
    console.log(id,hospital);
    
    try {
        let Hospital = await hospitalservice.updateHospital(id, hospital);
        
        return res.status(200).json({message: "Hospital updated successfully", data:Hospital})
    } catch(error) {
        console.error({mesage:"an error occured while updating the hopsitals",error:error.message})
        
    }
}


module.exports={
    createHospital,
    getAllHospitals,
    DeleteHospitals,
    updateHospitals,
    getHospitalById,
    getOneHospital
    
}