const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Get all data
router.get('/', dataController.getAllData);

// Get data by ID
router.get('/:id', dataController.getDataById);

// Search data
router.get('/search/query', dataController.searchData);

// Get data statistics
router.get('/stats/overview', dataController.getDataStats);

module.exports = router;
