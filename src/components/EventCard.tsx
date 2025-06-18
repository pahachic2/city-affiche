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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Изображение */}
      {event.image ? (
        <div className="relative h-48">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-6xl">{getCategoryIcon(event.category)}</span>
        </div>
      )}

      {/* Контент */}
      <div className="p-6">
        {/* Заголовок */}
        <Link href={`/events/${event._id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
        </Link>

        {/* Описание */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {event.description}
        </p>

        {/* Метаинформация */}
        <div className="space-y-2 mb-4">
          {/* Дата */}
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">📅</span>
            {formatDate(event.date)}
          </div>

          {/* Город */}
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">{event.isOnline ? '💻' : '📍'}</span>
            {event.isOnline ? 'Онлайн' : event.city}
          </div>

          {/* Категория */}
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">{getCategoryIcon(event.category)}</span>
            {event.category}
          </div>
        </div>

        {/* Автор и статистика */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center">
            <span className="mr-2">👤</span>
            {event.author?.name || 'Аноним'}
          </div>
          
          <div className="flex items-center space-x-4">
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