'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types';

interface RedditEventCardProps {
  event: Event;
  onVote?: (eventId: string, voteType: 'up' | 'down') => void;
  citySlug?: string;
}

export default function RedditEventCard({ event, onVote, citySlug }: RedditEventCardProps) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [currentRating, setCurrentRating] = useState(event.upvotes - event.downvotes);
  const [isVoting, setIsVoting] = useState(false);

  const formatDate = (date: string | Date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} дн. назад`;
    } else if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Завтра';
    } else {
      return `${diffDays} дн.`;
    }
  };

  const formatFullDate = (date: string | Date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (isVoting) return;
    
    setIsVoting(true);
    
    try {
      // Если пользователь уже голосовал этим типом, убираем голос
      if (userVote === voteType) {
        setUserVote(null);
        setCurrentRating(prev => voteType === 'up' ? prev - 1 : prev + 1);
      } 
      // Если пользователь голосовал противоположным типом, меняем голос
      else if (userVote && userVote !== voteType) {
        setUserVote(voteType);
        setCurrentRating(prev => voteType === 'up' ? prev + 2 : prev - 2);
      }
      // Если пользователь не голосовал, добавляем голос
      else {
        setUserVote(voteType);
        setCurrentRating(prev => voteType === 'up' ? prev + 1 : prev - 1);
      }
      
      // Здесь будет реальный API вызов
      if (onVote) {
        onVote(event._id, voteType);
      }
      
    } catch {
      // Откатываем изменения при ошибке
      setUserVote(userVote);
      setCurrentRating(event.upvotes - event.downvotes);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    const url = citySlug 
      ? `${window.location.origin}/city/${citySlug}/event/${event._id}`
      : `${window.location.origin}/event/${event._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description.substring(0, 100) + '...',
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 mb-4">
      <div className="flex">
        {/* Левая панель с голосованием */}
        <div className="flex flex-col items-center bg-gray-50 p-2 rounded-l-lg min-w-[60px]">
          <button
            onClick={() => handleVote('up')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'up' 
                ? 'text-orange-500 bg-orange-100' 
                : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/>
            </svg>
          </button>
          
          <span className={`text-sm font-semibold py-1 ${
            currentRating > 0 ? 'text-orange-500' : 
            currentRating < 0 ? 'text-blue-500' : 'text-gray-500'
          }`}>
            {currentRating > 0 ? '+' : ''}{currentRating}
          </span>
          
          <button
            onClick={() => handleVote('down')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'down' 
                ? 'text-blue-500 bg-blue-100' 
                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
            </svg>
          </button>
        </div>

        {/* Основной контент */}
        <div className="flex-1 p-4">
          {/* Заголовок */}
          <Link href={citySlug ? `/city/${citySlug}/event/${event._id}` : `/event/${event._id}`} className="block group">
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {event.title}
            </h2>
          </Link>

          {/* Изображение */}
          {event.image && (
            <Link href={citySlug ? `/city/${citySlug}/event/${event._id}` : `/event/${event._id}`} className="block mb-3">
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                {event.image.startsWith('data:image/') ? (
                  // Base64 изображение
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  // URL изображение (для обратной совместимости)
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                )}
              </div>
            </Link>
          )}

          {/* Описание (сокращенное) */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>

          {/* Нижняя панель */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {/* Кнопка комментариев */}
              <Link 
                href={citySlug ? `/city/${citySlug}/event/${event._id}#comments` : `/event/${event._id}#comments`}
                className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{event.commentsCount || 0}</span>
              </Link>

              {/* Дата проведения */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span title={formatFullDate(event.date)}>
                  {formatDate(event.date)}
                </span>
              </div>

              {/* Категория */}
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {event.category}
              </span>

              {/* Онлайн метка */}
              {event.isOnline && (
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                  Онлайн
                </span>
              )}
            </div>

            {/* Кнопка поделиться */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
              title="Поделиться"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 