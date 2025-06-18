'use client';

import { City } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface CityCardProps {
  city: City;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <Link href={`/city/${city.slug}`} className="block">
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
        
        {/* Название города */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold text-center px-4 drop-shadow-lg">
            Афиша {city.name}
          </h2>
        </div>
        
        {/* Эффект hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </Link>
  );
} 