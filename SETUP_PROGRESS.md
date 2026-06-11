# 📚 NusaRasa Semantic Web - Setup Progress

## ✅ Completed Tasks

### 1. CSV Dataset Preparation
- **Status**: ✅ Complete
- **File**: `backend/data/dataset_kuliner_indonesia.csv`
- **Records**: 120 hidangan kuliner Indonesia
- **Columns**: nama, daerah, provinsi, pulau, bahan_utama, metode_memasak, tingkat_kepedasan, kategori_diet, deskripsi

### 2. Ontology Creation
- **Status**: ✅ Complete
- **File**: `backend/ontology/nusarasa_ontology.ttl`
- **5 Main Classes**:
  - `nusa:Dish` (Hidangan)
  - `nusa:Region` (Daerah)
  - `nusa:Ingredient` (Bahan)
  - `nusa:Culture` (Budaya)
  - `nusa:Event` (Acara)

- **Subclasses of Dish**:
  - `nusa:MainDish` (Makanan Utama)
  - `nusa:Snack` (Camilan)
  - `nusa:Beverage` (Minuman)

- **Object Properties**:
  - `berasal_dari` (Dish → Region)
  - `mengandung` (Dish → Ingredient)
  - `terkait_budaya` (Dish → Culture)
  - `disajikan_pada` (Dish → Event)
  - `memiliki_varian` (Dish → Dish)
  - `berkaitan_dengan` (Dish → Dish)

- **Data Properties**:
  - `nama`, `deskripsi`, `metode_memasak`, `tingkat_kepedasan`, `kategori_diet`
  - All with rdfs:label and rdfs:comment in Indonesian

### 3. CSV to RDF Conversion
- **Status**: ✅ Complete
- **Tool**: `backend/scripts/csv_to_rdf.py`
- **Generated File**: `backend/data/nusarasa_data.ttl`
- **Conversion Results**:
  - 120 Dish instances created
  - 50 Region instances extracted
  - 71 Ingredient instances extracted
  - 12 Culture instances inferred
  - **Total RDF Triples: 1,487**

## 📋 Next Steps (Recommended Order)

### Phase 1: Data Validation & RDF Quality Assurance
**Timeline**: Day 1-2

1. **Verify CSV Data Quality**
   - ✅ Check for duplicates
   - ✅ Verify column completeness
   - ✅ Spell-check dish names and ingredients
   - Task: Review `dataset_kuliner_indonesia.csv` with team

2. **Validate Generated RDF**
   - Install Apache Jena CLI tools for validation
   - Run RDF validation to ensure Turtle syntax correctness
   - Check ontology consistency

### Phase 2: Semantic Web Infrastructure Setup
**Timeline**: Day 2-3

3. **Install & Setup Apache Jena Fuseki 4.x**
   - Download Fuseki from: https://jena.apache.org/download/index.html
   - Extract to appropriate location
   - Configure for port 3000

4. **Create Fuseki Dataset**
   - Create dataset named "nusarasa"
   - Load `nusarasa_ontology.ttl`
   - Load `nusarasa_data.ttl`
   - Test SPARQL endpoint: `GET /nusarasa/sparql`

### Phase 3: SPARQL Query Development
**Timeline**: Day 3-4

5. **Write 15 SPARQL Queries** (skenario pencarian):
   - Queries by region, ingredient, culture, event, spice level
   - Use FILTER, OPTIONAL, BIND for complex filtering
   - Include inferencing queries (transitivity, implicit classification)
   - Save to `backend/queries/nusarasa_queries.sparql`

### Phase 4: NL-to-SPARQL Pipeline
**Timeline**: Day 4-5

6. **Create NL2SPARQL Module**
   - File: `backend/services/nl2sparql.py`
   - Takes natural language input
   - Sends to LLM API with system prompt (ontology + examples)
   - Executes SPARQL on Fuseki
   - Returns results to user

7. **System Prompt Engineering**
   - Include full ontology schema as context
   - Add 15 few-shot examples (query + expected SPARQL)
   - Handle error cases gracefully

### Phase 5: Testing & Optimization
**Timeline**: Day 5-6

8. **Comprehensive Testing**
   - Test 50 benchmark queries
   - Compare NL2SPARQL accuracy vs keyword search
   - Identify edge-case queries needing prompt improvement
   - Iterative prompt refinement

## 📂 Project Structure

```
TASemWeb/
├── backend/
│   ├── data/
│   │   ├── dataset_kuliner_indonesia.csv        [120 dishes]
│   │   ├── nusarasa_data.ttl                   [1,487 triples]
│   │   └── ...
│   ├── ontology/
│   │   └── nusarasa_ontology.ttl              [ontology definitions]
│   ├── scripts/
│   │   └── csv_to_rdf.py                      [conversion tool]
│   ├── services/
│   │   └── nl2sparql.py                       [next: to be created]
│   ├── queries/
│   │   └── nusarasa_queries.sparql            [next: SPARQL queries]
│   ├── server.js                              [Express.js API]
│   ├── package.json
│   └── ...
├── frontend/
└── README.md
```

## 🚀 How to Run Scripts

### CSV to RDF Conversion (Already Done)
```bash
cd backend
python scripts/csv_to_rdf.py -i data/dataset_kuliner_indonesia.csv -o data/nusarasa_data.ttl
```

### Validate RDF (Next Step)
```bash
# After installing Apache Jena:
riot --check data/nusarasa_data.ttl
riot --check ontology/nusarasa_ontology.ttl
```

### NL2SPARQL Usage (Future)
```bash
python services/nl2sparql.py --query "Makanan apa saja dari Jawa Tengah?"
```

## 📊 Statistics

| Component | Count |
|-----------|-------|
| Dataset Records | 120 |
| Region Instances | 50 |
| Ingredient Instances | 71 |
| Culture Instances | 12 |
| RDF Triples | 1,487 |
| Ontology Classes | 8 |
| Object Properties | 6 |
| Data Properties | 5 |

## 🔗 Resources

- **Apache Jena**: https://jena.apache.org/
- **SPARQL Spec**: https://www.w3.org/TR/sparql11-query/
- **RDFLib Docs**: https://rdflib.readthedocs.io/
- **Protégé**: https://protege.stanford.edu/

## 👥 Team Tasks Distribution

- **CSV Verification**: Data owner/Dzaki
- **Ontology Review**: Dzaki + Semantic Web Lead
- **Fuseki Setup**: DevOps/Backend Lead
- **SPARQL Queries**: Senior Backend + QA
- **NL2SPARQL + LLM**: ML/Backend Lead

---

**Last Updated**: 2026-06-01  
**Next Milestone**: Fuseki Setup & SPARQL Validation
