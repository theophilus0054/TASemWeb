'use client';

import { useState } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <input
        id="search-input"
        className={styles.input}
        type="text"
        placeholder="Cari hidangan Nusantara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Cari hidangan"
      />
      <button
        id="search-button"
        className={styles.button}
        onClick={handleSubmit}
        aria-label="Cari"
      >
        {/* Search icon (SVG) */}
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
