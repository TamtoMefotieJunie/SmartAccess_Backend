const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller')

router.post('/addAppointment', appointmentController.createAppointment);
router.get('/allAppointments', appointmentController.getAllAppointments);
router.put('/update/:id', appointmentController.updateAppointment);
router.get('/delete/:id', appointmentController.deleteAppointment);

module.exports = router;