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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 mb-4">
      <div className="flex">
        {/* Левая панель с голосованием */}
        <div className="flex flex-col items-center bg-gray-50 p-2 rounded-l-lg min-w-[60px]">
          <button
            onClick={() => onVote(venue._id, 'up')}
            className="text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
            title="Нравится"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/>
            </svg>
          </button>
          
          <span className={`text-sm font-semibold py-1 ${
            venue.rating > 0 ? 'text-orange-500' : 
            venue.rating < 0 ? 'text-blue-500' : 'text-gray-500'
          }`}>
            {venue.rating > 0 ? '+' : ''}{venue.rating}
          </span>
          
          <button
            onClick={() => onVote(venue._id, 'down')}
            className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
            title="Не нравится"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
            </svg>
          </button>
        </div>

        {/* Основной контент */}
        <div className="flex-1 p-4">
          {/* Заголовок */}
          <Link href={`/city/${citySlug}/venue/${venue._id}`} className="block group">
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {venue.name}
            </h2>
          </Link>

          {/* Описание (сокращенное) */}
          <p className="text-gray-600 text-sm mb-3 overflow-hidden"
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 2,
               WebkitBoxOrient: 'vertical',
               lineHeight: '1.4em',
               maxHeight: '2.8em'
             }}>
            {venue.description}
          </p>

          {/* Изображение */}
          {venue.images && venue.images.length > 0 && !imageError && (
            <Link href={`/city/${citySlug}/venue/${venue._id}`} className="block mb-3">
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <img
                  src={venue.images[0]}
                  alt={venue.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              </div>
            </Link>
          )}

          {/* Нижняя панель */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Кнопка комментариев */}
            <Link 
              href={`/city/${citySlug}/venue/${venue._id}#comments`}
              className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{venue.commentsCount || 0}</span>
            </Link>

            {/* Категория */}
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {getCategoryEmoji(venue.category)} {venue.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 