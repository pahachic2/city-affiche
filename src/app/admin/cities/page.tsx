'use client';

import { useState, useEffect } from 'react';
import { City } from '@/types';
import AppHeader from '@/components/AppHeader';
import Image from 'next/image';

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [newCity, setNewCity] = useState({ name: '', imageUrl: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cities');
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      setCities(data.cities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const createCity = async () => {
    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCity),
      });
      
      if (response.ok) {
        setNewCity({ name: '', imageUrl: '' });
        setShowAddForm(false);
        fetchCities();
        alert('Город создан!');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      alert('Ошибка создания города');
    }
  };

  const updateCityImage = async (citySlug: string, imageUrl: string) => {
    try {
      const response = await fetch(`/api/cities/${citySlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      
      if (response.ok) {
        fetchCities();
        setEditingCity(null);
        alert('Изображение обновлено!');
      } else {
        alert('Ошибка обновления');
      }
    } catch (error) {
      alert('Ошибка обновления изображения');
    }
  };

  const suggestedImages = {
    'Москва': [
      'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=600&fit=crop',
      '/cities/moscow.jpg'
    ],
    'Санкт-Петербург': [
      'https://images.unsplash.com/photo-1520637836862-4d197d17c767?w=1200&h=600&fit=crop',
      '/cities/spb.jpg'
    ],
    'Екатеринбург': [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=600&fit=crop',
      '/cities/ekaterinburg.jpg'
    ],
    'Казань': [
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1200&h=600&fit=crop',
      '/cities/kazan.jpg'
    ]
  };

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Загрузка...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Управление городами</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {showAddForm ? 'Отмена' : 'Добавить город'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Форма добавления города */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Добавить новый город</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название города</label>
                <input
                  type="text"
                  value={newCity.name}
                  onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Екатеринбург"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL изображения</label>
                <input
                  type="text"
                  value={newCity.imageUrl}
                  onChange={(e) => setNewCity({...newCity, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="/cities/city.jpg или https://..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={createCity}
                  disabled={!newCity.name || !newCity.imageUrl}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Создать
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Список городов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div key={city._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={city.imageUrl}
                  alt={city.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x200/cccccc/666666?text=' + encodeURIComponent(city.name);
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{city.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Slug: {city.slug}</p>
                <p className="text-sm text-gray-500 mb-4">События: {city.eventsCount}</p>
                
                {editingCity?._id === city._id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      defaultValue={city.imageUrl}
                      onBlur={(e) => updateCityImage(city.slug, e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="URL нового изображения"
                    />
                    
                    {/* Предложенные изображения */}
                    {suggestedImages[city.name as keyof typeof suggestedImages] && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">Предложенные:</p>
                        {suggestedImages[city.name as keyof typeof suggestedImages].map((url, index) => (
                          <button
                            key={index}
                            onClick={() => updateCityImage(city.slug, url)}
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 truncate"
                          >
                            {url}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setEditingCity(null)}
                      className="text-sm bg-gray-500 text-white px-2 py-1 rounded"
                    >
                      Отмена
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => setEditingCity(city)}
                      className="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Изменить изображение
                    </button>
                    <a
                      href={`/city/${city.slug}`}
                      className="block w-full bg-green-600 text-white px-3 py-1 rounded text-sm text-center hover:bg-green-700"
                    >
                      Перейти к городу
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {cities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Городов пока нет</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              Добавить первый город
            </button>
          </div>
        )}
      </div>
    </>
  );
} 