'use client';

import { City } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface CityCardProps {
  city: City;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden group">
      
      {/* Фоновое изображение города */}
      <Image
        src={city.imageUrl}
        alt={city.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
      />
      
      {/* Градиентный оверлей для читаемости текста */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      
      {/* Основная ссылка на город */}
      <Link href={`/city/${city.slug}`} className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold text-center px-4 drop-shadow-lg">
          Афиша {city.name}
        </h2>
      </Link>
      
      {/* Кнопка создания события */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Link 
          href={`/city/${city.slug}/create-event`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <span>+</span>
          <span className="hidden sm:inline">Создать событие</span>
        </Link>
      </div>
      
      {/* Счетчик событий */}
      {city.eventsCount > 0 && (
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {city.eventsCount} событий
          </div>
        </div>
      )}
      
      {/* Эффект hover */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
} 