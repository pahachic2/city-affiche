'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VenueCardProps {
  venue: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    images: string[];
    address?: string;
    category: string;
    city: string;
    upvotes: number;
    downvotes: number;
    rating: number;
    commentsCount: number;
    viewsCount: number;
    createdAt: string;
    updatedAt: string;
  };
  onVote: (venueId: string, voteType: 'up' | 'down') => void;
  citySlug: string;
}

export default function VenueCard({ venue, onVote, citySlug }: VenueCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'сегодня';
    if (diffDays === 2) return 'вчера';
    if (diffDays <= 7) return `${diffDays} дн. назад`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} нед. назад`;
    return `${Math.ceil(diffDays / 30)} мес. назад`;
  };

  const getCategoryEmoji = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'Рестораны': '🍽️',
      'Кафе': '☕',
      'Бары': '🍻',
      'Фастфуд': '🍔',
      'Кондитерские': '🧁',
      'Пиццерии': '🍕',
      'Суши': '🍣',
      'Грузинская кухня': '🇬🇪',
      'Итальянская кухня': '🇮🇹',
      'Азиатская кухня': '🥢',
      'Другое': '🏪'
    };
    return categoryMap[category] || '🏪';
  };

  return (
    <div className="bg-white border border-gray-300 hover:border-gray-400 transition-colors">
      <div className="flex">
        {/* Левый блок с голосованием */}
        <div className="flex flex-col items-center bg-gray-50 p-2 w-16">
          <button
            onClick={() => onVote(venue._id, 'up')}
            className="text-gray-400 hover:text-orange-500 hover:bg-gray-100 p-1 rounded transition-colors"
            title="Нравится"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <span className={`text-xs font-bold px-1 ${
            venue.rating > 0 ? 'text-orange-500' : 
            venue.rating < 0 ? 'text-blue-500' : 'text-gray-500'
          }`}>
            {venue.rating}
          </span>
          
          <button
            onClick={() => onVote(venue._id, 'down')}
            className="text-gray-400 hover:text-blue-500 hover:bg-gray-100 p-1 rounded transition-colors"
            title="Не нравится"
          >
            <svg className="w-6 h-6 rotate-180" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Основной контент */}
        <div className="flex-1 p-4 min-w-0">
          {/* Заголовок с категорией */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span>{getCategoryEmoji(venue.category)} {venue.category}</span>
                <span>•</span>
                <span>добавлено {formatDate(venue.createdAt)}</span>
              </div>
              
              <Link href={`/city/${citySlug}/venue/${venue._id}`}>
                <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.3em',
                      maxHeight: '2.6em'
                    }}>
                  {venue.name}
                </h2>
              </Link>
              
              {venue.address && (
                <p className="text-sm text-gray-600 mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  📍 {venue.address}
                </p>
              )}
            </div>
          </div>

          {/* Описание */}
          {venue.description && (
            <p className="text-gray-700 text-sm mb-3 overflow-hidden" 
               style={{
                 display: '-webkit-box',
                 WebkitLineClamp: 3,
                 WebkitBoxOrient: 'vertical',
                 lineHeight: '1.4em',
                 maxHeight: '4.2em'
               }}>
              {venue.description}
            </p>
          )}

          {/* Изображение */}
          {venue.images && venue.images.length > 0 && !imageError && (
            <div className="mb-3 overflow-hidden">
              <img
                src={venue.images[0]}
                alt={venue.name}
                className="w-full h-auto max-h-80 rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </div>
          )}

          {/* Нижняя панель с действиями */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href={`/city/${citySlug}/venue/${venue._id}`}>
              <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
                💬 {venue.commentsCount} комментариев
              </span>
            </Link>
            
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
              👁️ {venue.viewsCount} просмотров
            </span>
            
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
              ↗️ Поделиться
            </span>
            
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
              🔖 Сохранить
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 