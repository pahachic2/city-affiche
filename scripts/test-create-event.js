// Скрипт для тестирования создания мероприятий

const BASE_URL = 'http://localhost:3001';

// Тестовые данные
const testUser = {
  email: `test-event-${Date.now()}@example.com`,
  name: 'Организатор Мероприятий',
  password: 'testpass123'
};

const testEvent = {
  title: 'Тестовый концерт в парке',
  description: 'Замечательный концерт под открытым небом с участием местных музыкантов.',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
  city: 'Москва',
  category: 'Концерты',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // через неделю
  isOnline: false
};

let authToken = null;

// Функция для выполнения HTTP запросов
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error(`❌ Ошибка запроса к ${url}:`, error.message);
    return { error: error.message };
  }
}

// Тест 1: Регистрация тестового пользователя
async function testRegister() {
  console.log('\n🔵 Тест 1: Регистрация организатора');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 201 && data.token) {
    console.log('✅ Регистрация успешна');
    console.log(`📝 Пользователь: ${data.user.name}`);
    authToken = data.token;
    return true;
  } else {
    console.log(`❌ Регистрация неуспешна: ${data.error}`);
    return false;
  }
}

// Тест 2: Создание мероприятия с авторизацией
async function testCreateEvent() {
  console.log('\n🔵 Тест 2: Создание мероприятия (авторизованный)');
  
  if (!authToken) {
    console.log('❌ Нет токена авторизации');
    return false;
  }

  const { response, data, error } = await makeRequest(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(testEvent)
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 201 && data._id) {
    console.log('✅ Мероприятие создано успешно');
    console.log(`📝 Название: ${data.title}`);
    console.log(`🏙️ Город: ${data.city}`);
    console.log(`📅 Дата: ${new Date(data.date).toLocaleString()}`);
    console.log(`👤 Автор: ${data.authorId?.name || 'Неизвестно'}`);
    return true;
  } else {
    console.log(`❌ Ошибка создания: ${data.error}`);
    return false;
  }
}

// Тест 3: Попытка создания без авторизации
async function testCreateEventUnauthorized() {
  console.log('\n🔵 Тест 3: Создание мероприятия (неавторизованный)');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/events`, {
    method: 'POST',
    body: JSON.stringify(testEvent)
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 401) {
    console.log('✅ Доступ корректно запрещен');
    console.log(`📝 Ошибка: ${data.error}`);
    return true;
  } else {
    console.log(`❌ Неожиданный ответ: ${response.status}`);
    return false;
  }
}

// Тест 4: Создание с неверным токеном
async function testCreateEventInvalidToken() {
  console.log('\n🔵 Тест 4: Создание с неверным токеном');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer invalid-token-12345'
    },
    body: JSON.stringify(testEvent)
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 401 || response.status === 403) {
    console.log('✅ Неверный токен корректно отклонен');
    console.log(`📝 Ошибка: ${data.error}`);
    return true;
  } else {
    console.log(`❌ Неожиданный ответ: ${response.status}`);
    return false;
  }
}

// Тест 5: Валидация полей
async function testCreateEventValidation() {
  console.log('\n🔵 Тест 5: Валидация обязательных полей');
  
  const incompleteEvent = {
    title: '', // пустое название
    description: '',
    city: '',
    category: '',
    date: ''
  };

  const { response, data, error } = await makeRequest(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(incompleteEvent)
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 400) {
    console.log('✅ Валидация работает корректно');
    console.log(`📝 Ошибка: ${data.error}`);
    return true;
  } else {
    console.log(`❌ Валидация не сработала: ${response.status}`);
    return false;
  }
}

// Тест 6: Получение созданных мероприятий
async function testGetEvents() {
  console.log('\n🔵 Тест 6: Получение списка мероприятий');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/events?city=Москва`);

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 200 && data.events) {
    console.log('✅ Список мероприятий получен');
    console.log(`📊 Найдено мероприятий: ${data.events.length}`);
    
    // Ищем наше тестовое мероприятие
    const ourEvent = data.events.find(event => event.title === testEvent.title);
    if (ourEvent) {
      console.log(`✅ Наше мероприятие найдено в списке`);
    }
    
    return true;
  } else {
    console.log(`❌ Ошибка получения списка: ${data.error}`);
    return false;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Запуск тестов создания мероприятий');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Выполняем тесты по порядку
  results.push(await testRegister());
  results.push(await testCreateEvent());
  results.push(await testCreateEventUnauthorized());
  results.push(await testCreateEventInvalidToken());
  results.push(await testCreateEventValidation());
  results.push(await testGetEvents());
  
  // Подводим итоги
  console.log('\n' + '='.repeat(50));
  console.log('📊 Результаты тестирования:');
  
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  console.log(`✅ Успешно: ${passed}/${total}`);
  console.log(`❌ Неуспешно: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 Все тесты прошли успешно!');
    console.log('🔗 Проверьте в браузере: http://localhost:3001/create-event');
  } else {
    console.log('⚠️  Некоторые тесты не прошли. Проверьте ошибки выше.');
  }
}

// Запускаем тесты
runTests().catch(console.error); 