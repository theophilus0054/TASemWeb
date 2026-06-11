const sparql = require('./sparqlClient');

/**
 * Get ontology metadata from the RDF graph.
 */
exports.getOntologyInfo = async () => {
  try {
    const bindings = await sparql.query(`
      SELECT ?label ?comment ?version
      WHERE {
        <http://nusarasa.id/ontology> a owl:Ontology .
        OPTIONAL { <http://nusarasa.id/ontology> rdfs:label ?label . }
        OPTIONAL { <http://nusarasa.id/ontology> rdfs:comment ?comment . }
        OPTIONAL { <http://nusarasa.id/ontology> owl:versionInfo ?version . }
      }
      LIMIT 1
    `, { useCache: true });

    if (bindings.length === 0) {
      return {
        name: 'NusaRasa Ontology',
        description: 'Ontology for Indonesian culinary semantic web',
        version: 'unknown'
      };
    }

    const b = bindings[0];
    return {
      name: sparql.val(b, 'label') || 'NusaRasa Ontology',
      description: sparql.val(b, 'comment') || 'Ontology for Indonesian culinary semantic web',
      version: sparql.val(b, 'version') || '1.0',
      namespace: 'http://nusarasa.id/ontology#'
    };
  } catch (error) {
    throw new Error(`Failed to read ontology: ${error.message}`);
  }
};

/**
 * Get all OWL classes defined in the ontology.
 * Returns classes with their labels, comments, and subclass relationships.
 */
exports.getAllClasses = async () => {
  try {
    const bindings = await sparql.query(`
      SELECT ?class ?label ?comment ?parent
      WHERE {
        ?class a owl:Class .
        OPTIONAL { ?class rdfs:label ?label . }
        OPTIONAL { ?class rdfs:comment ?comment . }
        OPTIONAL { ?class rdfs:subClassOf ?parent .
                   ?parent a owl:Class . }
        FILTER(STRSTARTS(STR(?class), "http://nusarasa.id/ontology#"))
      }
      ORDER BY ?class
    `, { useCache: true });

    return bindings.map(b => ({
      id: sparql.localName(sparql.val(b, 'class')),
      uri: sparql.val(b, 'class'),
      label: sparql.val(b, 'label'),
      description: sparql.val(b, 'comment'),
      parent: sparql.val(b, 'parent') ? sparql.localName(sparql.val(b, 'parent')) : null
    }));
  } catch (error) {
    throw new Error(`Failed to parse classes: ${error.message}`);
  }
};

/**
 * Get all properties (object + datatype) defined in the ontology.
 */
exports.getAllProperties = async () => {
  try {
    // Get object properties
    const objectProps = await sparql.query(`
      SELECT ?prop ?label ?comment ?domain ?range
      WHERE {
        ?prop a owl:ObjectProperty .
        OPTIONAL { ?prop rdfs:label ?label . }
        OPTIONAL { ?prop rdfs:comment ?comment . }
        OPTIONAL { ?prop rdfs:domain ?domain . }
        OPTIONAL { ?prop rdfs:range ?range . }
        FILTER(STRSTARTS(STR(?prop), "http://nusarasa.id/ontology#"))
      }
      ORDER BY ?prop
    `, { useCache: true });

    // Get datatype properties
    const dataProps = await sparql.query(`
      SELECT ?prop ?label ?comment ?domain ?range
      WHERE {
        ?prop a owl:DatatypeProperty .
        OPTIONAL { ?prop rdfs:label ?label . }
        OPTIONAL { ?prop rdfs:comment ?comment . }
        OPTIONAL { ?prop rdfs:domain ?domain . }
        OPTIONAL { ?prop rdfs:range ?range . }
        FILTER(STRSTARTS(STR(?prop), "http://nusarasa.id/ontology#"))
      }
      ORDER BY ?prop
    `, { useCache: true });

    const formatProp = (b, type) => ({
      id: sparql.localName(sparql.val(b, 'prop')),
      uri: sparql.val(b, 'prop'),
      label: sparql.val(b, 'label'),
      description: sparql.val(b, 'comment'),
      domain: sparql.val(b, 'domain') ? sparql.localName(sparql.val(b, 'domain')) : null,
      range: sparql.val(b, 'range') ? sparql.localName(sparql.val(b, 'range')) : null,
      type
    });

    return [
      ...objectProps.map(b => formatProp(b, 'ObjectProperty')),
      ...dataProps.map(b => formatProp(b, 'DatatypeProperty'))
    ];
  } catch (error) {
    throw new Error(`Failed to parse properties: ${error.message}`);
  }
};

/**
 * Get details for a specific class, including its instances count and properties.
 */
exports.getClassDetails = async (name) => {
  try {
    // Get class info
    const classBindings = await sparql.query(`
      SELECT ?label ?comment ?parent
      WHERE {
        nusa:${name} a owl:Class .
        OPTIONAL { nusa:${name} rdfs:label ?label . }
        OPTIONAL { nusa:${name} rdfs:comment ?comment . }
        OPTIONAL { nusa:${name} rdfs:subClassOf ?parent .
                   ?parent a owl:Class . }
      }
      LIMIT 1
    `);

    if (classBindings.length === 0) {
      throw new Error(`Class ${name} not found`);
    }

    const b = classBindings[0];

    // Get subclasses
    const subClassBindings = await sparql.query(`
      SELECT ?sub ?subLabel
      WHERE {
        ?sub rdfs:subClassOf nusa:${name} ;
             a owl:Class .
        OPTIONAL { ?sub rdfs:label ?subLabel . }
        FILTER(STRSTARTS(STR(?sub), "http://nusarasa.id/ontology#"))
      }
    `);

    // Get instance count
    const countBindings = await sparql.query(`
      SELECT (COUNT(?instance) as ?count)
      WHERE {
        ?instance a nusa:${name} .
      }
    `);

    return {
      id: name,
      label: sparql.val(b, 'label'),
      description: sparql.val(b, 'comment'),
      parent: sparql.val(b, 'parent') ? sparql.localName(sparql.val(b, 'parent')) : null,
      subClasses: subClassBindings.map(sb => ({
        id: sparql.localName(sparql.val(sb, 'sub')),
        label: sparql.val(sb, 'subLabel')
      })),
      instanceCount: parseInt(sparql.val(countBindings[0], 'count')) || 0
    };
  } catch (error) {
    throw new Error(`Failed to get class details: ${error.message}`);
  }
};

/**
 * Get details for a specific property.
 */
exports.getPropertyDetails = async (name) => {
  try {
    const bindings = await sparql.query(`
      SELECT ?label ?comment ?domain ?range ?type
      WHERE {
        nusa:${name} a ?type .
        VALUES ?type { owl:ObjectProperty owl:DatatypeProperty }
        OPTIONAL { nusa:${name} rdfs:label ?label . }
        OPTIONAL { nusa:${name} rdfs:comment ?comment . }
        OPTIONAL { nusa:${name} rdfs:domain ?domain . }
        OPTIONAL { nusa:${name} rdfs:range ?range . }
      }
      LIMIT 1
    `);

    if (bindings.length === 0) {
      throw new Error(`Property ${name} not found`);
    }

    const b = bindings[0];
    return {
      id: name,
      label: sparql.val(b, 'label'),
      description: sparql.val(b, 'comment'),
      domain: sparql.val(b, 'domain') ? sparql.localName(sparql.val(b, 'domain')) : null,
      range: sparql.val(b, 'range') ? sparql.localName(sparql.val(b, 'range')) : null,
      type: sparql.localName(sparql.val(b, 'type'))
    };
  } catch (error) {
    throw new Error(`Failed to get property details: ${error.message}`);
  }
};
