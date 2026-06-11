# 🔧 Apache Jena Fuseki Setup Guide

## Instalasi Fuseki 4.x

### Windows Installation

#### 1. Download Fuseki
```bash
# Go to https://jena.apache.org/download/
# Download: apache-jena-fuseki-4.x.x.zip (latest)
# Extract ke folder pilihan, misal: C:\apache-jena-fuseki
```

#### 2. Setup Environment
```powershell
# Buka PowerShell sebagai Administrator

# Set folder Fuseki
$FUSEKI_HOME = "C:\apache-jena-fuseki"

# Add ke PATH (optional, untuk menjalankan dari mana saja)
[Environment]::SetEnvironmentVariable("FUSEKI_HOME", $FUSEKI_HOME, "Machine")
```

#### 3. Cek Instalasi
```bash
cd C:\apache-jena-fuseki
# Test fuseki berjalan dengan default config
java -Xmx1024m -jar fuseki-server.jar --help
```

### Linux/Mac Installation

```bash
# Download dan extract
wget https://dlcdn.apache.org/jena/binaries/apache-jena-fuseki-4.x.x.tar.gz
tar -xzf apache-jena-fuseki-4.x.x.tar.gz
cd apache-jena-fuseki

# Jalankan
./fuseki-server
```

## Konfigurasi Dataset

### Method 1: UI Web Interface (Recommended untuk development)

1. **Jalankan Fuseki**
```powershell
cd C:\apache-jena-fuseki
java -Xmx1024m -jar fuseki-server.jar
```

2. **Buka di Browser**
```
http://localhost:3030
```

3. **Buat Dataset Baru**
   - Click "New Dataset"
   - Dataset name: `nusarasa`
   - Dataset type: Persistent (TDB2)
   - Click "Create"

4. **Upload Files**
   - Ke tab "Upload"
   - Upload `nusarasa_ontology.ttl`
   - Upload `nusarasa_data.ttl`
   - Select dataset: `nusarasa`
   - Click "Upload Now"

### Method 2: Configuration File

Buat file `nusarasa-config.ttl`:

```turtle
@prefix :        <http://base/#> .
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix tdb:     <http://jena.hpl.hp.com/2008/tdb#> .
@prefix fuseki:  <http://jena.apache.org/fuseki#> .

:service_tdb2  a fuseki:Service ;
    fuseki:name                       "nusarasa" ;
    fuseki:serviceQuery               "sparql" ;
    fuseki:serviceQuery               "query" ;
    fuseki:serviceUpdate              "update" ;
    fuseki:serviceUpload              "upload" ;
    fuseki:serviceReadGraphStore      "get" ;
    fuseki:serviceReadWriteGraphStore "data" ;
    fuseki:dataset                    :dataset_tdb2 .

:dataset_tdb2  a tdb:DatasetTDB2 ;
    tdb:location "databases/nusarasa" .
```

Jalankan Fuseki dengan config:
```bash
java -Xmx1024m -jar fuseki-server.jar --config=nusarasa-config.ttl
```

## Testing SPARQL Endpoint

### 1. Test Koneksi
```bash
# GET request untuk cek endpoint
curl http://localhost:3030/nusarasa/sparql

# Expected: 200 OK
```

### 2. Test Query Sederhana
```sparql
SELECT (COUNT(?s) as ?count)
WHERE {
  ?s ?p ?o .
}
```

Hasil yang diharapkan: count = ~1487 (total triples dari data)

### 3. Test dengan Query Builder

Buka: `http://localhost:3030/dataset.html?tab=query&ds=/nusarasa`

Coba query:
```sparql
PREFIX nusa: <http://nusarasa.id/ontology#>

SELECT ?dish ?name
WHERE {
  ?dish a nusa:Dish ;
        nusa:nama ?name .
}
LIMIT 10
```

## Troubleshooting

### Port 3030 Already in Use
```powershell
# Find process using port 3030
netstat -ano | findstr :3030

# Kill process (PID = hasil dari command di atas)
taskkill /PID <PID> /F

# Atau ganti port saat menjalankan Fuseki
java -Xmx1024m -jar fuseki-server.jar --port 3001
```

### Dataset Not Found
1. Pastikan dataset "nusarasa" sudah dibuat
2. Check logs di server console
3. Coba buat dataset baru melalui UI

### Out of Memory
```bash
# Increase JVM memory
java -Xmx2048m -jar fuseki-server.jar
```

### Slow Queries
1. Check query execution plan dengan EXPLAIN
2. Add indexes jika diperlukan
3. Optimize query dengan FILTER sebelum JOIN

## Next: Loading Data

Setelah Fuseki running, lanjut ke task berikutnya:

1. **Upload ontology & data files**
   ```
   http://localhost:3030/dataset.html?tab=upload&ds=/nusarasa
   ```

2. **Verify data dengan COUNT query**
   ```sparql
   SELECT (COUNT(DISTINCT ?dish) as ?num_dishes)
   WHERE {
     ?dish a <http://nusarasa.id/ontology#Dish> .
   }
   ```
   Expected: 120 dishes

3. **Test SPARQL endpoint**
   ```
   curl -X POST http://localhost:3030/nusarasa/sparql \
     -d "query=SELECT * WHERE { ?s ?p ?o } LIMIT 1" \
     -H "Accept: application/sparql-results+json"
   ```

---

**Resource**:
- Fuseki Docs: https://jena.apache.org/documentation/fuseki2/
- SPARQL Query: https://www.w3.org/TR/sparql11-query/
