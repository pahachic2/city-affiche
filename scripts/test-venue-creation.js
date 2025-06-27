const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI не найден в переменных окружения');
  process.exit(1);
}

async function testVenueCreation() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Подключение к MongoDB...');
    await client.connect();
    
    const db = client.db();
    console.log(`✅ Подключено к базе данных: ${db.databaseName}`);
    
    // Находим первого пользователя для тестирования
    const usersCollection = db.collection('users');
    const testUser = await usersCollection.findOne({});
    
    if (!testUser) {
      console.error('❌ Пользователи не найдены. Сначала создайте пользователя.');
      return;
    }
    
    console.log(`👤 Используем пользователя: ${testUser.name} (${testUser.email})`);
    
    // Тестовые данные заведения
    const testVenues = [
      {
        name: 'Кафе Пушкин',
        slug: 'cafe-pushkin',
        description: 'Уютное кафе в центре города с русской кухней и атмосферой 19 века. Идеальное место для романтических свиданий и деловых встреч.',
        images: [],
        imageTypes: [],
        address: 'Тверской бульвар, 26А',
        city: 'Москва',
        category: 'Кафе',
        authorId: testUser._id,
        messages: [],
        upvotes: 5,
        downvotes: 1,
        rating: 4,
        commentsCount: 0,
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Белый кролик',
        slug: 'white-rabbit',
        description: 'Ресторан высокой кухни с панорамным видом на Москву. Авторская кухня от шеф-повара мирового уровня.',
        images: [],
        imageTypes: [],
        address: 'Смоленская площадь, 3',
        city: 'Москва',
        category: 'Рестораны',
        authorId: testUser._id,
        messages: [],
        upvotes: 15,
        downvotes: 2,
        rating: 13,
        commentsCount: 0,
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Эрмитаж',
        slug: 'hermitage',
        description: 'Государственный Эрмитаж — крупнейший в России и один из крупнейших в мире художественных и культурно-исторических музеев.',
        images: [],
        imageTypes: [],
        address: 'Дворцовая площадь, 2',
        city: 'Санкт-Петербург',
        category: 'Музеи',
        authorId: testUser._id,
        messages: [],
        upvotes: 25,
        downvotes: 0,
        rating: 25,
        commentsCount: 0,
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const venuesCollection = db.collection('venues');
    
    // Проверяем, существуют ли уже тестовые заведения
    for (const venue of testVenues) {
      const existing = await venuesCollection.findOne({ 
        city: venue.city, 
        slug: venue.slug 
      });
      
      if (existing) {
        console.log(`⚠️  Заведение "${venue.name}" уже существует`);
        continue;
      }
      
      // Создаем заведение
      const result = await venuesCollection.insertOne(venue);
      console.log(`✅ Создано заведение: "${venue.name}" (ID: ${result.insertedId})`);
    }
    
    // Показываем статистику
    const totalVenues = await venuesCollection.countDocuments();
    console.log(`\n📊 Статистика:`);
    console.log(`   Всего заведений: ${totalVenues}`);
    
    // Показываем заведения по городам
    const venuesByCity = await venuesCollection.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          venues: { $push: '$name' }
        }
      }
    ]).toArray();
    
    console.log(`\n🏙️  Заведения по городам:`);
    for (const cityData of venuesByCity) {
      console.log(`   ${cityData._id}: ${cityData.count} заведений`);
      cityData.venues.forEach(name => {
        console.log(`      • ${name}`);
      });
    }
    
    console.log('\n🎉 Тестирование создания заведений завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Соединение с базой данных закрыто');
  }
}

// Запуск скрипта
testVenueCreation(); 