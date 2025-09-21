const emergencyService = require('../services/emergencyRequest.service')

const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await emergencyService.getAllEmergency();
    res.status(200).json({data:emergencies,message:'emmergencies fetched succesfully'});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergencies' });
  }
};

const getEmergencyById = async (req, res) => {
  try {
    const { id } = req.params;
    const emergency = await emergencyService.getEmergencyById(id);
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    res.status(200).json(emergency);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergency' });
  }
};

const createEmergency = async (req, res) => {
  try {
    const emergencyData = req.body;
    const newEmergency = await emergencyService.createEmergency(emergencyData);
    res.status(201).json(newEmergency);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create emergency' });
  }
};

const updateEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedEmergency = await emergencyService.updateEmergency(id, updateData);
    if (!updatedEmergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    res.status(200).json(updatedEmergency);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update emergency' });
  }
};

const deleteEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmergency = await emergencyService.DeleteEmergency(id);
    if (!deletedEmergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }
    res.status(200).json({ message: 'Emergency deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete emergency' });
  }
};

const getEmergenciesByLocation = async (req, res) => {
  try {
    const { location } = req.query; 
    const emergencies = await emergencyService.getEmergencysByLocation(location);
    res.status(200).json(emergencies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergencies by location' });
  }
};

module.exports = {
  getAllEmergencies,
  getEmergencyById,
  createEmergency,
  updateEmergency,
  deleteEmergency,
  getEmergenciesByLocation
};