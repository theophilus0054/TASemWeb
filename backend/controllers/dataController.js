const dataService = require('../services/dataService');

// Get all data
exports.getAllData = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await dataService.getAllData(page, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get data by ID
exports.getDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await dataService.getDataById(id);
    if (!data) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search data
exports.searchData = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const results = await dataService.searchData(query);
    res.json({ results, count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get data statistics
exports.getDataStats = async (req, res) => {
  try {
    const stats = await dataService.getDataStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
