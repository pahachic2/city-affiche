const mongoose = require('mongoose');
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

// Проверка состояния подключения
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'отключено',
    1: 'подключено',
    2: 'подключается',
    3: 'отключается'
  };
  
  console.log(`🔗 Состояние подключения: ${states[state]} (${state})`);
  return state === 1;
};

// Создание индексов для всех коллекций
const createIndexes = async () => {
  try {
    console.log('📝 Создание индексов...');
    
    // Получаем все коллекции
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Найдено коллекций: ${collections.length}`);
    
    // Создаем индексы напрямую через коллекции
    const db = mongoose.connection.db;
    
    // Индексы для пользователей
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Индексы созданы для Users');
    } catch (error) {
      console.log('⚠️  Индексы для Users уже существуют');
    }
    
    // Индексы для событий
    try {
      await db.collection('events').createIndex({ city: 1, date: 1 });
      await db.collection('events').createIndex({ category: 1, date: 1 });
      await db.collection('events').createIndex({ authorId: 1 });
      await db.collection('events').createIndex({ date: 1 });
      await db.collection('events').createIndex({ rating: -1 });
      await db.collection('events').createIndex({ city: 1, rating: -1 });
      console.log('✅ Индексы созданы для Events');
    } catch (error) {
      console.log('⚠️  Индексы для Events уже существуют');
    }
    
    // Индексы для городов
    try {
      await db.collection('cities').createIndex({ name: 1 }, { unique: true });
      await db.collection('cities').createIndex({ slug: 1 }, { unique: true });
      await db.collection('cities').createIndex({ name: 'text' });
      console.log('✅ Индексы созданы для Cities');
    } catch (error) {
      console.log('⚠️  Индексы для Cities уже существуют');
    }
    
    // Индексы для сообщений
    try {
      await db.collection('messages').createIndex({ eventId: 1, timestamp: -1 });
      await db.collection('messages').createIndex({ senderId: 1 });
      console.log('✅ Индексы созданы для Messages');
    } catch (error) {
      console.log('⚠️  Индексы для Messages уже существуют');
    }
    
    // Индексы для голосов
    try {
      await db.collection('votes').createIndex({ userId: 1, eventId: 1 }, { unique: true });
      console.log('✅ Индексы созданы для Votes');
    } catch (error) {
      console.log('⚠️  Индексы для Votes уже существуют');
    }
    
    console.log('🎉 Создание индексов завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при создании индексов:', error);
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
async function initDB() {
  console.log('🚀 Инициализация базы данных...\n');
  
  // Проверяем переменные окружения
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI не найдена в .env.local');
    process.exit(1);
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET не найдена в .env.local');
    process.exit(1);
  }
  
  console.log('✅ Переменные окружения найдены');
  
  // Подключаемся к БД
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  // Проверяем подключение
  checkConnection();
  
  // Создаем индексы
  await createIndexes();
  
  // Показываем статистику
  await getDBStats();
  
  console.log('\n🎉 Инициализация завершена успешно!');
}

// Функция очистки БД (для тестов)
async function clearDB() {
  try {
    console.log('🧹 Очистка базы данных...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`✅ Очищена коллекция: ${collection.name}`);
    }
    
    console.log('🎉 База данных очищена!');
    
  } catch (error) {
    console.error('❌ Ошибка при очистке БД:', error);
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clear') {
    connectDB().then(() => {
      clearDB().then(() => {
        mongoose.disconnect();
        console.log('🔌 Отключено от MongoDB');
      });
    });
  } else {
    initDB().then(() => {
      mongoose.disconnect();
      console.log('🔌 Отключено от MongoDB');
    });
  }
}

module.exports = { initDB, clearDB, createIndexes, getDBStats }; 