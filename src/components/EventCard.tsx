import { Event } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Концерты': '🎵',
      'Театр': '🎭',
      'Кино': '🎬',
      'Выставки': '🎨',
      'Спорт': '⚽',
      'Образование': '📚',
      'Бизнес': '💼',
      'Развлечения': '🎪',
      'Культура': '🏛️',
      'Другое': '📅',
    };
    return icons[category] || '📅';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
      
      {/* Изображение - адаптивная высота */}
      {event.image ? (
        <div className="relative h-32 sm:h-40 md:h-48">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-4xl sm:text-5xl md:text-6xl">
            {getCategoryIcon(event.category)}
          </span>
        </div>
      )}

      {/* Контент - адаптивные отступы */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Заголовок - адаптивный размер шрифта */}
        <Link href={`/events/${event._id}`}>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
        </Link>

        {/* Описание - скрывается на очень маленьких экранах */}
        <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">
          {event.description}
        </p>

        {/* Метаинформация - адаптивные отступы */}
        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          {/* Дата */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <span className="mr-2">📅</span>
            <span className="truncate">{formatDate(event.date)}</span>
          </div>

          {/* Город */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <span className="mr-2">{event.isOnline ? '💻' : '📍'}</span>
            <span className="truncate">{event.isOnline ? 'Онлайн' : event.city}</span>
          </div>

          {/* Категория */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <span className="mr-2">{getCategoryIcon(event.category)}</span>
            <span className="truncate">{event.category}</span>
          </div>
        </div>

        {/* Автор и статистика - адаптивная компоновка */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 border-t pt-2 sm:pt-4 space-y-2 sm:space-y-0">
          
          <div className="flex items-center">
            <span className="mr-2">👤</span>
            <span className="truncate">{event.author?.name || 'Аноним'}</span>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="flex items-center">
              💬 {event.messages?.length || 0}
            </span>
            <span className="flex items-center">
              👍 {event.votes?.filter(v => v.value === 1).length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 