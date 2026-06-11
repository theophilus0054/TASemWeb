'use client';

/**
 * TagFilter — horizontal scrollable pill filters.
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function TagFilter({ tags = [], activeTags = [], onToggle }) {
  return (
    <div className="tag-filters">
      {tags.map((tag) => {
        const active = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle && onToggle(tag)}
            className={`tag-btn ${active ? 'tag-btn--active' : ''}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
