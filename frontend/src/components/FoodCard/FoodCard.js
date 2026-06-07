import Link from 'next/link';

/**
 * FoodCard — Horizontal card showing a food item.
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function FoodCard({ food }) {
  const tags = [];
  if (food.daerah)           tags.push(food.daerah);
  if (food.tingkat_kepedasan) tags.push(food.tingkat_kepedasan);
  if (food.kategori_diet)    tags.push(food.kategori_diet);
  if (food.tipe)             tags.push(food.tipe);

  const emoji = food.tipe === 'Beverage' ? '🍹'
    : food.tipe === 'Snack' ? '🍪'
    : '🍛';

  return (
    <Link
      href={`/food/${food.id}`}
      id={`food-card-${food.id}`}
      className="food-card"
    >
      {/* Thumbnail */}
      <div className="food-card__thumb">
        {emoji}
      </div>

      {/* Content */}
      <div className="food-card__content">
        <p className="food-card__name">
          {food.nama}
        </p>
        <div className="food-card__tags">
          {tags.map((tag, i) => (
            <span key={i} className="food-card__tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <span className="food-card__arrow">
        ›
      </span>
    </Link>
  );
}
