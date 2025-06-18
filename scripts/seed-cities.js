// Скрипт для добавления тестовых городов в базу данных

// Вариант 1: Локальные изображения (положите файлы в public/cities/)
const citiesLocal = [
  {
    name: 'Москва',
    slug: 'moscow',
    imageUrl: '/cities/moscow.jpg', // Локальный файл
    eventsCount: 0
  },
  {
    name: 'Санкт-Петербург', 
    slug: 'sankt-peterburg',
    imageUrl: '/cities/spb.jpg', // Локальный файл
    eventsCount: 0
  },
  {
    name: 'Екатеринбург',
    slug: 'ekaterinburg', 
    imageUrl: '/cities/ekaterinburg.jpg', // Локальный файл
    eventsCount: 0
  },
  {
    name: 'Казань',
    slug: 'kazan',
    imageUrl: '/cities/kazan.jpg', // Локальный файл
    eventsCount: 0
  }
];

// Вариант 2: Внешние URL (работают сразу, но зависят от интернета)
const citiesExternal = [
  {
    name: 'Москва',
    slug: 'moscow',
    imageUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=600&fit=crop&crop=entropy&cs=tinysrgb',
    eventsCount: 0
  },
  {
    name: 'Санкт-Петербург', 
    slug: 'sankt-peterburg',
    imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c767?w=1200&h=600&fit=crop&crop=entropy&cs=tinysrgb',
    eventsCount: 0
  },
  {
    name: 'Екатеринбург',
    slug: 'ekaterinburg', 
    imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=600&fit=crop&crop=entropy&cs=tinysrgb',
    eventsCount: 0
  },
  {
    name: 'Казань',
    slug: 'kazan',
    imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1200&h=600&fit=crop&crop=entropy&cs=tinysrgb', 
    eventsCount: 0
  }
];

// Выберите какой вариант использовать:
const cities = citiesExternal; // Измените на citiesLocal для локальных файлов

async function seedCities() {
  try {
    console.log('🌱 Добавляем города в базу данных...');
    
    for (const city of cities) {
      const response = await fetch('http://localhost:3000/api/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(city),
      });
      
      if (response.ok) {
        console.log(`✅ Город "${city.name}" добавлен`);
      } else {
        const error = await response.json();
        console.log(`⚠️ Город "${city.name}": ${error.error}`);
      }
    }
    
    console.log('🎉 Готово!');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Функция для обновления изображения конкретного города
async function updateCityImage(citySlug, newImageUrl) {
  try {
    const response = await fetch(`http://localhost:3000/api/cities/${citySlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: newImageUrl }),
    });
    
    if (response.ok) {
      console.log(`✅ Изображение города "${citySlug}" обновлено`);
    } else {
      const error = await response.json();
      console.log(`❌ Ошибка: ${error.error}`);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Запуск если файл выполняется напрямую
if (typeof window === 'undefined') {
  seedCities();
}

module.exports = { cities, seedCities, updateCityImage }; 