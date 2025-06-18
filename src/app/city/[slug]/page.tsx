'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import RedditEventCard from '@/components/RedditEventCard';
import { Event, City } from '@/types';

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export default function CityPage({ params }: CityPageProps) {
  const [citySlug, setCitySlug] = useState<string>('');
  const [city, setCity] = useState<City | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'rating' | 'date' | 'comments'>('rating');

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
      }
    };

    fetchCity();
  }, [citySlug]);

  // Загрузка мероприятий
  const fetchEvents = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (!city) return;
    
    try {
      if (reset) {
        setLoading(true);
        setEvents([]);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        city: city.name,
        page: pageNum.toString(),
        limit: '10',
        sort: sortBy
      });

      const response = await fetch(`/api/events?${params}`);
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки мероприятий');
      }

      const data = await response.json();
      const newEvents = data.events || [];

      if (reset) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      setHasMore(newEvents.length >= 10);
      setPage(pageNum + 1);

    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
      setError('Не удалось загрузить мероприятия');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [city, sortBy]);

  // Первоначальная загрузка мероприятий
  useEffect(() => {
    if (city) {
      setPage(1);
      fetchEvents(1, true);
    }
  }, [city, sortBy, fetchEvents]);

  // Бесконечная прокрутка
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        fetchEvents(page);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loadingMore, loading, fetchEvents]);

  // Обработка голосования
  const handleVote = async (eventId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/events/${eventId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setEvents(prev => prev.map(event => {
          if (event._id === eventId) {
            const newUpvotes = voteType === 'up' ? event.upvotes + 1 : event.upvotes;
            const newDownvotes = voteType === 'down' ? event.downvotes + 1 : event.downvotes;
            return {
              ...event,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              rating: newUpvotes - newDownvotes
            };
          }
          return event;
        }));
      }
    } catch (error) {
      console.error('Ошибка голосования:', error);
    }
  };

  if (error) {
    return (
      <>
        <AppHeader />
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
      </>
    );
  }

  if (loading && !city) {
    return (
      <>
        <AppHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          
          {/* Заголовок города */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {city?.name}
            </h1>
            
            {/* Сортировка */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'date' | 'comments')}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white text-gray-900"
              >
                <option value="rating" className="text-gray-900">🔥 Популярные</option>
                <option value="date" className="text-gray-900">📅 Новые</option>
                <option value="comments" className="text-gray-900">💬 Обсуждаемые</option>
              </select>
            </div>
          </div>

          {/* Лента мероприятий */}
          <div className="space-y-0">
            {events.map((event) => (
              <RedditEventCard
                key={event._id}
                event={event}
                onVote={handleVote}
              />
            ))}
          </div>

          {/* Состояния загрузки */}
          {loading && events.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {!loading && !loadingMore && events.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Пока нет мероприятий
              </h3>
              <p className="text-gray-600 mb-6">
                В городе {city?.name} пока не добавлено ни одного мероприятия
              </p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors">
                Добавить первое мероприятие
              </button>
            </div>
          )}

          {!hasMore && events.length > 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">🎉 Вы просмотрели все мероприятия!</p>
            </div>
          )}
        </div>

        {/* Плавающая кнопка создания мероприятия */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center w-14 h-14 text-2xl font-bold active:scale-95">
            +
          </button>
        </div>
      </div>
    </>
  );
}

 