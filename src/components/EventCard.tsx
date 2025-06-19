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
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const formatDateTime = (date: Date, time?: string) => {
    const dateStr = formatDate(date);
    const timeStr = formatTime(time);
    return timeStr ? `${dateStr} в ${timeStr}` : dateStr;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Частное': '🏠',
      'Музыка': '🎵',
      'Театр': '🎭',
      'Кино': '🎬',
      'Выставки': '🎨',
      'Спорт': '⚽',
      'Образование': '📚',
      'Бизнес': '💼',
      'Развлечения': '🎪',
      'Культура': '🏛️',
      'Еда и напитки': '🍽️',
      'Семейные': '👨‍👩‍👧‍👦',
      'Здоровье': '💪',
      'Технологии': '💻',
      'Природа': '🌳',
      'Другое': '📅',
      // Старые категории для обратной совместимости
      'Концерты': '🎵',
    };
    return icons[category] || '📅';
  };

  // Проверяем, является ли изображение Base64
  const isBase64Image = (image: string) => {
    return image.startsWith('data:image/');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
      
      {/* Изображение - адаптивная высота */}
      {event.image ? (
        <div className="relative h-32 sm:h-40 md:h-48">
          {isBase64Image(event.image) ? (
            // Base64 изображение
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            // URL изображение (для обратной совместимости)
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
            />
          )}
          
          {/* Индикатор повторяющегося события */}
          {event.isRecurring && (
            <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              🔄 {event.recurringType === 'weekly' ? 'Еженедельно' : 'Ежемесячно'}
            </div>
          )}
        </div>
      ) : (
        <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center relative">
          <span className="text-4xl sm:text-5xl md:text-6xl">
            {getCategoryIcon(event.category)}
          </span>
          
          {/* Индикатор повторяющегося события */}
          {event.isRecurring && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs font-medium">
              🔄 {event.recurringType === 'weekly' ? 'Еженедельно' : 'Ежемесячно'}
            </div>
          )}
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
          {/* Дата и время */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <span className="mr-2">📅</span>
            <span className="truncate">{formatDateTime(event.date, event.time)}</span>
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
              👍 {event.upvotes || 0}
            </span>
            <span className="flex items-center">
              👎 {event.downvotes || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 