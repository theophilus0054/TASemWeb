'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FoodCard from '@/components/FoodCard/FoodCard';

/**
 * Browse Page — /food
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function BrowsePage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [explanation, setExplanation] = useState('');

  useEffect(() => { fetchFoods(); }, []);

  useEffect(() => {
    if (foods.length > 0) {
      const tagSet = new Set();
      foods.forEach((f) => {
        if (f.daerah)           tagSet.add(f.daerah);
        if (f.tingkat_kepedasan) tagSet.add(f.tingkat_kepedasan);
        if (f.kategori_diet)    tagSet.add(f.kategori_diet);
        if (f.tipe)             tagSet.add(f.tipe);
      });
      setAllTags(Array.from(tagSet).sort());
    }
  }, [foods]);

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/data?page=1&limit=200');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat data');
      setFoods(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) { fetchFoods(); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/query/nl2sparql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pencarian gagal');
      setFoods(data.results || []);
      if (data.explanation) setExplanation(data.explanation);
      else setExplanation('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleTagToggle = (tag) =>
    setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const filteredFoods = activeTags.length === 0
    ? foods
    : foods.filter((f) =>
        activeTags.some((tag) =>
          f.daerah === tag || f.tingkat_kepedasan === tag || f.kategori_diet === tag || f.tipe === tag
        )
      );

  return (
    <div className="browse-page">

      {/* ── Top bar ── */}
      <div className="browse-topbar">
        <Link href="/">
          <span className="text-gradient site-header__logo">
            NusaRasa
          </span>
        </Link>
        <Link href="/" className="browse-topbar__back">
          ← Beranda
        </Link>
      </div>

      {/* ── Search section ── */}
      <div className="browse-search-section">

        {/* Search form */}
        <form onSubmit={handleSearch} className="browse-search-form">
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
                onClick={() => { setQuery(''); fetchFoods(); }}
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

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="tag-filters">
            {allTags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-btn ${active ? 'tag-btn--active' : ''}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Explanation & Result count */}
        {!loading && (
          <div className="mt-4">
            {explanation && (
              <div className="bg-green-50 p-3 rounded mb-4 text-sm text-green-800" style={{backgroundColor: '#eff6ff', color: '#1e40af', padding: '12px', borderRadius: '8px', marginBottom: '16px', marginTop: '16px'}}>
                <strong>AI Memahami:</strong> {explanation}
              </div>
            )}
            <p className="browse-count">
              {filteredFoods.length} hidangan ditemukan
            </p>
          </div>
        )}
      </div>

      {/* ── Food cards ── */}
      <div className="browse-cards-container">
        {loading ? (
          <div className="state-center">
            <div className="spinner" />
            <p>Memuat hidangan...</p>
          </div>
        ) : error ? (
          <div className="state-center">
            <p className="error-text">❌ {error}</p>
            <p className="error-hint">Pastikan backend beroperasi dan terhubung dengan benar.</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="state-center">
            <span className="empty-icon">🔍</span>
            <p>Tidak ada hidangan ditemukan</p>
            <p className="error-hint">Coba kata kunci atau filter lain</p>
          </div>
        ) : (
          <div className="browse-cards-list">
            {filteredFoods.map((food) => <FoodCard key={food.id} food={food} />)}
          </div>
        )}
      </div>
    </div>
  );
}
