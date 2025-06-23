const mongoose = require('mongoose');

// Функция для проверки переменных окружения
function validateEnvironment() {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Отсутствуют обязательные переменные окружения:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Добавьте эти переменные в настройки Vercel или .env.local');
    process.exit(1);
  }

  // Проверяем безопасность JWT_SECRET
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET должен быть не менее 32 символов для безопасности');
  }

  console.log('✅ Все обязательные переменные окружения найдены');
}

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Подключено к MongoDB');
    console.log(`📊 База данных: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    return false;
  }
};

// Создание индексов для оптимизации
const createIndexes = async () => {
  try {
    console.log('📝 Создание индексов...');
    
    const db = mongoose.connection.db;
    
    // Индексы для коллекции events
    await db.collection('events').createIndex({ city: 1, date: 1 });
    await db.collection('events').createIndex({ category: 1 });
    await db.collection('events').createIndex({ authorId: 1 });
    await db.collection('events').createIndex({ date: 1 });
    
    // Индексы для коллекции users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Индексы для коллекции cities
    await db.collection('cities').createIndex({ slug: 1 }, { unique: true });
    await db.collection('cities').createIndex({ name: 1 });
    
    // Индексы для коллекции votes
    await db.collection('votes').createIndex({ userId: 1, eventId: 1 }, { unique: true });
    await db.collection('votes').createIndex({ eventId: 1 });
    
    // Индексы для коллекции messages
    await db.collection('messages').createIndex({ eventId: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ userId: 1 });
    
    console.log('✅ Индексы созданы успешно');
  } catch (error) {
    console.error('❌ Ошибка создания индексов:', error.message);
  }
};

// Проверка и создание базовых данных
const seedBasicData = async () => {
  try {
    console.log('🌱 Проверка базовых данных...');
    
    const db = mongoose.connection.db;
    
    // Проверяем наличие городов
    const citiesCount = await db.collection('cities').countDocuments();
    
    if (citiesCount === 0) {
      console.log('📍 Создание базовых городов...');
      
      const basicCities = [
        {
          name: 'Москва',
          slug: 'moskva',
          imageUrl: '/cities/moscow.jpg',
          eventsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Санкт-Петербург',
          slug: 'sankt-peterburg',
          imageUrl: '/cities/spb.jpg',
          eventsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Екатеринбург',
          slug: 'ekaterinburg',
          imageUrl: '/cities/ekaterinburg.jpg',
          eventsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Казань',
          slug: 'kazan',
          imageUrl: '/cities/kazan.jpg',
          eventsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await db.collection('cities').insertMany(basicCities);
      console.log('✅ Базовые города созданы');
    } else {
      console.log(`✅ Найдено ${citiesCount} городов в базе`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка создания базовых данных:', error.message);
  }
};

// Получение статистики базы данных
const getDBStats = async () => {
  try {
    console.log('\n📊 Статистика базы данных:');
    
    const collections = ['users', 'events', 'cities', 'messages', 'votes'];
    
    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`   ${collectionName}: ${count} документов`);
      } catch (error) {
        console.log(`   ${collectionName}: коллекция не существует`);
      }
    }
    
    // Общая статистика БД
    const stats = await mongoose.connection.db.stats();
    console.log(`\n💾 Размер БД: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📁 Коллекций: ${stats.collections}`);
    console.log(`📄 Объектов: ${stats.objects}`);
    
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
  }
};

// Основная функция инициализации
async function initProduction() {
  console.log('🚀 Инициализация продакшен базы данных...\n');
  
  // Проверяем переменные окружения
  validateEnvironment();
  
  // Подключаемся к БД
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  // Создаем индексы
  await createIndexes();
  
  // Создаем базовые данные
  await seedBasicData();
  
  // Показываем статистику
  await getDBStats();
  
  console.log('\n🎉 Инициализация продакшена завершена успешно!');
  console.log('\n📝 Следующие шаги:');
  console.log('   1. Убедитесь что все переменные окружения настроены в Vercel');
  console.log('   2. Проверьте работу приложения');
  console.log('   3. Настройте мониторинг и логирование');
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  initProduction().then(() => {
    mongoose.disconnect();
    console.log('🔌 Отключено от MongoDB');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Ошибка инициализации:', error);
    mongoose.disconnect();
    process.exit(1);
  });
}

module.exports = { initProduction, validateEnvironment }; 