const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Подключение к MongoDB для прямых проверок
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Подключено к MongoDB для тестов');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    return false;
  }
};

// Схема пользователя для прямых запросов к БД
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const BASE_URL = 'http://localhost:3000';

// Генерируем уникальный email для тестов
const testEmail = `test-${Date.now()}@example.com`;
const testUser = {
  email: testEmail,
  name: 'Test User',
  password: 'testpassword123'
};

let authToken = '';
let userId = '';

async function testRegister() {
  console.log('\n🧪 Тест 1: Регистрация пользователя');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Регистрация успешна');
      console.log(`   Пользователь: ${data.user.name} (${data.user.email})`);
      console.log(`   ID: ${data.user._id}`);
      console.log(`   Токен получен: ${data.token ? 'Да' : 'Нет'}`);
      
      authToken = data.token;
      userId = data.user._id;
      
      // Проверяем, что пользователь реально сохранен в БД
      const dbUser = await User.findById(userId);
      if (dbUser) {
        console.log('✅ Пользователь найден в БД');
        console.log(`   Email в БД: ${dbUser.email}`);
        console.log(`   Создан: ${dbUser.createdAt}`);
      } else {
        console.log('❌ Пользователь НЕ найден в БД');
      }
      
      return true;
    } else {
      console.log('❌ Ошибка регистрации:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🧪 Тест 2: Авторизация');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Авторизация успешна');
      console.log(`   Пользователь: ${data.user.name}`);
      console.log(`   Токен получен: ${data.token ? 'Да' : 'Нет'}`);
      
      // Обновляем токен
      authToken = data.token;
      return true;
    } else {
      console.log('❌ Ошибка авторизации:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
    return false;
  }
}

async function testGetMe() {
  console.log('\n🧪 Тест 3: Получение данных пользователя');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Данные получены');
      console.log(`   ID: ${data.user._id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Имя: ${data.user.name}`);
      return true;
    } else {
      console.log('❌ Ошибка получения данных:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
    return false;
  }
}

async function testUnauthorized() {
  console.log('\n🧪 Тест 4: Неавторизованный доступ');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      // Намеренно не передаем токен
    });

    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Неавторизованный доступ корректно заблокирован');
      console.log(`   Ошибка: ${data.error}`);
      return true;
    } else {
      console.log('❌ Неавторизованный доступ НЕ заблокирован');
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
    return false;
  }
}

async function testInvalidToken() {
  console.log('\n🧪 Тест 5: Неверный токен');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-here',
      },
    });

    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ Неверный токен корректно отклонен');
      console.log(`   Ошибка: ${data.error}`);
      return true;
    } else {
      console.log('❌ Неверный токен НЕ отклонен');
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n🧪 Тест 6: Выход из системы');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Выход выполнен успешно');
      console.log(`   Сообщение: ${data.message}`);
      return true;
    } else {
      console.log('❌ Ошибка выхода:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка запроса:', error.message);
    return false;
  }
}

// Тест персистентности данных
async function testDataPersistence() {
  console.log('\n🧪 Тест 7: Персистентность данных');
  
  try {
    // Проверяем, что пользователь все еще в БД
    const dbUser = await User.findById(userId);
    if (dbUser) {
      console.log('✅ Данные сохранены в БД');
      console.log(`   Email: ${dbUser.email}`);
      console.log(`   Создан: ${dbUser.createdAt.toISOString()}`);
      
      // Проверяем, что пароль захеширован
      if (dbUser.password !== testUser.password) {
        console.log('✅ Пароль корректно захеширован');
      } else {
        console.log('❌ Пароль НЕ захеширован!');
      }
      
      return true;
    } else {
      console.log('❌ Пользователь НЕ найден в БД');
      return false;
    }
  } catch (error) {
    console.log('❌ Ошибка проверки БД:', error.message);
    return false;
  }
}

// Очистка тестовых данных
async function cleanup() {
  console.log('\n🧹 Очистка тестовых данных...');
  
  try {
    if (userId) {
      await User.findByIdAndDelete(userId);
      console.log('✅ Тестовый пользователь удален из БД');
    }
  } catch (error) {
    console.log('❌ Ошибка очистки:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Запуск тестов авторизации с реальной БД\n');
  
  // Подключаемся к БД
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Не удалось подключиться к БД. Тесты отменены.');
    return;
  }
  
  const tests = [
    testRegister,
    testLogin,
    testGetMe,
    testUnauthorized,
    testInvalidToken,
    testLogout,
    testDataPersistence
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Небольшая пауза между тестами
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Результаты тестов:');
  console.log(`✅ Пройдено: ${passed}`);
  console.log(`❌ Провалено: ${failed}`);
  console.log(`📈 Успешность: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  // Очищаем тестовые данные
  await cleanup();
  
  // Отключаемся от БД
  await mongoose.disconnect();
  console.log('\n🔌 Отключено от MongoDB');
  
  if (failed === 0) {
    console.log('\n🎉 Все тесты пройдены успешно!');
  } else {
    console.log('\n⚠️  Некоторые тесты провалились. Проверьте логи выше.');
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 