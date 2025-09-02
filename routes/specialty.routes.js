const specialtyController = require('../controllers/specialty.controller.js');
const express = require('express')

const router = express.Router();

router.get('/',specialtyController.getAllSpecialties)
router.post('/new',specialtyController.createSpecialty)
router.put('/update/:name',specialtyController.updateSpecialty);
router.delete("/delete/:name",specialtyController.deleteSpecialty);
router.get('/fetch/:name',specialtyController.getAllSpecialtiesByName)


module.exports=router