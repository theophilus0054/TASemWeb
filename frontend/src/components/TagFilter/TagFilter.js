'use client';

import styles from './TagFilter.module.css';

export default function TagFilter({ tags = [], activeTags = [], onToggle }) {
  return (
    <div className={styles.container}>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.tag} ${activeTags.includes(tag) ? styles.tagActive : ''}`}
          onClick={() => onToggle && onToggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
