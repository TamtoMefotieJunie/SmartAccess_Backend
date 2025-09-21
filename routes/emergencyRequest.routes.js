const express = require('express')
const router = express.Router()
const emergencyController = require('../controllers/emergencyRequest.controller')

router.get('/',emergencyController.getAllEmergencies)
router.post('/new',emergencyController.createEmergency)
router.get('/:id',emergencyController.getEmergencyById)
router.get('/location',emergencyController.getEmergenciesByLocation)
router.put('/update/:id',emergencyController.updateEmergency)
router.delete('/delete/:id',emergencyController.deleteEmergency)

module.exports = router
