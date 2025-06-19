const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Подключение к MongoDB для проверки
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    return false;
  }
};

// Схема пользователя для проверки
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Функция для тестирования регистрации
async function testRegistration() {
  console.log('🚀 Тестирование регистрации пользователя через API\n');
  
  // Подключаемся к БД для проверки
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Не удалось подключиться к БД');
    return;
  }
  
  // Считаем пользователей до регистрации
  const usersBefore = await User.countDocuments();
  console.log(`📊 Пользователей в БД до регистрации: ${usersBefore}`);
  
  // Данные для регистрации
  const testUser = {
    email: `frontend-test-${Date.now()}@example.com`,
    name: 'Frontend Тест',
    password: 'testpass123'
  };
  
  console.log('📝 Данные для регистрации:');
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Name: ${testUser.name}`);
  console.log(`   Password: ${testUser.password}`);
  
  try {
    console.log('\n🌐 Отправка запроса на регистрацию...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    console.log(`📡 Статус ответа: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('📄 Ответ от сервера:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Регистрация через API успешна!');
      console.log(`   ID пользователя: ${data.user._id}`);
      console.log(`   Токен получен: ${data.token ? 'Да' : 'Нет'}`);
      
      // Проверяем в БД
      console.log('\n🔍 Проверка в базе данных...');
      const dbUser = await User.findById(data.user._id);
      
      if (dbUser) {
        console.log('✅ Пользователь найден в БД!');
        console.log(`   Email в БД: ${dbUser.email}`);
        console.log(`   Имя в БД: ${dbUser.name}`);
        console.log(`   Создан: ${dbUser.createdAt}`);
        console.log(`   Пароль захеширован: ${dbUser.password !== testUser.password ? 'Да' : 'Нет'}`);
      } else {
        console.log('❌ Пользователь НЕ найден в БД!');
      }
      
      // Считаем пользователей после регистрации
      const usersAfter = await User.countDocuments();
      console.log(`\n📊 Пользователей в БД после регистрации: ${usersAfter}`);
      console.log(`📈 Добавлено пользователей: ${usersAfter - usersBefore}`);
      
      // Тестируем авторизацию с новым пользователем
      console.log('\n🔐 Тестирование авторизации...');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Авторизация успешна!');
        console.log(`   Пользователь: ${loginData.user.name}`);
      } else {
        console.log('❌ Ошибка авторизации:', loginData.error);
      }
      
    } else {
      console.log('\n❌ Ошибка регистрации:');
      console.log(`   Сообщение: ${data.error}`);
      
      // Дополнительная диагностика
      if (data.error?.includes('email')) {
        console.log('   Возможная причина: Проблема с email адресом');
      }
      if (data.error?.includes('поля')) {
        console.log('   Возможная причина: Не все поля заполнены');
      }
    }
    
  } catch (error) {
    console.log('\n❌ Ошибка сетевого запроса:', error.message);
    console.log('   Возможные причины:');
    console.log('   - Сервер не запущен');
    console.log('   - Неправильный порт');
    console.log('   - Проблемы с сетью');
  }
  
  // Отключаемся от БД
  await mongoose.disconnect();
  console.log('\n🔌 Отключено от MongoDB');
}

// Функция для проверки текущего состояния БД
async function checkCurrentState() {
  console.log('🔍 Проверка текущего состояния БД...\n');
  
  const connected = await connectDB();
  if (!connected) return;
  
  const totalUsers = await User.countDocuments();
  console.log(`📊 Всего пользователей: ${totalUsers}`);
  
  if (totalUsers > 0) {
    console.log('\n👥 Последние 5 пользователей:');
    const recentUsers = await User.find({}, 'email name createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      console.log(`      Создан: ${user.createdAt}`);
    });
  }
  
  await mongoose.disconnect();
}

// Основная функция
async function main() {
  const action = process.argv[2];
  
  if (action === 'check') {
    await checkCurrentState();
  } else {
    await testRegistration();
  }
}

// Запуск
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testRegistration, checkCurrentState }; 