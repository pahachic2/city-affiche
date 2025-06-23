'use client';

import { useState, useEffect } from 'react';
import { EVENT_CATEGORIES, CITIES } from '@/types';

interface EventFiltersProps {
  defaultCity?: string;
  onFiltersChange?: (filters: {
    city?: string;
    category?: string;
    search?: string;
  }) => void;
}

export default function EventFilters({ defaultCity, onFiltersChange }: EventFiltersProps) {
  const [filters, setFilters] = useState({
    city: defaultCity || '',
    category: '',
    search: '',
  });

  // Обновляем фильтры при изменении defaultCity
  useEffect(() => {
    if (defaultCity) {
      const newFilters = { ...filters, city: defaultCity };
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    }
  }, [defaultCity, filters, onFiltersChange]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { 
      city: defaultCity || '', 
      category: '', 
      search: '' 
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Поиск */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Поиск
          </label>
          <input
            type="text"
            placeholder="Название мероприятия..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Город */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Город
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={!!defaultCity} // Отключаем если город задан по умолчанию
          >
            <option value="">Все города</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Категория */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Категория
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Все категории</option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Кнопка очистки */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Очистить
          </button>
        </div>
      </div>
    </div>
  );
} 