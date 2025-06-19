'use client';

import Link from 'next/link';
import CitySearch from './CitySearch';
import UserMenu from './UserMenu';
import { useAuth } from '@/hooks/useAuth';

export default function AppHeader() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Левая часть - поиск */}
          <div className="w-48 hidden sm:block">
            <CitySearch />
          </div>
          
          {/* Центральный логотип и название */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">🎭</span>
            </div>
            <span className="text-white text-xl font-bold tracking-wide">
              CITY AFFICHE
            </span>
          </Link>
          
          {/* Правая часть - авторизация */}
          <div className="w-48 flex justify-end">
            {isLoading ? (
              // Индикатор загрузки
              <div className="w-8 h-8 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
            ) : isAuthenticated ? (
              // Меню пользователя
              <UserMenu />
            ) : (
              // Кнопка входа
              <Link 
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
        
        {/* Мобильный поиск */}
        <div className="sm:hidden pb-3">
          <CitySearch />
        </div>
      </div>
    </header>
  );
} 