'use client';

import { useState } from 'react';

/**
 * SearchBar — pill-style search input.
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      {/* Glass pill */}
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
      </div>

      {/* Submit */}
      <button
        id="search-button"
        type="submit"
        className="search-submit"
      >
        Cari
      </button>
    </form>
  );
}
