'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import CreateEventForm from '@/components/CreateEventForm';
import { City } from '@/types';

interface CreateEventPageProps {
  params: Promise<{ slug: string }>;
}

export default function CreateEventPage({ params }: CreateEventPageProps) {
  const [citySlug, setCitySlug] = useState<string>('');
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация параметров
  useEffect(() => {
    params.then(({ slug }) => {
      setCitySlug(slug);
    });
  }, [params]);

  // Загрузка данных города
  useEffect(() => {
    if (!citySlug) return;
    
    const fetchCity = async () => {
      try {
        const response = await fetch(`/api/cities/${citySlug}`);
        if (response.ok) {
          const cityData = await response.json();
          setCity(cityData);
        } else if (response.status === 404) {
          notFound();
        } else {
          throw new Error('Ошибка загрузки города');
        }
      } catch (error) {
        console.error('Ошибка загрузки города:', error);
        setError('Не удалось загрузить информацию о городе');
      } finally {
        setLoading(false);
      }
    };

    fetchCity();
  }, [citySlug]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (loading || !city) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <CreateEventForm city={city.name} citySlug={citySlug} />
        </div>
      </div>
    </ProtectedRoute>
  );
} 