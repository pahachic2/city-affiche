import { Suspense } from 'react';
import EventsList from '@/components/EventsList';
import EventFilters from '@/components/EventFilters';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            🎭 Афиша мероприятий
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Открывайте и создавайте удивительные мероприятия в вашем городе. 
            Общайтесь с единомышленниками и не пропускайте интересные события!
          </p>
        </div>

        {/* Фильтры */}
        <div className="mb-8">
          <EventFilters />
        </div>

        {/* Список мероприятий */}
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <EventsList />
        </Suspense>

        {/* Кнопка создания мероприятия */}
        <div className="fixed bottom-6 right-6">
          <a
            href="/create-event"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-colors flex items-center justify-center w-14 h-14 text-2xl"
            aria-label="Создать мероприятие"
          >
            +
          </a>
        </div>
      </div>
    </main>
  );
}
