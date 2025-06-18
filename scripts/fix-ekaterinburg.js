// Быстрое исправление изображения Екатеринбурга

async function fixEkaterinburgImage() {
  try {
    console.log('🔧 Исправляем изображение Екатеринбурга...');
    
    // Сначала проверяем, запущен ли сервер
    const healthCheck = await fetch('http://localhost:3000/api/cities')
      .catch(() => null);
    
    if (!healthCheck) {
      console.log('❌ Сервер не запущен! Запустите: npm run dev');
      return;
    }
    
    // Получаем текущие данные города
    const cityResponse = await fetch('http://localhost:3000/api/cities/ekaterinburg');
    
    if (!cityResponse.ok) {
      console.log('❌ Город Екатеринбург не найден в базе данных');
      console.log('💡 Сначала добавьте города: node scripts/seed-cities.js');
      return;
    }
    
    const cityData = await cityResponse.json();
    console.log('📋 Текущее изображение:', cityData.imageUrl);
    
    // Обновляем на локальный путь
    const updateResponse = await fetch('http://localhost:3000/api/cities/ekaterinburg', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imageUrl: '/cities/ekaterinburg.jpg' 
      }),
    });
    
    if (updateResponse.ok) {
      console.log('✅ Изображение успешно обновлено на локальный файл!');
      console.log('🔄 Обновите страницу в браузере');
    } else {
      const error = await updateResponse.json();
      console.log('❌ Ошибка обновления:', error.error);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Сервер не запущен! Запустите: npm run dev');
    }
  }
}

// Запуск
fixEkaterinburgImage(); 