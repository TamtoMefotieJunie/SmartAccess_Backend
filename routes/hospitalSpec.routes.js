
const express = require('express');
const router = express.Router();
const hospitalSpecialtyOfferingController = require('../controllers/hospitalSpecialtyOffering.controller.js');

router.post('/newspec', hospitalSpecialtyOfferingController.createHospitalSpecialtyOffering);
// router.get('/:id',hospitalSpecialtyOfferingController.getHospitalSpecialtyOfferingById);
router.get('/fetch/all', hospitalSpecialtyOfferingController.getAllHospitalSpecialtyOfferings);
router.get('/fetch/specialty', hospitalSpecialtyOfferingController.getHospitalSpecialtyOfferingsBySpecialtyId);
router.get('/hospital/allspec/:id',hospitalSpecialtyOfferingController.getHospitalSpecialtyOfferingsByHospitalId);
// router.put('/update/:id', hospitalSpecialtyOfferingController.updateHospitalSpecialtyOffering);
// router.delete('/delete/one', hospitalSpecialtyOfferingController.deleteHospitalSpecialtyOffering);

module.exports = router;
