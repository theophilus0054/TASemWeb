const axios = require('axios');

const SPARQL_ENDPOINT = process.env.SPARQL_ENDPOINT || 'http://localhost:3030/sparql';
const SPARQL_STATS_ENDPOINT = process.env.SPARQL_STATS_ENDPOINT || 'http://localhost:3030/stats';

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Common SPARQL prefixes used across all queries
 */
const PREFIXES = `
  PREFIX nusa: <http://nusarasa.id/ontology#>
  PREFIX owl:  <http://www.w3.org/2002/07/owl#>
  PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
`;

/**
 * Execute a SPARQL SELECT query against the Flask SPARQL endpoint.
 * Returns an array of binding objects.
 *
 * @param {string} sparqlQuery - Full SPARQL query string (prefixes will be prepended if missing)
 * @param {object} options - { useCache: boolean }
 * @returns {Promise<Array<object>>} Array of result bindings
 */
async function query(sparqlQuery, { useCache = false } = {}) {
  // Prepend common prefixes if they're not already included
  const fullQuery = sparqlQuery.includes('PREFIX')
    ? sparqlQuery
    : PREFIXES + sparqlQuery;

  // Check cache
  if (useCache) {
    const cacheKey = fullQuery.trim();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const response = await axios.post(
      SPARQL_ENDPOINT,
      `query=${encodeURIComponent(fullQuery)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 15000
      }
    );

    const bindings = response.data?.results?.bindings || [];

    // Store in cache
    if (useCache) {
      const cacheKey = fullQuery.trim();
      cache.set(cacheKey, { data: bindings, timestamp: Date.now() });
    }

    return bindings;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `SPARQL server is not running at ${SPARQL_ENDPOINT}. ` +
        `Start it with: python backend/sparql_server.py`
      );
    }
    if (error.response) {
      throw new Error(
        `SPARQL query failed (${error.response.status}): ` +
        `${error.response.data?.error || error.response.statusText}`
      );
    }
    throw new Error(`SPARQL request failed: ${error.message}`);
  }
}

/**
 * Get stats from the SPARQL server /stats endpoint.
 * @returns {Promise<object>}
 */
async function getStats() {
  try {
    const response = await axios.get(SPARQL_STATS_ENDPOINT, { timeout: 10000 });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`SPARQL server is not running at ${SPARQL_STATS_ENDPOINT}`);
    }
    throw new Error(`Failed to get SPARQL stats: ${error.message}`);
  }
}

/**
 * Extract a simple string value from a SPARQL binding field.
 * Handles both URI and literal types.
 *
 * @param {object} binding - A single result binding
 * @param {string} varName - The variable name to extract
 * @returns {string|null}
 */
function val(binding, varName) {
  const field = binding[varName];
  if (!field) return null;
  return field.value || null;
}

/**
 * Extract the local name from a full URI.
 * e.g. "http://nusarasa.id/ontology#Dish_Rendang" -> "Dish_Rendang"
 *
 * @param {string} uri
 * @returns {string}
 */
function localName(uri) {
  if (!uri) return '';
  const hashIdx = uri.lastIndexOf('#');
  if (hashIdx !== -1) return uri.substring(hashIdx + 1);
  const slashIdx = uri.lastIndexOf('/');
  if (slashIdx !== -1) return uri.substring(slashIdx + 1);
  return uri;
}

/**
 * Clear the query cache.
 */
function clearCache() {
  cache.clear();
}

module.exports = {
  query,
  getStats,
  val,
  localName,
  clearCache,
  PREFIXES
};
