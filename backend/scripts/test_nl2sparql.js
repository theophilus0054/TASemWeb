require('dotenv').config();
const nl2sparqlService = require('../services/nl2sparqlService');

async function testTranslation() {
  const prompts = [
    "Apa saja makanan dari Sumatera Barat?",
    "Rekomendasi makanan vegetarian dari Jawa yang tidak pedas",
    "Hidangan apa yang menggunakan santan dan daging sapi?"
  ];

  console.log("=== Testing NL2SPARQL Translation ===\n");
  
  for (const prompt of prompts) {
    console.log(`User Input: "${prompt}"`);
    try {
      const result = await nl2sparqlService.translate(prompt);
      console.log("Explanation:", result.explanation);
      console.log("SPARQL Query:");
      console.log(result.sparql);
      console.log("-".repeat(50));
    } catch (error) {
      console.error(`Failed on "${prompt}":`, error.message);
    }
  }
}

testTranslation();
