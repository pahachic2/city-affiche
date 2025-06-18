import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import EventsList from '@/components/EventsList';
import EventFilters from '@/components/EventFilters';

// Функция для получения данных города
async function getCity(slug: string) {
  try {
    // В реальном приложении здесь будет запрос к API
    // Пока возвращаем заглушку на основе слага
    const cityNames: Record<string, string> = {
      'moscow': 'Москва',
      'sankt-peterburg': 'Санкт-Петербург', 
      'ekaterinburg': 'Екатеринбург',
      'kazan': 'Казань'
    };
    
    const cityName = cityNames[slug];
    if (!cityName) {
      return null;
    }
    
    return {
      name: cityName,
      slug: slug
    };
  } catch (error) {
    console.error('Ошибка получения города:', error);
    return null;
  }
}

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <AppHeader />
      
      {/* Основной контент */}
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          
          {/* Заголовок города */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4">
              🎭 Афиша {city.name}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl lg:max-w-2xl mx-auto px-4">
              Лучшие мероприятия в городе {city.name}. 
              Найди интересные события и не пропусти ничего важного!
            </p>
          </div>

          {/* Фильтры событий */}
          <div className="mb-6 sm:mb-8">
            <EventFilters defaultCity={city.name} />
          </div>

          {/* Список событий города */}
          <Suspense fallback={
            <div className="flex justify-center items-center h-32 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600"></div>
            </div>
          }>
            <EventsList cityFilter={city.name} />
          </Suspense>

          {/* Кнопка создания мероприятия */}
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6">
            <a
              href={`/create-event?city=${encodeURIComponent(city.name)}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full 
                         shadow-lg transition-all duration-200 hover:scale-110
                         flex items-center justify-center
                         w-12 h-12 sm:w-14 sm:h-14 
                         text-xl sm:text-2xl font-bold
                         active:scale-95"
              aria-label={`Создать мероприятие в ${city.name}`}
            >
              +
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

// Генерация статических параметров для популярных городов
export async function generateStaticParams() {
  return [
    { slug: 'moscow' },
    { slug: 'sankt-peterburg' },
    { slug: 'ekaterinburg' },
    { slug: 'kazan' }
  ];
}

// Метаданные для SEO
export async function generateMetadata({ params }: CityPageProps) {
  const { slug } = await params;
  const city = await getCity(slug);
  
  if (!city) {
    return {
      title: 'Город не найден - City Affiche'
    };
  }
  
  return {
    title: `Афиша ${city.name} - City Affiche`,
    description: `Лучшие мероприятия в ${city.name}: концерты, театр, выставки, спорт и многое другое`,
    keywords: `мероприятия ${city.name}, афиша ${city.name}, события ${city.name}`,
  };
} 