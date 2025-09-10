
const express = require('express');
const router = express.Router();
const hospitalSpecialtyOfferingController = require('../controllers/hospitalSpecialtyOffering.controller.js');

router.post('/newspec', hospitalSpecialtyOfferingController.createHospitalSpecialtyOffering);
router.get('/fetch/all', hospitalSpecialtyOfferingController.getAllHospitalSpecialtyOfferings);
router.get('/fetch/specialty/:id', hospitalSpecialtyOfferingController.getHospitalSpecialtyOfferingsBySpecialtyId);
router.get('/hospital/allspec/:id',hospitalSpecialtyOfferingController.getHospitalSpecialtyOfferingsByHospitalId);


module.exports = router;
