# NusaRasa — Sistem Rekomendasi Kuliner Indonesia Berbasis Semantic Web

> Temukan kekayaan kuliner Nusantara melalui pencarian semantik bahasa alami — didukung Knowledge Graph RDF/OWL dan pipeline NL2SPARQL berbasis LLM.

---

## Tentang Proyek

**NusaRasa** adalah sistem rekomendasi kuliner lokal Indonesia yang dibangun di atas fondasi teknologi *Semantic Web*. Alih-alih mengandalkan pencarian kata kunci sederhana, NusaRasa memahami **relasi kontekstual** antara hidangan, bahan, daerah asal, budaya, dan momen penyajian — memungkinkan pertanyaan seperti:

> *"Makanan khas Jawa yang mengandung santan dan cocok disajikan saat Lebaran"*

dapat dijawab secara tepat dan bermakna.

Indonesia memiliki lebih dari **5.350 jenis hidangan tradisional** yang tersebar di 38 provinsi. NusaRasa hadir sebagai upaya pelestarian dan promosi warisan kuliner Nusantara secara digital, dengan merepresentasikan pengetahuan kuliner dalam format yang dapat dipahami mesin (*machine-readable*).

---

## Fitur Utama

- **Pencarian Bahasa Alami** — Ketik pertanyaan seperti berbicara biasa; LLM akan menerjemahkannya menjadi SPARQL query secara otomatis.
- **Knowledge Graph Interaktif** — Visualisasi subgraf yang menampilkan relasi semantik antar entitas kuliner.
- **Kartu Rekomendasi Hidangan** — Tampilkan informasi lengkap: daerah asal, bahan, budaya, konteks penyajian, dan tingkat kepedasan.
- **Transparansi Query** — SPARQL query yang dihasilkan ditampilkan secara eksplisit untuk keperluan edukasi dan debugging.
- **Ontologi Terstruktur** — Dibangun dengan OWL 2 menggunakan Protégé, divalidasi oleh HermiT Reasoner.

---

## Arsitektur Sistem

```
Pengguna (Bahasa Alami)
        │
        ▼
┌──────────────────┐
│   Web Frontend   │  HTML / CSS / JavaScript
│  (Antarmuka Web) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Python Flask    │  Backend & NL2SPARQL Pipeline
│    Backend       │◄──── LLM API (Claude / GPT-4)
└────────┬─────────┘      + Few-shot Prompting + RAG
         │
         ▼
┌──────────────────┐
│  Apache Jena     │  SPARQL 1.1 Endpoint
│    Fuseki        │  Dataset: nusarasa
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Knowledge Graph │  RDF Turtle (.ttl)
│  NusaRasa Onto.  │  OWL 2 — NusaRasa Ontology
└──────────────────┘
```

---

## Ontologi NusaRasa

Ontologi dirancang di **Protégé 5.x** dengan komponen berikut:

### Kelas Utama

| Kelas | Deskripsi |
|---|---|
| `nusa:Dish` | Representasi hidangan dengan metadata lengkap |
| `nusa:Region` | Wilayah geografis asal hidangan (dengan koordinat geo) |
| `nusa:Ingredient` | Bahan penyusun hidangan (wajib / opsional) |
| `nusa:Culture` | Kelompok budaya atau suku yang berafiliasi |
| `nusa:Event` | Peristiwa / konteks sosial penyajian hidangan |

### Object Properties

| Property | Relasi |
|---|---|
| `berasal_dari` | Dish → Region |
| `mengandung` | Dish → Ingredient |
| `terkait_budaya` | Dish → Culture |
| `disajikan_pada` | Dish → Event |
| `memiliki_varian` | Dish → Dish |
| `berkaitan_dengan` | Dish → Dish / Event |

### Data Properties

`nama` · `deskripsi` · `metode_memasak` · `tingkat_kepedasan` · `kategori_diet`

---

## 🛠️ Teknologi

| Komponen | Teknologi |
|---|---|
| Ontologi | Protégé 5.x (OWL 2) |
| RDF / Triple Store | RDFLib (Python) / Apache Jena Fuseki |
| SPARQL Endpoint | Apache Jena Fuseki — SPARQL 1.1 |
| LLM / NL2SPARQL | Claude API / GPT-4 API (few-shot + RAG) |
| Web Backend | Python Flask |
| Web Frontend | HTML / CSS / JavaScript |
| Dataset | CSV → RDF Turtle (`.ttl`) |
| Validasi Ontologi | HermiT Reasoner (via Protégé) |

---

## Cara Menjalankan

### Prasyarat

- Python 3.10+
- Java Runtime Environment (untuk Apache Jena Fuseki)
- Protégé 5.x (untuk pengeditan ontologi)

### Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/<username>/nusarasa.git
cd nusarasa

# 2. Buat virtual environment dan install dependensi
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Jalankan Apache Jena Fuseki
cd fuseki
./fuseki-server --update --mem /nusarasa

# 4. Load dataset RDF ke Fuseki
# Akses http://localhost:3030 dan upload file data/nusarasa.ttl

# 5. Set API key LLM
export LLM_API_KEY="your-api-key-here"

# 6. Jalankan Flask backend
python app.py
```

Aplikasi berjalan di `http://localhost:5000`

---

## Struktur Direktori

```
nusarasa/
├── ontology/
│   ├── nusarasa.owl          # File ontologi OWL 2
│   └── nusarasa.ttl          # Knowledge Graph (RDF Turtle)
├── data/
│   └── kuliner_dataset.csv   # Dataset sumber
├── scripts/
│   ├── csv_to_rdf.py         # Konversi CSV → RDF Turtle
│   └── sparql_queries.py     # Contoh SPARQL queries
├── nl2sparql/
│   ├── pipeline.py           # Modul NL2SPARQL
│   └── few_shot_examples.json# Contoh pasangan (NL → SPARQL)
├── app/
│   ├── app.py                # Flask backend
│   ├── templates/            # HTML templates
│   └── static/               # CSS / JS
├── requirements.txt
└── README.md
```

---

## Target & Cakupan Dataset

| Metrik | Target |
|---|---|
| Jumlah hidangan | ≥ 87 hidangan |
| Jumlah bahan | ≥ 214 bahan |
| Total triplet RDF | ≥ 1.200 triplet |
| Akurasi NL2SPARQL | ≥ 85% pada query benchmark |

---

## Tim Pengembang

| Nama | NIM | Peran |
|---|---|---|
| Francisco Gilbert Sondakh | 140810230004 | Project Manager |
| Achmad Dzaki Azhari | 140810230034 | Front-End Developer |
| Theophilus Samuel Ghozali | 140810230054 | Back-End Developer |

**Universitas Padjadjaran — Fakultas MIPA**
Program Studi S-1 Teknik Informatika · Semester Genap 2025/2026

---

## Referensi

- Antoniou, G., & Van Harmelen, F. (2004). *A Semantic Web Primer*. MIT Press.
- Berners-Lee, T., Hendler, J., & Lassila, O. (2001). The Semantic Web. *Scientific American*, 284(5), 34–43.
- Hitzler, P. (2021). A Review of the Semantic Web Field. *Communications of the ACM*, 64(2), 76–83.
- [Apache Jena Fuseki Documentation](https://jena.apache.org/documentation/fuseki2/)
- [RDFLib Documentation](https://rdflib.readthedocs.io/)

---

