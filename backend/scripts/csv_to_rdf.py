#!/usr/bin/env python3
"""
csv_to_rdf.py

Script untuk konversi dataset CSV kuliner Indonesia ke RDF/Turtle format.
Menggunakan RDFLib untuk membuat semantic web instance dari ontologi NusaRasa.

Requirements:
    - rdflib (pip install rdflib)
    - pandas (pip install pandas)

Usage:
    python csv_to_rdf.py --input dataset_kuliner_indonesia.csv --output nusarasa_data.ttl
"""

import os
import sys
import csv
import argparse
import logging
from datetime import datetime
from pathlib import Path
from collections import defaultdict
from urllib.parse import quote

# Import RDFLib
try:
    from rdflib import Graph, Namespace, RDF, RDFS, Literal, URIRef
    from rdflib.namespace import XSD
except ImportError:
    print("ERROR: RDFLib tidak ditemukan. Install dengan: pip install rdflib")
    sys.exit(1)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define namespaces
NUSA = Namespace("http://nusarasa.id/ontology#")
OWL = Namespace("http://www.w3.org/2002/07/owl#")

class CSVToRDFConverter:
    """Konverter CSV ke RDF untuk kuliner Nusantara"""
    
    def __init__(self):
        """Inisialisasi RDF graph dan namespaces"""
        self.graph = Graph()
        self.graph.bind("nusa", NUSA)
        self.graph.bind("rdf", RDF)
        self.graph.bind("rdfs", RDFS)
        self.graph.bind("xsd", XSD)
        self.graph.bind("owl", OWL)
        
        # Data structures untuk menyimpan instances
        self.regions = {}
        self.ingredients = {}
        self.cultures = {}
        self.cooking_methods = {}
        self.spice_levels = {}
        self.diet_categories = {}
        
    def sanitize_uri(self, text):
        """Sanitize text untuk digunakan sebagai bagian dari URI"""
        # Replace spaces dan special characters
        text = text.strip()
        text = text.replace(" ", "_")
        text = text.replace("/", "_")
        text = text.replace("-", "_")
        text = text.replace("(", "")
        text = text.replace(")", "")
        text = text.replace(",", "")
        text = quote(text, safe='_')
        return text
    
    def get_or_create_region(self, nama, provinsi, pulau):
        """Buat atau dapatkan instance Region"""
        key = self.sanitize_uri(nama)
        
        if key not in self.regions:
            region_uri = NUSA[f"Region_{key}"]
            self.graph.add((region_uri, RDF.type, NUSA.Region))
            self.graph.add((region_uri, NUSA.nama, Literal(nama, lang="id")))
            
            if provinsi:
                self.graph.add((region_uri, NUSA.provinsi, Literal(provinsi, lang="id")))
            if pulau:
                self.graph.add((region_uri, NUSA.pulau, Literal(pulau, lang="id")))
            
            self.regions[key] = region_uri
            logger.debug(f"Created Region: {nama}")
        
        return self.regions[key]
    
    def get_or_create_ingredient(self, nama):
        """Buat atau dapatkan instance Ingredient"""
        key = self.sanitize_uri(nama)
        
        if key not in self.ingredients:
            ingredient_uri = NUSA[f"Ingredient_{key}"]
            self.graph.add((ingredient_uri, RDF.type, NUSA.Ingredient))
            self.graph.add((ingredient_uri, NUSA.nama, Literal(nama, lang="id")))
            
            self.ingredients[key] = ingredient_uri
            logger.debug(f"Created Ingredient: {nama}")
        
        return self.ingredients[key]
    
    def get_or_create_culture(self, nama):
        """Buat atau dapatkan instance Culture"""
        key = self.sanitize_uri(nama)
        
        if key not in self.cultures:
            culture_uri = NUSA[f"Culture_{key}"]
            self.graph.add((culture_uri, RDF.type, NUSA.Culture))
            self.graph.add((culture_uri, NUSA.nama, Literal(nama, lang="id")))
            
            self.cultures[key] = culture_uri
            logger.debug(f"Created Culture: {nama}")
        
        return self.cultures[key]
    
    def map_dish_type(self, bahan_utama, kategori_diet):
        """Determine tipe hidangan berdasarkan bahan dan kategori"""
        # Simplified logic - dapat diperluas
        if "minuman" in bahan_utama.lower() or "es" in bahan_utama.lower():
            return NUSA.Beverage
        elif "kue" in bahan_utama.lower() or "tepung" in bahan_utama.lower():
            return NUSA.Snack
        else:
            return NUSA.MainDish
    
    def determine_culture(self, daerah, provinsi):
        """Determine budaya berdasarkan daerah/provinsi"""
        daerah_lower = daerah.lower()
        provinsi_lower = provinsi.lower()
        
        # Mapping sederhana daerah ke budaya
        culture_mapping = {
            "padang": "Minangkabau",
            "sumatera barat": "Minangkabau",
            "jakarta": "Betawi",
            "jawa": "Jawa",
            "jawa tengah": "Jawa",
            "jawa timur": "Jawa",
            "jawa barat": "Jawa",
            "banjarmasin": "Banjar",
            "kalimantan": "Dayak",
            "sulawesi": "Makassar",
            "medan": "Batak",
            "sumatera utara": "Batak",
            "padang": "Minang",
            "bengkulu": "Bengkulu",
            "lampung": "Lampung",
            "riau": "Melayu",
            "palembang": "Palembang",
        }
        
        for key, value in culture_mapping.items():
            if key in daerah_lower or key in provinsi_lower:
                return value
        
        return "Indonesia"
    
    def process_csv(self, csv_file):
        """Process CSV file dan convert ke RDF instances"""
        logger.info(f"Processing CSV file: {csv_file}")
        
        dish_count = 0
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for idx, row in enumerate(reader, 1):
                    try:
                        # Extract data dari CSV
                        nama_hidangan = row.get('nama', '').strip()
                        daerah = row.get('daerah', '').strip()
                        provinsi = row.get('provinsi', '').strip()
                        pulau = row.get('pulau', '').strip()
                        bahan_utama = row.get('bahan_utama', '').strip()
                        metode_memasak = row.get('metode_memasak', '').strip()
                        tingkat_kepedasan = row.get('tingkat_kepedasan', '').strip()
                        kategori_diet = row.get('kategori_diet', '').strip()
                        deskripsi = row.get('deskripsi', '').strip()
                        
                        if not nama_hidangan:
                            logger.warning(f"Row {idx}: Nama hidangan kosong, skip")
                            continue
                        
                        # Create Dish instance
                        dish_uri = NUSA[f"Dish_{self.sanitize_uri(nama_hidangan)}"]
                        
                        # Determine dish type
                        dish_type = self.map_dish_type(bahan_utama, kategori_diet)
                        self.graph.add((dish_uri, RDF.type, dish_type))
                        
                        # Add data properties
                        self.graph.add((dish_uri, NUSA.nama, Literal(nama_hidangan, lang="id")))
                        
                        if deskripsi:
                            self.graph.add((dish_uri, NUSA.deskripsi, Literal(deskripsi, lang="id")))
                        
                        if metode_memasak:
                            self.graph.add((dish_uri, NUSA.metode_memasak, Literal(metode_memasak, lang="id")))
                        
                        if tingkat_kepedasan:
                            self.graph.add((dish_uri, NUSA.tingkat_kepedasan, Literal(tingkat_kepedasan, lang="id")))
                        
                        if kategori_diet:
                            self.graph.add((dish_uri, NUSA.kategori_diet, Literal(kategori_diet, lang="id")))
                        
                        # Handle Region
                        if daerah:
                            region_uri = self.get_or_create_region(daerah, provinsi, pulau)
                            self.graph.add((dish_uri, NUSA.berasal_dari, region_uri))
                        
                        # Handle Ingredients
                        if bahan_utama:
                            bahan_list = [b.strip() for b in bahan_utama.split('/')]
                            for bahan in bahan_list:
                                if bahan:
                                    ingredient_uri = self.get_or_create_ingredient(bahan)
                                    self.graph.add((dish_uri, NUSA.mengandung, ingredient_uri))
                        
                        # Handle Culture
                        culture_name = self.determine_culture(daerah, provinsi)
                        if culture_name:
                            culture_uri = self.get_or_create_culture(culture_name)
                            self.graph.add((dish_uri, NUSA.terkait_budaya, culture_uri))
                        
                        dish_count += 1
                        logger.debug(f"Row {idx}: Created Dish '{nama_hidangan}'")
                        
                    except Exception as e:
                        logger.error(f"Error processing row {idx}: {str(e)}")
                        continue
            
            logger.info(f"Successfully processed {dish_count} dishes from CSV")
            return dish_count
            
        except FileNotFoundError:
            logger.error(f"CSV file not found: {csv_file}")
            raise
        except Exception as e:
            logger.error(f"Error reading CSV: {str(e)}")
            raise
    
    def save_rdf(self, output_file):
        """Save RDF graph ke Turtle format"""
        logger.info(f"Saving RDF to: {output_file}")
        
        try:
            # Tambah ontologi metadata
            ontology_uri = URIRef("http://nusarasa.id/ontology/data")
            self.graph.add((ontology_uri, RDF.type, OWL.Ontology))
            self.graph.add((ontology_uri, RDFS.label, Literal("NusaRasa Kuliner Dataset", lang="id")))
            self.graph.add((ontology_uri, RDFS.comment, Literal("Instance data untuk ontologi NusaRasa", lang="id")))
            
            # Add timestamp
            now = datetime.now().isoformat()
            self.graph.add((ontology_uri, RDFS.comment, Literal(f"Generated: {now}", lang="en")))
            
            # Serialize ke Turtle
            self.graph.serialize(destination=output_file, format='turtle')
            
            logger.info(f"RDF file saved successfully: {output_file}")
            
            # Print statistics
            num_triples = len(self.graph)
            logger.info(f"Total triples: {num_triples}")
            logger.info(f"Regions: {len(self.regions)}")
            logger.info(f"Ingredients: {len(self.ingredients)}")
            logger.info(f"Cultures: {len(self.cultures)}")
            
        except Exception as e:
            logger.error(f"Error saving RDF: {str(e)}")
            raise
    
    def convert(self, input_csv, output_ttl):
        """Main conversion function"""
        logger.info("=" * 60)
        logger.info("CSV to RDF Converter - NusaRasa Kuliner")
        logger.info("=" * 60)
        
        # Process CSV
        self.process_csv(input_csv)
        
        # Save RDF
        self.save_rdf(output_ttl)
        
        logger.info("=" * 60)
        logger.info("Conversion completed successfully!")
        logger.info("=" * 60)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Convert CSV dataset kuliner to RDF/Turtle format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python csv_to_rdf.py --input data.csv --output output.ttl
  python csv_to_rdf.py -i dataset_kuliner_indonesia.csv -o nusarasa_data.ttl
        """
    )
    
    parser.add_argument(
        '-i', '--input',
        required=True,
        help='Input CSV file path'
    )
    parser.add_argument(
        '-o', '--output',
        required=True,
        help='Output Turtle (.ttl) file path'
    )
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Set log level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Validate input file
    if not os.path.exists(args.input):
        logger.error(f"Input file not found: {args.input}")
        sys.exit(1)
    
    try:
        converter = CSVToRDFConverter()
        converter.convert(args.input, args.output)
        sys.exit(0)
    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
