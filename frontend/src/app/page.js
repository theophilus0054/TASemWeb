'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import FoodCard from '@/components/FoodCard/FoodCard';

/**
 * Homepage — Google-style minimal search page.
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function HomePage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/data/search/query?query=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error('Pencarian gagal');
      const data = await res.json();
      setFoods(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="page-wrapper">

      {/* ── Hero ── */}
      <div className={`hero animate-fade-up ${hasSearched ? 'hero--compact' : ''}`}>

        {/* Logo */}
        <h1 className={`text-gradient logo ${hasSearched ? 'logo--small' : 'logo--large'}`}>
          NusaRasa
        </h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="search-form animate-fade-up-delay-1">
          <div className="search-pill search-pill-inner">
            <svg
              className="search-icon"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="search-input"
              type="text"
              placeholder="Cari hidangan Nusantara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              aria-label="Cari hidangan"
              className="search-input"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setHasSearched(false); setFoods([]); }}
                aria-label="Hapus"
                className="search-clear"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            id="search-button"
            className="search-submit"
          >
            Cari
          </button>
        </form>

        {/* Tagline */}
        {!hasSearched && (
          <p className="tagline animate-fade-up-delay-2">
            Sistem rekomendasi kuliner Indonesia berbasis{' '}
            <strong>Semantic Web</strong>.
            <br />
            Cari makanan berdasarkan daerah, bahan, budaya, dan konteks penyajian
            menggunakan bahasa alami.
          </p>
        )}

        {/* Browse link */}
        {!hasSearched && (
          <Link href="/food" className="browse-link animate-fade-up-delay-3">
            Lihat Semua Hidangan →
          </Link>
        )}
      </div>

      {/* ── Results ── */}
      {hasSearched && (
        <div className="results-container animate-fade-up">
          {loading ? (
            <div className="state-center">
              <div className="spinner" />
              <p>Mencari hidangan...</p>
            </div>
          ) : error ? (
            <div className="state-center">
              <p className="error-text">❌ {error}</p>
              <p className="error-hint">Pastikan backend berjalan di localhost:5000</p>
            </div>
          ) : foods.length === 0 ? (
            <div className="state-center">
              <span className="empty-icon">🔍</span>
              <p>Tidak ada hidangan ditemukan untuk &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <>
              <p className="results-count">{foods.length} hidangan ditemukan</p>
              <div className="results-list">
                {foods.map((food) => <FoodCard key={food.id} food={food} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
