'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Event, City } from '@/types';
import EventChat from '@/components/EventChat';

// Форматирование даты
const formatEventDate = (date: Date, time?: string) => {
  const eventDate = new Date(date);
  const dateStr = eventDate.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  if (time) {
    return `${dateStr} в ${time}`;
  }
  return dateStr;
};

export default function EventPage() {
  const params = useParams();
  const { user, token } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const citySlug = params.slug as string;
  const eventId = params.id as string;

  useEffect(() => {
    const fetchEventAndCity = async () => {
      try {
        setLoading(true);
        
        // Получаем событие
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (!eventResponse.ok) {
          if (eventResponse.status === 404) {
            notFound();
          }
          throw new Error('Ошибка загрузки события');
        }
        
        const eventData = await eventResponse.json();
        
        // Получаем город
        const cityResponse = await fetch(`/api/cities/${citySlug}`);
        if (!cityResponse.ok) {
          if (cityResponse.status === 404) {
            notFound();
          }
          throw new Error('Ошибка загрузки города');
        }
        
        const cityData = await cityResponse.json();
        
        // Проверяем что событие принадлежит этому городу
        if (eventData.city !== cityData.name) {
          notFound();
        }
        
        setEvent(eventData);
        setCity(cityData);
        
      } catch {
        setError('Не удалось загрузить информацию о событии');
      } finally {
        setLoading(false);
      }
    };

    if (citySlug && eventId) {
      fetchEventAndCity();
    }
  }, [citySlug, eventId]);

  // Функция поделиться
  const handleShare = async () => {
    const url = `${window.location.origin}/city/${citySlug}/event/${eventId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description.substring(0, 100) + '...',
          url: url,
        });
      } catch {
        // Пользователь отменил или ошибка
      }
    } else {
      // Fallback - копируем в буфер обмена
      try {
        await navigator.clipboard.writeText(url);
        alert('Ссылка скопирована!');
      } catch {
        // Показываем URL для ручного копирования
        prompt('Скопируйте ссылку:', url);
      }
    }
  };

  // Функция удаления события
  const handleDeleteEvent = async () => {
    if (!confirm('Вы уверены, что хотите удалить это событие? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Событие успешно удалено');
        window.location.href = `/city/${citySlug}`;
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка удаления события');
      }
    } catch {
      alert('Произошла ошибка при удалении события');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  if (!event || !city) {
    return notFound();
  }

  const isOrganizer = user && event.authorId === user._id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Кнопка поделиться в правом верхнем углу */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={handleShare}
          className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          title="Поделиться"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>

      {/* Hero секция с изображением */}
      {event.image && (
        <div className="w-full">
          <Image
            src={event.image}
            alt={event.title}
            width={1200}
            height={400}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover"
          />
        </div>
      )}

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Объединенный блок с основной информацией */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            {/* Категория и индикатор повторения */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {event.category}
              </span>
              {event.isRecurring && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Повторяющееся
                </span>
              )}
            </div>
            
            {/* Название и организатор */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
              </div>
              
              {/* Организатор */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-sm">
                    {event.author?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Организатор</p>
                  <p className="font-medium text-gray-900">
                    {event.author?.name || 'Неизвестный организатор'}
                  </p>
                </div>
              </div>
            </div>

            {/* Дата, время, место */}
            <div className="space-y-2 mb-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium">
                  {formatEventDate(event.date, event.time)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>{city.name}</span>
                {event.isOnline && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Онлайн
                  </span>
                )}
              </div>
            </div>

            {/* Описание */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Описание
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Информация о повторяющихся событиях */}
            {event.isRecurring && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-6">
                <h3 className="font-medium text-green-900 mb-2">
                  Повторяющееся событие
                </h3>
                <p className="text-green-700 text-sm">
                  Повторяется {event.recurringType === 'weekly' ? 'еженедельно' : 'ежемесячно'}
                  {event.recurringEndDate && (
                    <> до {new Date(event.recurringEndDate).toLocaleDateString('ru-RU')}</>
                  )}
                </p>
              </div>
            )}

            {/* Кнопки организатора */}
            {isOrganizer && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                  Редактировать
                </button>
                <button 
                  onClick={handleDeleteEvent}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Удалить событие
                </button>
              </div>
            )}
          </div>

          {/* Чат события */}
          <EventChat 
            eventId={event._id} 
            isOrganizer={!!isOrganizer} 
          />
        </div>
      </div>
    </div>
  );
} 