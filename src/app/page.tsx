import { Suspense } from 'react';
import AppHeader from '@/components/AppHeader';
import CitiesList from '@/components/CitiesList';

export default function HomePage() {
  return (
    <>
      {/* Новый Header с поиском */}
      <AppHeader />
      
      {/* Основной контент */}
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Список городов */}
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          }>
            <CitiesList />
          </Suspense>
          
        </div>
      </main>
    </>
  );
}
