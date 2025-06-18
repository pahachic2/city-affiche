'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import EventCard from './EventCard';

interface EventsListProps {
  cityFilter?: string;
}

export default function EventsList({ cityFilter }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [cityFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Строим URL с фильтром по городу если он задан
      let url = '/api/events';
      if (cityFilter) {
        url += `?city=${encodeURIComponent(cityFilter)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки мероприятий');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 sm:h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-red-600 mb-4 text-sm sm:text-base">❌ {error}</div>
        <button
          onClick={fetchEvents}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                     transition-colors text-sm sm:text-base"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className="text-gray-500 mb-4 text-sm sm:text-base">
          📅 {cityFilter ? `Мероприятий в ${cityFilter} пока нет` : 'Мероприятий пока нет'}
        </div>
        <a
          href={cityFilter ? `/create-event?city=${encodeURIComponent(cityFilter)}` : '/create-event'}
          className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white 
                     rounded-md hover:bg-indigo-700 transition-colors text-sm sm:text-base"
        >
          {cityFilter ? `Создать мероприятие в ${cityFilter}` : 'Создать первое мероприятие'}
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Адаптивная сетка:
          - Мобильные: 1 колонка
          - Маленькие планшеты: 1 колонка  
          - Планшеты: 2 колонки
          - Ноутбуки: 3 колонки
          - Большие экраны: 4 колонки */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
                      gap-4 sm:gap-6 lg:gap-8">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
} 