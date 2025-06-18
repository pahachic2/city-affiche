// Скрипт для обновления изображений городов

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

// Примеры использования:
async function updateAllImages() {
  console.log('🖼️ Обновляем изображения городов...');
  
  // Вариант 1: Локальные файлы
  await updateCityImage('moscow', '/cities/moscow.jpg');
  await updateCityImage('sankt-peterburg', '/cities/spb.jpg');
  await updateCityImage('ekaterinburg', '/cities/ekaterinburg.jpg');
  await updateCityImage('kazan', '/cities/kazan.jpg');
  
  // Вариант 2: Unsplash URL (замените ID на нужные)
  // await updateCityImage('moscow', 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=600&fit=crop');
  // await updateCityImage('sankt-peterburg', 'https://images.unsplash.com/photo-1520637836862-4d197d17c767?w=1200&h=600&fit=crop');
  
  console.log('🎉 Готово!');
}

// Запуск если файл выполняется напрямую
if (typeof window === 'undefined') {
  updateAllImages();
}

module.exports = { updateCityImage, updateAllImages }; 