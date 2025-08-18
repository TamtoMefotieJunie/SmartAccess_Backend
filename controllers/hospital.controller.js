
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
            name: hospital.hospitalName,
            location: hospital.hospitalAddress,
            matriculationID: hospital.hospitalMatricule,
            packPrice: hospital.price,
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

const addtechnician = async (req, res) => {
    const { technician, hospital } = req.body;

    try {
        const dbHospital = await hospitalservice.getHospitalByName(hospital.name);
        if (!dbHospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }
         const technicianObj = dbHospital.technicians.find(techId => techId.email === technician.email);
         if (technicianObj) {
             return res.status(400).json({ message: "Technician already added to this hospital!" });
         }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(technician.password, salt);

        const newTech = {
            ...technician,
            password: hashedPassword
        };

        const savedTechnician = await userService.registerUser(newTech);

        dbHospital.technicians.push(savedTechnician._id);

        const savedHospital = await dbHospital.save();

        return res.status(200).json({ data: savedHospital, message: "New technician added successfully!" });
    } catch (error) {
        console.error({ message: "An error occurred while saving the new lab tech", error: error.message });
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
}

const Deletechnician = async (req, res) => {
    const { id, hospital } = req.body;

        try {
            const singleHospital = await hospitalservice.getHospitalById(hospital.id);
            console.log("Before Deletion:", singleHospital.technicians);

           
            singleHospital.technicians = singleHospital.technicians.filter(tech => tech._id.toString() !== id);

            console.log("After Deletion:", singleHospital.technicians);

            const updatedHospital = await singleHospital.save();

            return res.status(200).json({ message: "Technician removed successfully", data: updatedHospital });
        } catch (error) {
            console.error("Error removing technician:", error);
            return res.status(500).json({ message: "An error occurred while removing the technician", error: error.message });
        }

};


module.exports={
    createHospital,
    getAllHospitals,
    DeleteHospitals,
    updateHospitals,
    Deletechnician,
    addtechnician,
    getOneHospital
    
}