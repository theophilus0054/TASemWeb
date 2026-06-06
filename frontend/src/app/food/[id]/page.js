'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/Header/Header';
import FoodDetail from '@/components/FoodDetail/FoodDetail';

/**
 * Food Detail Page — /food/[id]
 * Fetches full dish details from the API and displays them.
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
        const data = await res.json();
        setFood(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFood();
  }, [id]);

  return (
    <div>
      <Header />

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          color: 'var(--color-text-muted)'
        }}>
          <p>Memuat detail hidangan...</p>
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#e57373'
        }}>
          <p>❌ {error}</p>
        </div>
      ) : food ? (
        <FoodDetail food={food} />
      ) : null}
    </div>
  );
}
