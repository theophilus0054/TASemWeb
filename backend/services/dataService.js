const sparql = require('./sparqlClient');

/**
 * Get all dishes from the RDF graph with pagination.
 * Queries the SPARQL endpoint for Dish instances with all data properties.
 */
exports.getAllData = async (page = 1, limit = 20) => {
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countResult = await sparql.query(`
      SELECT (COUNT(DISTINCT ?dish) as ?total)
      WHERE {
        ?dish a/rdfs:subClassOf* nusa:Dish ;
              nusa:nama ?name .
      }
    `, { useCache: true });
    const total = parseInt(sparql.val(countResult[0], 'total')) || 0;

    // Get paginated dishes
    const bindings = await sparql.query(`
      SELECT ?dish ?name ?desc ?spice ?diet ?method ?regionName ?cultureName ?type
      WHERE {
        ?dish a ?type ;
              nusa:nama ?name .
        ?type rdfs:subClassOf* nusa:Dish .
        OPTIONAL { ?dish nusa:deskripsi ?desc . }
        OPTIONAL { ?dish nusa:tingkat_kepedasan ?spice . }
        OPTIONAL { ?dish nusa:kategori_diet ?diet . }
        OPTIONAL { ?dish nusa:metode_memasak ?method . }
        OPTIONAL { ?dish nusa:berasal_dari ?region . ?region nusa:nama ?regionName . }
        OPTIONAL { ?dish nusa:terkait_budaya ?culture . ?culture nusa:nama ?cultureName . }
      }
      ORDER BY ?name
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `);

    const items = bindings.map((b, index) => ({
      id: sparql.localName(sparql.val(b, 'dish')),
      nama: sparql.val(b, 'name'),
      deskripsi: sparql.val(b, 'desc'),
      tingkat_kepedasan: sparql.val(b, 'spice'),
      kategori_diet: sparql.val(b, 'diet'),
      metode_memasak: sparql.val(b, 'method'),
      daerah: sparql.val(b, 'regionName'),
      budaya: sparql.val(b, 'cultureName'),
      tipe: sparql.localName(sparql.val(b, 'type'))
    }));

    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      items
    };
  } catch (error) {
    throw new Error(`Failed to get data: ${error.message}`);
  }
};

/**
 * Get a single dish by its RDF local name (e.g. "Dish_Rendang").
 * Returns full details including ingredients, region, culture, and related dishes.
 */
exports.getDataById = async (id) => {
  try {
    // Get main dish properties
    const bindings = await sparql.query(`
      SELECT ?name ?desc ?spice ?diet ?method ?regionName ?cultureName ?type
      WHERE {
        nusa:${id} a ?type ;
                   nusa:nama ?name .
        ?type rdfs:subClassOf* nusa:Dish .
        OPTIONAL { nusa:${id} nusa:deskripsi ?desc . }
        OPTIONAL { nusa:${id} nusa:tingkat_kepedasan ?spice . }
        OPTIONAL { nusa:${id} nusa:kategori_diet ?diet . }
        OPTIONAL { nusa:${id} nusa:metode_memasak ?method . }
        OPTIONAL { nusa:${id} nusa:berasal_dari ?region . ?region nusa:nama ?regionName . }
        OPTIONAL { nusa:${id} nusa:terkait_budaya ?culture . ?culture nusa:nama ?cultureName . }
      }
      LIMIT 1
    `);

    if (bindings.length === 0) return null;

    const b = bindings[0];

    // Get ingredients
    const ingredientBindings = await sparql.query(`
      SELECT ?ingredientName
      WHERE {
        nusa:${id} nusa:mengandung ?ingredient .
        ?ingredient nusa:nama ?ingredientName .
      }
    `);
    const bahan_utama = ingredientBindings
      .map(ib => sparql.val(ib, 'ingredientName'))
      .filter(Boolean);

    // Get related dishes (same region or culture)
    const relatedBindings = await sparql.query(`
      SELECT DISTINCT ?relDish ?relName
      WHERE {
        nusa:${id} nusa:berasal_dari ?region .
        ?relDish nusa:berasal_dari ?region ;
                 nusa:nama ?relName .
        FILTER(?relDish != nusa:${id})
      }
      LIMIT 5
    `);
    const related = relatedBindings.map(rb => ({
      id: sparql.localName(sparql.val(rb, 'relDish')),
      nama: sparql.val(rb, 'relName')
    }));

    return {
      id,
      nama: sparql.val(b, 'name'),
      deskripsi: sparql.val(b, 'desc'),
      tingkat_kepedasan: sparql.val(b, 'spice'),
      kategori_diet: sparql.val(b, 'diet'),
      metode_memasak: sparql.val(b, 'method'),
      daerah: sparql.val(b, 'regionName'),
      budaya: sparql.val(b, 'cultureName'),
      tipe: sparql.localName(sparql.val(b, 'type')),
      bahan_utama,
      related
    };
  } catch (error) {
    throw new Error(`Failed to get data by ID: ${error.message}`);
  }
};

/**
 * Search dishes by keyword.
 * Uses SPARQL FILTER with case-insensitive CONTAINS on name and description.
 */
exports.searchData = async (query) => {
  try {
    const escapedQuery = query.replace(/"/g, '\\"');

    const bindings = await sparql.query(`
      SELECT ?dish ?name ?desc ?spice ?diet ?method ?regionName ?cultureName ?type
      WHERE {
        ?dish a ?type ;
              nusa:nama ?name .
        ?type rdfs:subClassOf* nusa:Dish .
        OPTIONAL { ?dish nusa:deskripsi ?desc . }
        OPTIONAL { ?dish nusa:tingkat_kepedasan ?spice . }
        OPTIONAL { ?dish nusa:kategori_diet ?diet . }
        OPTIONAL { ?dish nusa:metode_memasak ?method . }
        OPTIONAL { ?dish nusa:berasal_dari ?region . ?region nusa:nama ?regionName . }
        OPTIONAL { ?dish nusa:terkait_budaya ?culture . ?culture nusa:nama ?cultureName . }
        FILTER(
          CONTAINS(LCASE(STR(?name)), LCASE("${escapedQuery}")) ||
          CONTAINS(LCASE(STR(COALESCE(?desc, ""))), LCASE("${escapedQuery}")) ||
          CONTAINS(LCASE(STR(COALESCE(?regionName, ""))), LCASE("${escapedQuery}"))
        )
      }
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
      tipe: sparql.localName(sparql.val(b, 'type'))
    }));
  } catch (error) {
    throw new Error(`Failed to search data: ${error.message}`);
  }
};

/**
 * Get dataset statistics from the SPARQL server.
 */
exports.getDataStats = async () => {
  try {
    const stats = await sparql.getStats();
    return {
      totalRecords: stats.total_dishes || 0,
      totalRegions: stats.total_regions || 0,
      totalIngredients: stats.total_ingredients || 0,
      totalCultures: stats.total_cultures || 0,
      totalTriples: stats.total_triples || 0,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to get data stats: ${error.message}`);
  }
};
