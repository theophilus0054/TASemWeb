const express = require('express');
const router = express.Router();
const ontologyController = require('../controllers/ontologyController');

// Get ontology info
router.get('/info', ontologyController.getOntologyInfo);

// Get all classes
router.get('/classes', ontologyController.getAllClasses);

// Get all properties
router.get('/properties', ontologyController.getAllProperties);

// Get class details
router.get('/classes/:name', ontologyController.getClassDetails);

// Get property details
router.get('/properties/:name', ontologyController.getPropertyDetails);

module.exports = router;
