# TASemWeb Backend API

Express.js backend untuk semantic web dengan support RDF dan ontology.

## 📁 Struktur Project

```
backend/
├── controllers/          # Business logic untuk setiap endpoint
│   ├── ontologyController.js
│   ├── dataController.js
│   └── queryController.js
├── routes/              # API route definitions
│   ├── ontology.js
│   ├── data.js
│   └── query.js
├── services/            # Service layer untuk data processing
│   ├── ontologyService.js
│   ├── dataService.js
│   └── queryService.js
├── data/                # CSV data files
│   └── dataset_kuliner_indonesia.csv
├── ontology/            # RDF/TTL ontology files
│   └── nusarasa_ontology.ttl
├── server.js            # Main server entry point
├── package.json         # Dependencies
├── .env                 # Environment variables
└── .gitignore          # Git ignore file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
File `.env` sudah tersedia dengan konfigurasi default:
```env
PORT=5000
NODE_ENV=development
ONTOLOGY_PATH=./ontology/nusarasa_ontology.ttl
DATA_PATH=./data/dataset_kuliner_indonesia.csv
```

### 3. Run Server
Development mode dengan auto-reload:
```bash
npm run dev
```

Atau production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📚 API Endpoints

### Health Check
```
GET /api/health
```
Response:
```json
{
  "status": "OK",
  "message": "TASemWeb Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Ontology API (`/api/ontology`)
- `GET /api/ontology/info` - Informasi ontology
- `GET /api/ontology/classes` - Daftar semua class
- `GET /api/ontology/properties` - Daftar semua property
- `GET /api/ontology/classes/:name` - Detail class tertentu
- `GET /api/ontology/properties/:name` - Detail property tertentu

### Data API (`/api/data`)
- `GET /api/data` - Ambil semua data (dengan pagination)
  - Query params: `page=1&limit=20`
- `GET /api/data/:id` - Ambil data by ID
- `GET /api/data/search/query?query=keyword` - Search data
- `GET /api/data/stats/overview` - Statistik data

### Query API (`/api/query`)
- `POST /api/query/sparql` - Execute SPARQL query
  - Body: `{ "query": "SELECT ..." }`
- `POST /api/query/semantic-search` - Semantic search
  - Body: `{ "keyword": "...", "ontologyClass": "..." }`
- `GET /api/query/related/:resource` - Get related resources

## 📦 Dependencies

- **express** - Web framework
- **cors** - CORS middleware
- **dotenv** - Environment variable management
- **csv-parser** - CSV file parsing
- **express-validator** - Input validation
- **helmet** - Security headers
- **morgan** - HTTP logging
- **rdflib** - RDF/Semantic web (siap untuk integration)
- **axios** - HTTP client

## 🔧 Development

### Nodemon untuk auto-reload
```bash
npm run dev
```

### Mengakses API
Gunakan tools seperti Postman, Thunder Client, atau curl:
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Get ontology info
curl http://localhost:5000/api/ontology/info

# Get semua data
curl http://localhost:5000/api/data?page=1&limit=10
```

## 📝 Customization

### Menambah Route Baru
1. Buat function baru di `controllers/`
2. Buat service di `services/` jika perlu
3. Daftarkan route di file yang sesuai di `routes/`
4. Import route di `server.js`

### Mengintegrasikan SPARQL
Untuk menggunakan SPARQL endpoint yang sebenarnya, gunakan library seperti:
- `sparql-http-client`
- `rdf-store`
- Atau connect ke endpoint eksternal

## 🔐 Security

Backend sudah dilengkapi dengan:
- CORS protection
- Helmet untuk security headers
- Input validation ready (express-validator)
- Error handling middleware

## 📖 Next Steps

1. **Integrasikan SPARQL**: Setup SPARQL endpoint untuk query semantic web yang lebih advanced
2. **RDF Parsing**: Parse TTL/RDF files untuk extract classes dan properties
3. **Database**: Tambahkan database (MongoDB/PostgreSQL) untuk persistent storage
4. **Authentication**: Setup JWT/OAuth untuk API security
5. **Frontend Connection**: Connect dengan frontend untuk data visualization

## 🐛 Troubleshooting

**Port sudah digunakan?**
```bash
# Change PORT in .env
PORT=3001
```

**CSV tidak ditemukan?**
```bash
# Check DATA_PATH in .env
# Pastikan file ada di path yang benar
```

**Module tidak ditemukan?**
```bash
# Reinstall dependencies
npm install
```

---

Happy coding! 🎉
