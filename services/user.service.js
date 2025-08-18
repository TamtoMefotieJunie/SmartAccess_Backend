const UserSchema = require('../models/user.model');
const roleSchema = require('../models/role.model')


const getAllUsers = async () => {
    return await UserSchema.find().populate("role");
};
   
const registerUser = async (user) => {
    
   return await UserSchema.create(user);

};

const getUserByEmail = async (email)=>{
    return await UserSchema.findOne({email}).populate("role");
}
const getUserByRole = async(role) => {
  return await UserSchema.find({role:role})
}
const getUserByAuthToken = async (authToken)=>{
    return await UserSchema.findOne({authToken})
}
const updateUser = async (id, user) => {
    return await UserSchema.findByIdAndUpdate(id, user, { new: true });
};

const getUserById = async (id) => {
    return await UserSchema.findById(id);
};
const deleteUSer = async(id) => {
    return await UserSchema.findByIdAndDelete(id);
}

module.exports = {
    updateUser,
    registerUser,
    getUserByAuthToken,
    getUserByEmail,
    getAllUsers,
    getUserById,
    deleteUSer,
    getUserByRole
};