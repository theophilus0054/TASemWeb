import Link from 'next/link';
import styles from './FoodDetail.module.css';

/**
 * FoodDetail — Full detail view of a dish.
 * Shows image, title, description, info grid, ingredients, and related dishes.
 */
export default function FoodDetail({ food }) {
  const emoji = food.tipe === 'Beverage' ? '🍹'
    : food.tipe === 'Snack' ? '🍪'
    : '🍛';

  return (
    <div className={styles.wrapper}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <Link href="/" className={styles.backButton}>
          ← Kembali ke pencarian
        </Link>

        <div className={styles.card}>
          {/* Card header: image + title */}
          <div className={styles.cardHeader}>
            <div className={styles.imageContainer}>
              <div className={styles.placeholderImage} aria-hidden="true">
                {emoji}
              </div>
            </div>
            <h2 className={styles.title}>{food.nama}</h2>
          </div>

          {/* Card body: details */}
          <div className={styles.cardBody}>
            {food.deskripsi && (
              <p className={styles.description}>{food.deskripsi}</p>
            )}

            {/* Info grid */}
            <div className={styles.infoGrid}>
              {food.daerah && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Daerah</div>
                  <div className={styles.infoValue}>{food.daerah}</div>
                </div>
              )}
              {food.budaya && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Budaya</div>
                  <div className={styles.infoValue}>{food.budaya}</div>
                </div>
              )}
              {food.metode_memasak && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Metode Memasak</div>
                  <div className={styles.infoValue}>{food.metode_memasak}</div>
                </div>
              )}
              {food.tingkat_kepedasan && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Kepedasan</div>
                  <div className={styles.infoValue}>{food.tingkat_kepedasan}</div>
                </div>
              )}
              {food.kategori_diet && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Diet</div>
                  <div className={styles.infoValue}>{food.kategori_diet}</div>
                </div>
              )}
              {food.tipe && (
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Tipe</div>
                  <div className={styles.infoValue}>{food.tipe}</div>
                </div>
              )}
            </div>

            {/* Ingredients */}
            {food.bahan_utama && food.bahan_utama.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Bahan Utama</h3>
                <div className={styles.ingredientList}>
                  {food.bahan_utama.map((bahan, i) => (
                    <span key={i} className={styles.ingredient}>{bahan}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Related dishes */}
            {food.related && food.related.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Hidangan Terkait</h3>
                <div className={styles.relatedList}>
                  {food.related.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/food/${rel.id}`}
                      className={styles.relatedLink}
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
