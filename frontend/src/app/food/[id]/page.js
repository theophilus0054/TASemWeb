'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/Header/Header';
import FoodDetail from '@/components/FoodDetail/FoodDetail';

/**
 * Food Detail Page — /food/[id]
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function FoodPage({ params }) {
  const { id } = use(params);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFood = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/data/${id}`);
        if (!res.ok) throw new Error('Hidangan tidak ditemukan');
        setFood(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFood();
  }, [id]);

  return (
    <div className="detail-page">
      <Header />
      {loading ? (
        <div className="state-center">
          <div className="spinner" />
          <p>Memuat detail hidangan...</p>
        </div>
      ) : error ? (
        <div className="state-center">
          <p className="error-text">❌ {error}</p>
        </div>
      ) : food ? (
        <FoodDetail food={food} />
      ) : null}
    </div>
  );
}
