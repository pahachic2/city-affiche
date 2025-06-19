const mongoose = require('mongoose');

// Строка подключения к MongoDB (база city-affiche)
const MONGODB_URI = 'mongodb://GRAFF:G3432664499@localhost:27017/city-affiche?authSource=admin';

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ Подключено к MongoDB');
    console.log(`📊 База данных: ${mongoose.connection.db?.databaseName || 'unknown'}`);
    console.log(`🔗 Хост: ${mongoose.connection.host}:${mongoose.connection.port}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    return false;
  }
};

// Функция для создания коллекции points
async function createPointsCollection() {
  console.log('🚀 Создание коллекции points\n');
  
  // Подключаемся к БД
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Не удалось подключиться к БД');
    return;
  }
  
  try {
    // Проверяем существующие коллекции
    console.log('🔍 Проверка существующих коллекций...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📋 Существующие коллекции:');
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name}`);
    });
    
    // Проверяем, существует ли уже коллекция points
    const pointsExists = collections.some(col => col.name === 'points');
    
    if (pointsExists) {
      console.log('\n⚠️  Коллекция "points" уже существует');
      
      // Показываем количество документов
      const pointsCount = await mongoose.connection.db.collection('points').countDocuments();
      console.log(`📊 Количество документов в points: ${pointsCount}`);
    } else {
      console.log('\n📝 Создание новой коллекции "points"...');
      
      // Создаем коллекцию
      await mongoose.connection.db.createCollection('points');
      console.log('✅ Коллекция "points" успешно создана!');
    }
    
    // Создаем схему для коллекции points (опционально)
    const PointSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        }
      },
      category: {
        type: String,
        default: 'general',
      },
      isActive: {
        type: Boolean,
        default: true,
      }
    }, {
      timestamps: true,
    });
    
    // Создаем индексы для коллекции points
    console.log('\n📝 Создание индексов для коллекции points...');
    
    try {
      await mongoose.connection.db.collection('points').createIndex({ name: 1 });
      console.log('✅ Индекс по полю "name" создан');
      
      await mongoose.connection.db.collection('points').createIndex({ 
        "coordinates.latitude": 1, 
        "coordinates.longitude": 1 
      });
      console.log('✅ Индекс по координатам создан');
      
      await mongoose.connection.db.collection('points').createIndex({ category: 1 });
      console.log('✅ Индекс по полю "category" создан');
      
      await mongoose.connection.db.collection('points').createIndex({ isActive: 1 });
      console.log('✅ Индекс по полю "isActive" создан');
      
    } catch (indexError) {
      console.log('⚠️  Индексы уже существуют или ошибка создания:', indexError.message);
    }
    
    // Проверяем финальное состояние
    console.log('\n🔍 Финальная проверка...');
    const finalCollections = await mongoose.connection.db.listCollections().toArray();
    const pointsCollection = finalCollections.find(col => col.name === 'points');
    
    if (pointsCollection) {
      console.log('✅ Коллекция "points" найдена');
      
      // Показываем количество документов
      const pointsCount = await mongoose.connection.db.collection('points').countDocuments();
      console.log(`📊 Документов в коллекции points: ${pointsCount}`);
    } else {
      console.log('❌ Коллекция "points" не найдена');
    }
    
    // Добавляем тестовую точку
    console.log('\n📍 Добавление тестовой точки...');
    
    const testPoint = {
      name: 'Тестовая точка',
      description: 'Это тестовая точка для проверки коллекции',
      coordinates: {
        latitude: 55.7558,
        longitude: 37.6176
      },
      category: 'test',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Проверяем, есть ли уже тестовые точки
    const existingTestPoints = await mongoose.connection.db.collection('points')
      .countDocuments({ category: 'test' });
    
    if (existingTestPoints === 0) {
      const result = await mongoose.connection.db.collection('points').insertOne(testPoint);
      console.log('✅ Тестовая точка добавлена');
      console.log(`   ID: ${result.insertedId}`);
      console.log(`   Название: ${testPoint.name}`);
      console.log(`   Координаты: ${testPoint.coordinates.latitude}, ${testPoint.coordinates.longitude}`);
    } else {
      console.log('⚠️  Тестовые точки уже существуют');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при создании коллекции:', error);
  } finally {
    // Отключаемся от БД
    await mongoose.disconnect();
    console.log('\n🔌 Отключено от MongoDB');
  }
}

// Функция для просмотра коллекции points
async function viewPointsCollection() {
  console.log('👁️  Просмотр коллекции points\n');
  
  const connected = await connectDB();
  if (!connected) return;
  
  try {
    const points = await mongoose.connection.db.collection('points').find({}).toArray();
    
    if (points.length === 0) {
      console.log('📍 Коллекция points пуста');
    } else {
      console.log(`📍 Найдено точек: ${points.length}\n`);
      
      points.forEach((point, index) => {
        console.log(`${index + 1}. 📍 ${point.name}`);
        console.log(`   📝 Описание: ${point.description || 'Нет'}`);
        console.log(`   🗺️  Координаты: ${point.coordinates?.latitude}, ${point.coordinates?.longitude}`);
        console.log(`   🏷️  Категория: ${point.category}`);
        console.log(`   ✅ Активна: ${point.isActive ? 'Да' : 'Нет'}`);
        console.log(`   📅 Создана: ${point.createdAt}`);
        console.log(`   🆔 ID: ${point._id}`);
        console.log('   ' + '─'.repeat(50));
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка просмотра коллекции:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Основная функция
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'view':
      await viewPointsCollection();
      break;
      
    default:
      await createPointsCollection();
  }
}

// Запуск
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createPointsCollection, viewPointsCollection }; 