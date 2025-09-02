const SpecialitySchema =require( "../models/specialities.model.js");

const getAllSpecialtiesByName = async (name) => {
    return await SpecialitySchema.findOne({name});
};

const createSpecialty = async(specialty) => {
  return await SpecialitySchema.create(specialty);
};
const getSpecialtyById = async(id) => {
  return await SpecialitySchema.findById(id);
};

const updateSpecialty = async(name, speciality) => {
  return await SpecialitySchema.findOneAndUpdate(name,speciality,{new: true});
};

const deleteSpecialty = async(name) => {
  return await SpecialitySchema.findOneAndDelete({name});
};

const getAllSpecialties = async() => {
  return await SpecialitySchema.find();
};

module.exports = {
    createSpecialty,
    getAllSpecialties,
    getAllSpecialtiesByName,
    updateSpecialty,
    deleteSpecialty,
    getSpecialtyById
};