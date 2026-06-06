import Link from 'next/link';
import styles from './FoodCard.module.css';

/**
 * FoodCard — Horizontal card showing a food item.
 * Matches the mockup: thumbnail | name + tags | arrow >
 */
export default function FoodCard({ food }) {
  // Build tags from available data
  const tags = [];
  if (food.daerah) tags.push(food.daerah);
  if (food.tingkat_kepedasan) tags.push(food.tingkat_kepedasan);
  if (food.kategori_diet) tags.push(food.kategori_diet);
  if (food.tipe) tags.push(food.tipe);

  // Emoji based on food type for placeholder thumbnail
  const emoji = food.tipe === 'Beverage' ? '🍹'
    : food.tipe === 'Snack' ? '🍪'
    : '🍛';

  return (
    <Link href={`/food/${food.id}`} className={styles.card} id={`food-card-${food.id}`}>
      {/* Placeholder thumbnail — replace with real images when available */}
      <div className={styles.placeholderThumb} aria-hidden="true">
        {emoji}
      </div>

      <div className={styles.content}>
        <div className={styles.name}>{food.nama}</div>
        <div className={styles.tags}>
          {tags.map((tag, i) => (
            <span key={i} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      <span className={styles.arrow} aria-hidden="true">›</span>
    </Link>
  );
}
