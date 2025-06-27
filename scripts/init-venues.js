const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI не найден в переменных окружения');
  process.exit(1);
}

async function initVenuesCollection() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Подключение к MongoDB...');
    await client.connect();
    
    const db = client.db();
    console.log(`✅ Подключено к базе данных: ${db.databaseName}`);
    
    // Проверяем существование коллекции venues
    const collections = await db.listCollections({ name: 'venues' }).toArray();
    
    if (collections.length > 0) {
      console.log('📋 Коллекция venues already exists');
    } else {
      console.log('🆕 Создаем коллекцию venues...');
      await db.createCollection('venues');
    }
    
    // Создаем индексы для коллекции venues
    console.log('📊 Создаем индексы для venues...');
    
    const venuesCollection = db.collection('venues');
    
    // Уникальность slug в рамках города
    await venuesCollection.createIndex(
      { city: 1, slug: 1 }, 
      { unique: true, name: 'city_slug_unique' }
    );
    
    // Индексы для поиска и сортировки
    await venuesCollection.createIndex(
      { city: 1, category: 1 },
      { name: 'city_category' }
    );
    
    await venuesCollection.createIndex(
      { city: 1, rating: -1 },
      { name: 'city_rating' }
    );
    
    await venuesCollection.createIndex(
      { authorId: 1 },
      { name: 'author' }
    );
    
    await venuesCollection.createIndex(
      { rating: -1 },
      { name: 'rating' }
    );
    
    await venuesCollection.createIndex(
      { createdAt: -1 },
      { name: 'created_date' }
    );
    
    console.log('✅ Индексы успешно созданы');
    
    // Проверяем количество документов
    const count = await venuesCollection.countDocuments();
    console.log(`📈 Заведений в базе: ${count}`);
    
    console.log('🎉 Инициализация коллекции venues завершена!');
    console.log('\n📝 Создано:');
    console.log('   • Коллекция venues');
    console.log('   • Индекс уникальности slug по городам');
    console.log('   • Индексы для поиска и сортировки');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Соединение с базой данных закрыто');
  }
}

// Запуск скрипта
initVenuesCollection(); 