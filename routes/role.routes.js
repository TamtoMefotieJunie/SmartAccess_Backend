const roleController = require('../controllers/role.controller.js');
const express = require('express')

const router = express.Router();

router.get('/',roleController.getAllRoles)
router.post('/new',roleController.createRole)
router.get('/:id',roleController.getAllRolesById)
router.put('/update/:name',roleController.updateRole);
router.delete("/delete/:name",roleController.deleteRole);
router.get('/fetch/:name',roleController.getAllRolesByName)


module.exports=router