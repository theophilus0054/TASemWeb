#!/usr/bin/env python3
"""
SPARQL Server for NusaRasa Ontology
A lightweight SPARQL endpoint using RDFLib

Install dependencies:
    pip install rdflib flask flask-cors

Run:
    python sparql_server.py

Access: http://localhost:3030/sparql
"""

import json
import logging
from pathlib import Path
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from rdflib import Graph, Namespace
from rdflib.plugins.sparql import prepareQuery

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global RDF Graph
graph = Graph()

# Namespaces
NUSA = Namespace("http://nusarasa.id/ontology#")

# ============================================================================
# INITIALIZATION
# ============================================================================

def load_data():
    """Load ontology and data files into RDF graph"""
    logger.info("Loading RDF data...")
    
    ontology_file = Path(__file__).parent / "ontology" / "nusarasa_ontology.ttl"
    data_file = Path(__file__).parent / "data" / "nusarasa_data.ttl"
    
    try:
        # Load ontology
        if ontology_file.exists():
            logger.info(f"Loading ontology from {ontology_file}")
            graph.parse(str(ontology_file), format='turtle')
        else:
            logger.warning(f"Ontology file not found: {ontology_file}")
        
        # Load data
        if data_file.exists():
            logger.info(f"Loading data from {data_file}")
            graph.parse(str(data_file), format='turtle')
        else:
            logger.warning(f"Data file not found: {data_file}")
        
        # Print statistics
        logger.info(f"Total triples loaded: {len(graph)}")
        
        # Count instance types
        query = """
        SELECT (COUNT(DISTINCT ?dish) as ?dishes) 
               (COUNT(DISTINCT ?region) as ?regions)
               (COUNT(DISTINCT ?ingredient) as ?ingredients)
        WHERE {
          OPTIONAL { ?dish a <http://nusarasa.id/ontology#Dish> . }
          OPTIONAL { ?region a <http://nusarasa.id/ontology#Region> . }
          OPTIONAL { ?ingredient a <http://nusarasa.id/ontology#Ingredient> . }
        }
        """
        results = graph.query(query)
        for row in results:
            logger.info(f"  - Dishes: {row.dishes}, Regions: {row.regions}, Ingredients: {row.ingredients}")
        
    except Exception as e:
        logger.error(f"Error loading RDF files: {str(e)}")
        raise


# ============================================================================
# ROUTES
# ============================================================================

@app.route('/')
def index():
    """Root endpoint - API info"""
    return jsonify({
        "name": "NusaRasa SPARQL Server",
        "version": "1.0",
        "endpoints": {
            "sparql": "/sparql",
            "query_editor": "/query",
            "health": "/health",
            "stats": "/stats"
        },
        "description": "RDFLib-based SPARQL endpoint for NusaRasa ontology"
    })


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "OK",
        "triples": len(graph),
        "message": "NusaRasa SPARQL server is running"
    })


@app.route('/stats')
def stats():
    """Get dataset statistics"""
    try:
        query_str = """
        PREFIX nusa: <http://nusarasa.id/ontology#>
        SELECT 
            (COUNT(DISTINCT ?dish) as ?total_dishes)
            (COUNT(DISTINCT ?region) as ?total_regions)
            (COUNT(DISTINCT ?ingredient) as ?total_ingredients)
            (COUNT(DISTINCT ?culture) as ?total_cultures)
            (COUNT(DISTINCT ?event) as ?total_events)
        WHERE {
            OPTIONAL { ?dish a nusa:Dish . }
            OPTIONAL { ?region a nusa:Region . }
            OPTIONAL { ?ingredient a nusa:Ingredient . }
            OPTIONAL { ?culture a nusa:Culture . }
            OPTIONAL { ?event a nusa:Event . }
        }
        """
        
        results = graph.query(query_str)
        for row in results:
            return jsonify({
                "total_dishes": int(row.total_dishes),
                "total_regions": int(row.total_regions),
                "total_ingredients": int(row.total_ingredients),
                "total_cultures": int(row.total_cultures),
                "total_events": int(row.total_events),
                "total_triples": len(graph)
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/sparql', methods=['GET', 'POST'])
def sparql_endpoint():
    """SPARQL query endpoint"""
    try:
        # Get query from request
        if request.method == 'POST':
            if request.content_type and 'application/sparql-query' in request.content_type:
                query_str = request.data.decode('utf-8')
            else:
                query_str = request.form.get('query') or request.json.get('query')
        else:
            query_str = request.args.get('query')
        
        if not query_str:
            return jsonify({
                "error": "No query provided",
                "usage": "POST /sparql with 'query' parameter or raw SPARQL in body"
            }), 400
        
        # Execute query
        logger.info(f"Executing SPARQL query: {query_str[:100]}...")
        results = graph.query(query_str)
        
        # Format results as JSON
        result_dict = {
            "head": {"vars": list(results.vars) if hasattr(results, 'vars') else []},
            "results": {
                "bindings": []
            }
        }
        
        for row in results:
            binding = {}
            for var in results.vars:
                val = row[var]
                if val is not None:
                    binding[str(var)] = {
                        "type": "uri" if hasattr(val, 'n3') else "literal",
                        "value": str(val)
                    }
            result_dict["results"]["bindings"].append(binding)
        
        return jsonify(result_dict)
    
    except Exception as e:
        logger.error(f"SPARQL error: {str(e)}")
        return jsonify({
            "error": str(e),
            "type": type(e).__name__
        }), 400


@app.route('/query')
def query_editor():
    """Simple query editor UI"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>NusaRasa SPARQL Query Editor</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            textarea { width: 100%; height: 300px; font-family: monospace; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background: #0056b3; }
            #results { margin-top: 20px; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; max-height: 400px; overflow-y: auto; }
            .loading { color: #666; }
            .error { color: #d32f2f; }
            .success { color: #388e3c; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🍜 NusaRasa SPARQL Query Editor</h1>
            
            <h3>Sample Query:</h3>
            <button onclick="loadExample()">Load Example Query</button>
            
            <h3>Your Query:</h3>
            <textarea id="query" placeholder="Enter your SPARQL query here...">PREFIX nusa: <http://nusarasa.id/ontology#>

SELECT ?dish ?name
WHERE {
  ?dish a nusa:Dish ;
        nusa:nama ?name .
}
LIMIT 10</textarea>
            
            <br><br>
            <button onclick="executeQuery()">Execute Query</button>
            <button onclick="getStats()">Get Statistics</button>
            
            <div id="results"></div>
        </div>
        
        <script>
            async function executeQuery() {
                const query = document.getElementById('query').value;
                const resultsDiv = document.getElementById('results');
                
                if (!query.trim()) {
                    resultsDiv.innerHTML = '<p class="error">Please enter a query</p>';
                    return;
                }
                
                resultsDiv.innerHTML = '<p class="loading">Executing query...</p>';
                
                try {
                    const response = await fetch('/sparql', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'query=' + encodeURIComponent(query)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        const bindings = data.results.bindings;
                        if (bindings.length === 0) {
                            resultsDiv.innerHTML = '<p class="success">Query executed successfully (0 results)</p>';
                        } else {
                            let html = '<p class="success">✓ Query executed successfully (' + bindings.length + ' results)</p>';
                            html += '<pre>' + JSON.stringify(bindings, null, 2) + '</pre>';
                            resultsDiv.innerHTML = html;
                        }
                    } else {
                        resultsDiv.innerHTML = '<p class="error">Error: ' + data.error + '</p>';
                    }
                } catch (error) {
                    resultsDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
                }
            }
            
            async function getStats() {
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = '<p class="loading">Loading statistics...</p>';
                
                try {
                    const response = await fetch('/stats');
                    const data = await response.json();
                    
                    let html = '<h3>Dataset Statistics</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    resultsDiv.innerHTML = html;
                } catch (error) {
                    resultsDiv.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
                }
            }
            
            function loadExample() {
                document.getElementById('query').value = `PREFIX nusa: <http://nusarasa.id/ontology#>

SELECT ?dish ?name ?spice
WHERE {
  ?dish a nusa:Dish ;
        nusa:nama ?name ;
        nusa:tingkat_kepedasan ?spice .
  FILTER (?spice = "Tidak Pedas" || ?spice = "Sedang")
}
LIMIT 20`;
            }
        </script>
    </body>
    </html>
    """
    return render_template_string(html)


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("Starting NusaRasa SPARQL Server")
    logger.info("=" * 60)
    
    # Load data
    load_data()
    
    # Start server
    logger.info("Server starting on http://localhost:3030")
    logger.info("Query editor: http://localhost:3030/query")
    logger.info("=" * 60)
    
    app.run(host='0.0.0.0', port=3030, debug=True)
