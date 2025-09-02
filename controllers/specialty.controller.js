
const specialityService = require('../services/specialty.service');
const userService = require("../services/user.service.js");

const getAllSpecialties=async(req,res)=>{
    try{
        const specialties = await specialityService.getAllSpecialties();
        return res.status(200).json({data: specialties, message: 'Specialty fetch successfully !!!'})
    }catch(err){
        console.log(err)
        return res.status(500).json({message:'An error occured while fetching specialties',error: err.message})
    }
}
const getAllSpecialtiesByName=async(req,res)=>{
    try{ 
        const specialties = await specialityService.getAllSpecialtiesByName(req.params?.name);
        return res.status(200).json({data: specialties, message: 'Specialty fetched successfully !!!'})
    }catch(err){
        return res.status(500).json('An error occured while fetching Specialties')
    }
}

const createSpecialty = async (req, res) => {
    console.log(req.body)
    const spec = req.body;
 
    if (!spec.name) {
        return res.status(400).json({ message: "Name is required." });
    }

    try {
        const specialties = await specialityService.getAllSpecialtiesByName(spec.name);
        if (specialties) {
            return res.status(400).json({ message: "Specialty exists already!" });
        }

        try {
            const newSpecialty = await specialityService.createSpecialty(spec);
            return res.status(201).json({ data: newSpecialty, message: 'Specialty created successfully!' });
        } catch (err) {
            return res.status(500).json({ message: 'An error occurred when creating Specialty', error: err.message });
        }
    } catch (err) {
        return res.status(500).json({ message: 'An error occurred when getting Specialty' });
    }
};
const updateSpecialty = async (req, res) => {
    const update = req.body.specialty;
    const initial = req.params?.name;
    try {
        const updatedSpecialty = await specialityService.updateSpecialty(initial, update);
        return res.status(200).json({message: "Specialty updated successfully !", data:updatedSpecialty});
    }
    catch(error){
        console.error(error)
        return res.status(500).json({message :'An error occured when updating Specialty',error: error.message})
    }
}

const deleteSpecialty = async (req, res) => {
    try {
        const deletedSpecialty = await specialityService.deleteSpecialty(req.params?.name);
        return res.status(200).json({message: "Specialty deleted successfully !", data:deletedSpecialty});
    }catch(error) {
        console.error(error);
        return res.status(500).json('An error occured when deleting specialty')
    }
}
module.exports={
    getAllSpecialties,
    getAllSpecialtiesByName,
    createSpecialty,
    deleteSpecialty,
    updateSpecialty
}