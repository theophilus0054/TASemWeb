const queryService = require('../services/queryService');

// Execute SPARQL-like query
exports.executeSparqlQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const results = await queryService.executeSparqlQuery(query);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Execute semantic search
exports.semanticSearch = async (req, res) => {
  try {
    const { keyword, ontologyClass } = req.body;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    const results = await queryService.semanticSearch(keyword, ontologyClass);
    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get related resources
exports.getRelatedResources = async (req, res) => {
  try {
    const { resource } = req.params;
    const related = await queryService.getRelatedResources(resource);
    res.json({ resource, related });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
