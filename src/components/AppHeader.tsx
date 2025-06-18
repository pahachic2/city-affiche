'use client';

import Link from 'next/link';
import CitySearch from './CitySearch';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Пустое место слева для баланса */}
          <div className="w-48 hidden sm:block"></div>
          
          {/* Центральный логотип и название */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">🎭</span>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">
              CITY AFFICHE
            </span>
          </Link>
          
          {/* Поиск справа */}
          <div className="w-48">
            <CitySearch />
          </div>
        </div>
      </div>
    </header>
  );
} 