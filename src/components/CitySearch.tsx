'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { City } from '@/types';

interface CitySearchProps {
  onCitySelect?: (city: City) => void;
}

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Поиск городов с дебоунсом
  useEffect(() => {
    const searchCities = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/cities?search=${encodeURIComponent(searchTerm)}&limit=4`);
        const data = await response.json();
        
        setSuggestions(data.cities || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Ошибка поиска городов:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: City) => {
    setSearchTerm('');
    setIsOpen(false);
    
    if (onCitySelect) {
      onCitySelect(city);
    } else {
      // Переход на страницу города
      router.push(`/city/${city.slug}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      {/* Поле поиска */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Поиск городов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-full 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     placeholder-gray-500"
        />
        
        {/* Иконка поиска */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Выпадающий список с предложениями */}
      {isOpen && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 
                     rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {loading ? 'Поиск...' : 'Города не найдены'}
            </div>
          ) : (
            suggestions.map((city) => (
              <button
                key={city._id}
                onClick={() => handleCitySelect(city)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 
                           focus:bg-gray-50 focus:outline-none transition-colors
                           border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{city.name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
} 