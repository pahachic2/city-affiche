const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Подключено к MongoDB');
    console.log(`📊 База данных: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    return false;
  }
};

// Схема пользователя (точно такая же как в модели)
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Функция для проверки коллекции пользователей
async function checkUsersCollection() {
  console.log('\n🔍 Проверка коллекции пользователей...');
  
  try {
    // Проверяем существование коллекции
    const collections = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      console.log('⚠️  Коллекция "users" не существует');
      
      // Создаем коллекцию
      await mongoose.connection.db.createCollection('users');
      console.log('✅ Коллекция "users" создана');
    } else {
      console.log('✅ Коллекция "users" существует');
    }
    
    // Проверяем количество документов
    const userCount = await User.countDocuments();
    console.log(`📊 Количество пользователей: ${userCount}`);
    
    // Показываем всех пользователей
    if (userCount > 0) {
      const users = await User.find({}, 'email name createdAt').lean();
      console.log('👥 Существующие пользователи:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.createdAt}`);
      });
    }
    
    return userCount;
    
  } catch (error) {
    console.error('❌ Ошибка проверки коллекции:', error);
    return -1;
  }
}

// Функция для создания тестового пользователя
async function createTestUser() {
  console.log('\n👤 Создание тестового пользователя...');
  
  const testUser = {
    email: `test-user-${Date.now()}@example.com`,
    name: 'Тестовый Пользователь',
    password: 'testpassword123'
  };
  
  try {
    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(testUser.password, saltRounds);
    
    console.log('🔐 Пароль захеширован');
    
    // Создаем пользователя
    const newUser = new User({
      email: testUser.email,
      name: testUser.name,
      password: hashedPassword,
    });
    
    console.log('📝 Объект пользователя создан');
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Password hash: ${newUser.password.substring(0, 20)}...`);
    
    // Сохраняем в БД
    console.log('💾 Сохранение в базу данных...');
    const savedUser = await newUser.save();
    
    console.log('✅ Пользователь успешно сохранен!');
    console.log(`   ID: ${savedUser._id}`);
    console.log(`   Создан: ${savedUser.createdAt}`);
    
    // Проверяем, что пользователь действительно в БД
    const foundUser = await User.findById(savedUser._id);
    if (foundUser) {
      console.log('✅ Пользователь найден в БД после сохранения');
    } else {
      console.log('❌ Пользователь НЕ найден в БД после сохранения');
    }
    
    return savedUser;
    
  } catch (error) {
    console.error('❌ Ошибка создания пользователя:', error);
    
    // Дополнительная диагностика ошибок
    if (error.code === 11000) {
      console.error('   Причина: Пользователь с таким email уже существует');
    } else if (error.name === 'ValidationError') {
      console.error('   Причина: Ошибка валидации данных');
      console.error('   Детали:', error.errors);
    } else if (error.name === 'MongoNetworkError') {
      console.error('   Причина: Проблема с подключением к MongoDB');
    }
    
    return null;
  }
}

// Функция для тестирования через API
async function testAPIRegistration() {
  console.log('\n🌐 Тестирование регистрации через API...');
  
  const testUser = {
    email: `api-test-${Date.now()}@example.com`,
    name: 'API Тест Пользователь',
    password: 'apitest123'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API регистрация успешна');
      console.log(`   Пользователь: ${data.user.name} (${data.user.email})`);
      console.log(`   ID: ${data.user._id}`);
      
      // Проверяем в БД
      const dbUser = await User.findById(data.user._id);
      if (dbUser) {
        console.log('✅ Пользователь найден в БД через API');
      } else {
        console.log('❌ Пользователь НЕ найден в БД через API');
      }
      
      return data.user;
    } else {
      console.log('❌ API регистрация неуспешна:', data.error);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Ошибка API запроса:', error.message);
    return null;
  }
}

// Основная функция тестирования
async function runDiagnostics() {
  console.log('🚀 Диагностика создания пользователей\n');
  
  // Подключаемся к БД
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Не удалось подключиться к БД. Тесты отменены.');
    return;
  }
  
  // Проверяем коллекцию
  const userCount = await checkUsersCollection();
  
  // Создаем тестового пользователя напрямую
  const directUser = await createTestUser();
  
  // Тестируем через API (нужно запустить сервер)
  const apiUser = await testAPIRegistration();
  
  // Финальная проверка
  console.log('\n📊 Финальная статистика:');
  const finalCount = await User.countDocuments();
  console.log(`   Пользователей в БД: ${finalCount}`);
  console.log(`   Было добавлено: ${finalCount - (userCount >= 0 ? userCount : 0)}`);
  
  // Отключаемся от БД
  await mongoose.disconnect();
  console.log('\n🔌 Отключено от MongoDB');
  
  if (directUser || apiUser) {
    console.log('\n🎉 Создание пользователей работает!');
  } else {
    console.log('\n⚠️  Есть проблемы с созданием пользователей');
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

module.exports = { runDiagnostics, createTestUser, checkUsersCollection }; 