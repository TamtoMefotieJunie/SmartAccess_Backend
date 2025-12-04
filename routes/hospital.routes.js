const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller.js');

router.post('/addHospital', hospitalController.createHospital);
router.get('/allHospital', hospitalController.getAllHospitals);
router.get('/getHospital/:id', hospitalController.getHospitalById);
router.put('/update/:id', hospitalController.updateHospitals);
router.get('/delete/:id', hospitalController.DeleteHospitals);
router.get('/hospital/admin', hospitalController.getOneHospital);


module.exports = router;
