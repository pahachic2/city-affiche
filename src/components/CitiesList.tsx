'use client';

import { useState, useEffect } from 'react';
import { City } from '@/types';
import CityCard from './CityCard';

export default function CitiesList() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cities');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки городов');
      }

      const data = await response.json();
      setCities(data.cities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4 text-lg">❌ {error}</div>
        <button
          onClick={fetchCities}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors font-medium"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4 text-lg">🏙️ Города пока не добавлены</div>
        <p className="text-gray-400 text-sm">
          Скоро здесь появятся лучшие города для поиска мероприятий
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {cities.map((city) => (
        <CityCard key={city._id} city={city} />
      ))}
    </div>
  );
} 