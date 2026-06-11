const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// Execute SPARQL-like query
router.post('/sparql', queryController.executeSparqlQuery);

// Execute semantic search
router.post('/semantic-search', queryController.semanticSearch);

// Get related resources
router.get('/related/:resource', queryController.getRelatedResources);

module.exports = router;
