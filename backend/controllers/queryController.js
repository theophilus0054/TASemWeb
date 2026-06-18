const queryService = require('../services/queryService');
const nl2sparqlService = require('../services/nl2sparqlService');

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

// Translate NL to SPARQL and execute
exports.translateAndExecute = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Translate NL to SPARQL
    const translationResult = await nl2sparqlService.translate(question);
    const { sparql, explanation } = translationResult;
    
    // Execute generated SPARQL
    const results = await queryService.executeSparqlQuery(sparql);
    
    res.json({ 
      sparql,
      explanation,
      results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
