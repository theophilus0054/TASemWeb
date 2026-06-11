const ontologyService = require('../services/ontologyService');

// Get ontology info
exports.getOntologyInfo = async (req, res) => {
  try {
    const info = await ontologyService.getOntologyInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await ontologyService.getAllClasses();
    res.json({ classes, count: classes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await ontologyService.getAllProperties();
    res.json({ properties, count: properties.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get class details
exports.getClassDetails = async (req, res) => {
  try {
    const { name } = req.params;
    const classDetails = await ontologyService.getClassDetails(name);
    res.json(classDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get property details
exports.getPropertyDetails = async (req, res) => {
  try {
    const { name } = req.params;
    const propertyDetails = await ontologyService.getPropertyDetails(name);
    res.json(propertyDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
