import Link from 'next/link';

/**
 * FoodDetail — Full detail view of a dish.
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function FoodDetail({ food }) {
  const emoji = food.tipe === 'Beverage' ? '🍹'
    : food.tipe === 'Snack' ? '🍪'
    : '🍛';

  const infoItems = [
    { label: 'Daerah',         value: food.daerah },
    { label: 'Budaya',         value: food.budaya },
    { label: 'Metode Memasak', value: food.metode_memasak },
    { label: 'Kepedasan',      value: food.tingkat_kepedasan },
    { label: 'Diet',           value: food.kategori_diet },
    { label: 'Tipe',           value: food.tipe },
  ].filter(({ value }) => value);

  return (
    <div className="detail-wrapper">
      <div className="detail-inner">

        {/* Back button */}
        <Link href="/food" className="detail-back">
          ← Kembali ke jelajahi
        </Link>

        {/* Card */}
        <div className="detail-card">

          {/* Card header — gradient strip */}
          <div className="detail-card__header">
            <div className="detail-card__emoji">
              {emoji}
            </div>
            <h2 className="detail-card__title">
              {food.nama}
            </h2>
          </div>

          {/* Card body */}
          <div className="detail-card__body">

            {/* Description */}
            {food.deskripsi && (
              <p className="detail-card__desc">
                {food.deskripsi}
              </p>
            )}

            {/* Info grid */}
            {infoItems.length > 0 && (
              <div className="detail-info-grid">
                {infoItems.map(({ label, value }) => (
                  <div key={label} className="detail-info-item">
                    <p className="detail-info-label">
                      {label}
                    </p>
                    <p className="detail-info-value">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Ingredients */}
            {food.bahan_utama && food.bahan_utama.length > 0 && (
              <div>
                <h3 className="detail-section-title">
                  Bahan Utama
                </h3>
                <div className="detail-ingredients">
                  {food.bahan_utama.map((bahan, i) => (
                    <span key={i} className="detail-ingredient">
                      {bahan}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related dishes */}
            {food.related && food.related.length > 0 && (
              <div>
                <h3 className="detail-section-title">
                  Hidangan Terkait
                </h3>
                <div className="detail-related-list">
                  {food.related.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/food/${rel.id}`}
                      className="detail-related-link"
                    >
                      → {rel.nama}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
