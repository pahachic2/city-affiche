// Скрипт для тестирования JWT авторизации

const BASE_URL = 'http://localhost:3000';

// Тестовые данные
const testUser = {
  email: `test-${Date.now()}@example.com`, // Уникальный email
  name: 'Тестовый Пользователь',
  password: 'testpassword123'
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

// Тест 1: Регистрация пользователя
async function testRegister() {
  console.log('\n🔵 Тест 1: Регистрация пользователя');
  
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
    console.log(`📝 Пользователь: ${data.user.name} (${data.user.email})`);
    console.log(`🔑 Токен получен: ${data.token.substring(0, 20)}...`);
    authToken = data.token;
    return true;
  } else {
    console.log(`❌ Регистрация неуспешна: ${data.error}`);
    return false;
  }
}

// Тест 2: Вход существующего пользователя
async function testLogin() {
  console.log('\n🔵 Тест 2: Вход пользователя');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 200 && data.token) {
    console.log('✅ Вход успешен');
    console.log(`📝 Пользователь: ${data.user.name} (${data.user.email})`);
    console.log(`🔑 Токен получен: ${data.token.substring(0, 20)}...`);
    authToken = data.token;
    return true;
  } else {
    console.log(`❌ Вход неуспешен: ${data.error}`);
    return false;
  }
}

// Тест 3: Получение данных пользователя с токеном
async function testGetMe() {
  console.log('\n🔵 Тест 3: Получение данных пользователя (/api/auth/me)');
  
  if (!authToken) {
    console.log('❌ Нет токена для тестирования');
    return false;
  }

  const { response, data, error } = await makeRequest(`${BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 200 && data.user) {
    console.log('✅ Данные пользователя получены');
    console.log(`📝 Пользователь: ${data.user.name} (${data.user.email})`);
    console.log(`📅 Создан: ${new Date(data.user.createdAt).toLocaleString()}`);
    return true;
  } else {
    console.log(`❌ Ошибка получения данных: ${data.error}`);
    return false;
  }
}

// Тест 4: Попытка доступа без токена
async function testUnauthorized() {
  console.log('\n🔵 Тест 4: Доступ без токена (должен быть запрещен)');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/auth/me`, {
    method: 'GET'
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

// Тест 5: Попытка доступа с неверным токеном
async function testInvalidToken() {
  console.log('\n🔵 Тест 5: Доступ с неверным токеном');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid-token-12345'
    }
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 401) {
    console.log('✅ Неверный токен корректно отклонен');
    console.log(`📝 Ошибка: ${data.error}`);
    return true;
  } else {
    console.log(`❌ Неожиданный ответ: ${response.status}`);
    return false;
  }
}

// Тест 6: Выход из системы
async function testLogout() {
  console.log('\n🔵 Тест 6: Выход из системы');
  
  const { response, data, error } = await makeRequest(`${BASE_URL}/api/auth/logout`, {
    method: 'POST'
  });

  if (error) {
    console.log('❌ Ошибка сети');
    return false;
  }

  if (response.status === 200) {
    console.log('✅ Выход успешен');
    console.log(`📝 Сообщение: ${data.message}`);
    return true;
  } else {
    console.log(`❌ Ошибка выхода: ${data.error}`);
    return false;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('🚀 Запуск тестов JWT авторизации');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Выполняем тесты по порядку
  results.push(await testRegister());
  results.push(await testLogin());
  results.push(await testGetMe());
  results.push(await testUnauthorized());
  results.push(await testInvalidToken());
  results.push(await testLogout());
  
  // Подводим итоги
  console.log('\n' + '='.repeat(50));
  console.log('📊 Результаты тестирования:');
  
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  console.log(`✅ Успешно: ${passed}/${total}`);
  console.log(`❌ Неуспешно: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 Все тесты прошли успешно!');
  } else {
    console.log('⚠️  Некоторые тесты не прошли. Проверьте ошибки выше.');
  }
}

// Запускаем тесты
runTests().catch(console.error); 