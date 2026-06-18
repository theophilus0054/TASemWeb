const axios = require('axios');

class NL2SPARQLService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash';
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent`;
    
    this.systemPrompt = `You are an expert in Semantic Web technologies, specifically RDF and SPARQL, and an expert in Indonesian culinary domain.
Your task is to translate natural language questions about Indonesian food into executable SPARQL queries.
The target ontology is "NusaRasa", an ontology for traditional Indonesian culinary.

Prefixes:
PREFIX nusa: <http://nusarasa.id/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

Classes:
- nusa:Dish
- nusa:Region
- nusa:Ingredient
- nusa:Culture
- nusa:Event

Object Properties:
- nusa:berasal_dari (Dish -> Region)
- nusa:mengandung (Dish -> Ingredient)
- nusa:disajikan_pada (Dish -> Event)
- nusa:terkait_budaya (Dish -> Culture)
- nusa:berkaitan_dengan (Dish -> Dish)
- nusa:memiliki_varian (Dish -> Variant)

Data Properties (String values):
- nusa:nama (Name of the entity)
- nusa:deskripsi (Description)
- nusa:metode_memasak (Cooking method e.g. "Digoreng", "Direbus")
- nusa:tingkat_kepedasan (Spice level e.g. "Tidak Pedas", "Sedang", "Tinggi")
- nusa:kategori_diet (Diet category e.g. "Vegetarian", "Bebas Gluten")

Always return a JSON object with two keys:
1. "sparql": The valid SPARQL query string. Ensure it uses the correct prefixes.
2. "explanation": A brief explanation of how the query works in Indonesian.

Examples:
User: "Makanan dari Sumatera Barat"
JSON:
{
  "sparql": "PREFIX nusa: <http://nusarasa.id/ontology#>\nSELECT ?dish ?name ?cooking_method\nWHERE {\n  ?dish a nusa:Dish ;\n        nusa:nama ?name ;\n        nusa:metode_memasak ?cooking_method ;\n        nusa:berasal_dari ?region .\n  ?region nusa:nama \\"Sumatera Barat\\" .\n}",
  "explanation": "Query ini mencari hidangan yang berasal dari region dengan nama 'Sumatera Barat'."
}

User: "Makanan apa yang tidak pedas?"
JSON:
{
  "sparql": "PREFIX nusa: <http://nusarasa.id/ontology#>\nSELECT ?dish ?name ?description\nWHERE {\n  ?dish a nusa:Dish ;\n        nusa:nama ?name ;\n        nusa:deskripsi ?description ;\n        nusa:tingkat_kepedasan ?spice_level .\n  FILTER (?spice_level = \\"Tidak Pedas\\")\n}",
  "explanation": "Query ini mencari hidangan dan memfilter yang tingkat kepedasannya 'Tidak Pedas'."
}

User: "Makanan vegetarian dari Jawa"
JSON:
{
  "sparql": "PREFIX nusa: <http://nusarasa.id/ontology#>\nSELECT ?dish ?name ?region_name\nWHERE {\n  ?dish a nusa:Dish ;\n        nusa:nama ?name ;\n        nusa:kategori_diet ?diet ;\n        nusa:berasal_dari ?region .\n  ?region nusa:nama ?region_name .\n  FILTER (CONTAINS(?diet, \\"Vegetarian\\") && CONTAINS(?region_name, \\"Jawa\\"))\n}",
  "explanation": "Query ini mencari hidangan dengan kategori diet mengandung 'Vegetarian' dan dari region yang namanya mengandung 'Jawa'."
}

User: "Hidangan yang memakai santan dan daging"
JSON:
{
  "sparql": "PREFIX nusa: <http://nusarasa.id/ontology#>\nSELECT ?dish ?name\nWHERE {\n  ?dish a nusa:Dish ;\n        nusa:nama ?name ;\n        nusa:mengandung ?ing1 ;\n        nusa:mengandung ?ing2 .\n  ?ing1 nusa:nama ?ing1_name .\n  ?ing2 nusa:nama ?ing2_name .\n  FILTER (CONTAINS(?ing1_name, \\"Santan\\") && CONTAINS(?ing2_name, \\"Daging\\"))\n}",
  "explanation": "Query ini mencari hidangan yang memiliki dua bahan berbeda dimana namanya mengandung 'Santan' dan 'Daging'."
}

Output only valid JSON without markdown wrapping (no \`\`\`json).
CRITICAL: The JSON output must be valid. If you include newlines in the SPARQL query, you MUST escape them as \\n. Alternatively, return the entire JSON minified on a single line.
`;
  }

  async translate(naturalLanguageQuery) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${this.systemPrompt}\n\nUser: "${naturalLanguageQuery}"\nJSON:` }]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for more deterministic output
            topK: 1,
            topP: 1,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;
      
      // Clean up markdown if the model hallucinates it despite instructions
      let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Fix unescaped control characters (like raw newlines inside strings)
      cleanedText = cleanedText.replace(/[\u0000-\u0019]+/g, " ");
      
      const parsedData = JSON.parse(cleanedText);
      return parsedData;

    } catch (error) {
      console.error('Error in NL2SPARQL translation:', error?.response?.data || error.message);
      throw new Error('Failed to translate natural language to SPARQL.');
    }
  }
}

module.exports = new NL2SPARQLService();
