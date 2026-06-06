'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header/Header';
import SearchBar from '@/components/SearchBar/SearchBar';
import TagFilter from '@/components/TagFilter/TagFilter';
import FoodCard from '@/components/FoodCard/FoodCard';
import styles from './page.module.css';

/**
 * Home Page — Search & browse Indonesian dishes.
 * Composes: Header → SearchBar → TagFilter → FoodCard list
 * Data comes from Express backend → Flask SPARQL server → RDF graph
 */
export default function HomePage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Fetch all dishes on initial load
  useEffect(() => {
    fetchFoods();
  }, []);

  // Extract unique tags whenever foods change
  useEffect(() => {
    if (foods.length > 0) {
      const tagSet = new Set();
      foods.forEach((food) => {
        if (food.daerah) tagSet.add(food.daerah);
        if (food.tingkat_kepedasan) tagSet.add(food.tingkat_kepedasan);
        if (food.kategori_diet) tagSet.add(food.kategori_diet);
        if (food.tipe) tagSet.add(food.tipe);
      });
      setAllTags(Array.from(tagSet).sort());
    }
  }, [foods]);

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/data?page=1&limit=200');
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();
      setFoods(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchFoods();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data/search/query?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Pencarian gagal');
      const data = await res.json();
      setFoods(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTagToggle = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter foods by active tags (client-side since tags are metadata)
  const filteredFoods = activeTags.length === 0
    ? foods
    : foods.filter((food) =>
        activeTags.some(
          (tag) =>
            food.daerah === tag ||
            food.tingkat_kepedasan === tag ||
            food.kategori_diet === tag ||
            food.tipe === tag
        )
      );

  return (
    <div className={styles.page}>
      <Header />
      <SearchBar onSearch={handleSearch} initialValue={searchQuery} />

      {/* Results section */}
      <div className={styles.resultsSection}>
        <h2 className={styles.resultsHeading}>
          {searchQuery ? 'Hasil Pencarian:' : 'Semua Hidangan:'}
        </h2>
        {!loading && (
          <p className={styles.resultCount}>
            {filteredFoods.length} hidangan ditemukan
          </p>
        )}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <TagFilter
          tags={allTags}
          activeTags={activeTags}
          onToggle={handleTagToggle}
        />
      )}

      {/* Food cards */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Memuat hidangan...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>❌ {error}</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Pastikan backend berjalan di localhost:5000
          </p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.emptyText}>Tidak ada hidangan ditemukan</p>
          <p>Coba kata kunci atau filter lain</p>
        </div>
      ) : (
        <div className={styles.cardList}>
          {filteredFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
