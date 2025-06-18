'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎭</span>
            <span className="text-lg sm:text-xl font-bold text-indigo-600 hidden xs:block">
              City Affiche
            </span>
          </Link>

          {/* Десктопное меню */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Мероприятия
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Категории
            </Link>
            <Link 
              href="/create-event" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 
                         transition-colors font-medium"
            >
              Создать событие
            </Link>
          </nav>

          {/* Мобильная кнопка меню */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 
                       hover:bg-gray-100 transition-colors"
            aria-label="Открыть меню"
          >
            {isMobileMenuOpen ? (
              // Иконка закрытия
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Иконка гамбургера
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="py-4 space-y-3">
              <Link 
                href="/" 
                className="block px-4 py-2 text-gray-700 hover:text-indigo-600 
                           hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎭 Мероприятия
              </Link>
              <Link 
                href="/categories" 
                className="block px-4 py-2 text-gray-700 hover:text-indigo-600 
                           hover:bg-gray-50 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📂 Категории
              </Link>
              <Link 
                href="/create-event" 
                className="block mx-4 mt-4 px-4 py-3 bg-indigo-600 text-white text-center 
                           rounded-md hover:bg-indigo-700 transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ➕ Создать событие
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 