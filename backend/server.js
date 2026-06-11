const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const ontologyRoutes = require('./routes/ontology');
const dataRoutes = require('./routes/data');
const queryRoutes = require('./routes/query');

// Use routes
app.use('/api/ontology', ontologyRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/query', queryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'TASemWeb Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TASemWeb Backend API',
    version: '1.0.0',
    description: 'Express backend for semantic web with RDF/Ontology support',
    endpoints: {
      health: '/api/health',
      ontology: '/api/ontology',
      data: '/api/data',
      query: '/api/query'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.path
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TASemWeb Backend server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
  console.log(`   - Ontology API: http://localhost:${PORT}/api/ontology`);
  console.log(`   - Data API: http://localhost:${PORT}/api/data`);
  console.log(`   - Query API: http://localhost:${PORT}/api/query`);
});

module.exports = app;
