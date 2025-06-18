// Скрипт диагностики проблем с API и базой данных

async function diagnose() {
  console.log('🔍 Диагностика проблем...\n');
  
  try {
    // 1. Проверяем доступность сервера
    console.log('1️⃣ Проверяем сервер...');
    const serverCheck = await fetch('http://localhost:3000/')
      .catch(err => ({ error: err.message }));
    
    if (serverCheck.error) {
      console.log('❌ Сервер недоступен:', serverCheck.error);
      console.log('💡 Убедитесь что запущен: npm run dev');
      return;
    }
    console.log('✅ Сервер работает');
    
    // 2. Проверяем API cities (GET)
    console.log('\n2️⃣ Проверяем API GET /api/cities...');
    const citiesResponse = await fetch('http://localhost:3000/api/cities');
    const citiesStatus = citiesResponse.status;
    const citiesText = await citiesResponse.text();
    
    console.log(`📊 Статус: ${citiesStatus}`);
    console.log(`📄 Ответ:`, citiesText.substring(0, 200));
    
    if (citiesStatus !== 200) {
      console.log('❌ Проблема с GET API');
      return;
    }
    
    // 3. Пробуем создать тестовый город
    console.log('\n3️⃣ Тестируем создание города...');
    const testCity = {
      name: 'Тест-город',
      imageUrl: 'https://via.placeholder.com/400x200'
    };
    
    const createResponse = await fetch('http://localhost:3000/api/cities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCity),
    });
    
    const createStatus = createResponse.status;
    const createText = await createResponse.text();
    
    console.log(`📊 Статус создания: ${createStatus}`);
    console.log(`📄 Ответ создания:`, createText);
    
    if (createStatus === 201) {
      console.log('✅ Создание города работает!');
      
      // Удаляем тестовый город
      const cityData = JSON.parse(createText);
      await fetch(`http://localhost:3000/api/cities/${cityData.slug}`, {
        method: 'DELETE'
      }).catch(() => {}); // Игнорируем ошибки удаления
      
    } else {
      console.log('❌ Проблема с созданием города');
      console.log('🔍 Возможные причины:');
      console.log('  - Неправильная строка подключения MongoDB');
      console.log('  - Проблемы с моделью City');
      console.log('  - Проблемы с валидацией');
    }
    
    // 4. Создаем настоящие города
    console.log('\n4️⃣ Создаем настоящие города...');
    await createRealCities();
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

async function createRealCities() {
  const cities = [
    {
      name: 'Москва',
      imageUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=600&fit=crop'
    },
    {
      name: 'Санкт-Петербург',
      imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c767?w=1200&h=600&fit=crop'
    },
    {
      name: 'Екатеринбург',
      imageUrl: '/cities/ekaterinburg.jpg'  // Локальный файл
    },
    {
      name: 'Казань',
      imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1200&h=600&fit=crop'
    }
  ];
  
  for (const city of cities) {
    try {
      const response = await fetch('http://localhost:3000/api/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(city),
      });
      
      if (response.ok) {
        console.log(`✅ Город "${city.name}" создан`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Город "${city.name}": ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Город "${city.name}": ${error.message}`);
    }
  }
}

// Запуск диагностики
diagnose(); 