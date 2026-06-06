const sparql = require('./sparqlClient');

/**
 * Execute a raw SPARQL query against the RDF graph.
 * Forwards the query directly to the Flask SPARQL endpoint.
 */
exports.executeSparqlQuery = async (query) => {
  try {
    const bindings = await sparql.query(query);
    return bindings;
  } catch (error) {
    throw new Error(`Failed to execute SPARQL query: ${error.message}`);
  }
};

/**
 * Semantic search — searches dishes using SPARQL with ontology-aware filtering.
 * Can filter by ontology class (e.g. MainDish, Snack, Beverage).
 */
exports.semanticSearch = async (keyword, ontologyClass = null) => {
  try {
    const escapedKeyword = keyword.replace(/"/g, '\\"');

    // Build class filter
    let classFilter = '?type rdfs:subClassOf* nusa:Dish .';
    if (ontologyClass) {
      classFilter = `VALUES ?type { nusa:${ontologyClass} }`;
    }

    const bindings = await sparql.query(`
      SELECT ?dish ?name ?desc ?spice ?diet ?method ?regionName ?cultureName ?type
             (GROUP_CONCAT(DISTINCT ?ingredientName; separator=", ") AS ?ingredients)
      WHERE {
        ?dish a ?type ;
              nusa:nama ?name .
        ${classFilter}
        OPTIONAL { ?dish nusa:deskripsi ?desc . }
        OPTIONAL { ?dish nusa:tingkat_kepedasan ?spice . }
        OPTIONAL { ?dish nusa:kategori_diet ?diet . }
        OPTIONAL { ?dish nusa:metode_memasak ?method . }
        OPTIONAL { ?dish nusa:berasal_dari ?region . ?region nusa:nama ?regionName . }
        OPTIONAL { ?dish nusa:terkait_budaya ?culture . ?culture nusa:nama ?cultureName . }
        OPTIONAL { ?dish nusa:mengandung ?ingredient . ?ingredient nusa:nama ?ingredientName . }
        FILTER(
          CONTAINS(LCASE(STR(?name)), LCASE("${escapedKeyword}")) ||
          CONTAINS(LCASE(STR(COALESCE(?desc, ""))), LCASE("${escapedKeyword}")) ||
          CONTAINS(LCASE(STR(COALESCE(?regionName, ""))), LCASE("${escapedKeyword}")) ||
          CONTAINS(LCASE(STR(COALESCE(?ingredientName, ""))), LCASE("${escapedKeyword}"))
        )
      }
      GROUP BY ?dish ?name ?desc ?spice ?diet ?method ?regionName ?cultureName ?type
      ORDER BY ?name
      LIMIT 50
    `);

    return bindings.map(b => ({
      id: sparql.localName(sparql.val(b, 'dish')),
      nama: sparql.val(b, 'name'),
      deskripsi: sparql.val(b, 'desc'),
      tingkat_kepedasan: sparql.val(b, 'spice'),
      kategori_diet: sparql.val(b, 'diet'),
      metode_memasak: sparql.val(b, 'method'),
      daerah: sparql.val(b, 'regionName'),
      budaya: sparql.val(b, 'cultureName'),
      bahan_utama: sparql.val(b, 'ingredients'),
      tipe: sparql.localName(sparql.val(b, 'type'))
    }));
  } catch (error) {
    throw new Error(`Failed to perform semantic search: ${error.message}`);
  }
};

/**
 * Get resources related to a given dish.
 * Finds dishes that share the same region, culture, or ingredients.
 */
exports.getRelatedResources = async (resource) => {
  try {
    // First get the source dish info
    const sourceBindings = await sparql.query(`
      SELECT ?name ?regionName ?cultureName
      WHERE {
        nusa:${resource} nusa:nama ?name .
        OPTIONAL { nusa:${resource} nusa:berasal_dari ?region . ?region nusa:nama ?regionName . }
        OPTIONAL { nusa:${resource} nusa:terkait_budaya ?culture . ?culture nusa:nama ?cultureName . }
      }
      LIMIT 1
    `);

    if (sourceBindings.length === 0) {
      throw new Error('Resource not found');
    }

    const source = {
      id: resource,
      nama: sparql.val(sourceBindings[0], 'name'),
      daerah: sparql.val(sourceBindings[0], 'regionName'),
      budaya: sparql.val(sourceBindings[0], 'cultureName')
    };

    // Find related by shared region, culture, or ingredients
    const relatedBindings = await sparql.query(`
      SELECT DISTINCT ?relDish ?relName ?relRegionName ?relationType
      WHERE {
        {
          nusa:${resource} nusa:berasal_dari ?region .
          ?relDish nusa:berasal_dari ?region ;
                   nusa:nama ?relName .
          OPTIONAL { ?relDish nusa:berasal_dari ?relRegion . ?relRegion nusa:nama ?relRegionName . }
          BIND("same_region" AS ?relationType)
        }
        UNION
        {
          nusa:${resource} nusa:terkait_budaya ?culture .
          ?relDish nusa:terkait_budaya ?culture ;
                   nusa:nama ?relName .
          OPTIONAL { ?relDish nusa:berasal_dari ?relRegion . ?relRegion nusa:nama ?relRegionName . }
          BIND("same_culture" AS ?relationType)
        }
        UNION
        {
          nusa:${resource} nusa:mengandung ?ingredient .
          ?relDish nusa:mengandung ?ingredient ;
                   nusa:nama ?relName .
          OPTIONAL { ?relDish nusa:berasal_dari ?relRegion . ?relRegion nusa:nama ?relRegionName . }
          BIND("shared_ingredient" AS ?relationType)
        }
        FILTER(?relDish != nusa:${resource})
      }
      ORDER BY ?relName
      LIMIT 20
    `);

    const related = relatedBindings.map(rb => ({
      id: sparql.localName(sparql.val(rb, 'relDish')),
      nama: sparql.val(rb, 'relName'),
      daerah: sparql.val(rb, 'relRegionName'),
      relationType: sparql.val(rb, 'relationType')
    }));

    return {
      source,
      related,
      count: related.length
    };
  } catch (error) {
    throw new Error(`Failed to get related resources: ${error.message}`);
  }
};
