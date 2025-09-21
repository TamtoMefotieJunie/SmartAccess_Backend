const express = require('express')
const router = express.Router()
const recommendationController = require('../controllers/recommendation.controller')

router.get('/',recommendationController.getAllRecommendations)
router.post('/newRecommendation/:emergencyId',recommendationController.createRecommendation)
router.get('/:id',recommendationController.getRecommendationById)
router.get('/location',recommendationController.getRecommendationsByLocation)
router.put('/update/:id',recommendationController.updateRecommendation)
router.delete('/delete/:id',recommendationController.deleteRecommendation)

module.exports = router
