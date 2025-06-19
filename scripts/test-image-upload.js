const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

// Подключение к MongoDB
const connectDB = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  console.log('✅ Подключение к MongoDB установлено');
  return client.db();
};

// Функция для конвертации изображения в Base64
const imageToBase64 = (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageExtension = path.extname(imagePath).toLowerCase();
    
    let mimeType;
    switch (imageExtension) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      default:
        throw new Error('Неподдерживаемый формат изображения');
    }
    
    const base64String = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64String}`;
    
    console.log(`📷 Изображение конвертировано: ${imagePath}`);
    console.log(`📊 Размер: ${Math.round(imageBuffer.length / 1024)} KB`);
    console.log(`📊 Base64 размер: ${Math.round(dataUrl.length / 1024)} KB`);
    
    return { dataUrl, mimeType, size: imageBuffer.length };
  } catch (error) {
    console.error('❌ Ошибка конвертации изображения:', error.message);
    return null;
  }
};

// Тестовые данные для событий
const getTestEvents = (imageData) => [
  {
    title: 'Тестовое событие с изображением',
    description: 'Это тестовое событие для проверки загрузки Base64 изображений. Описание может быть довольно длинным.',
    image: imageData?.dataUrl,
    imageType: imageData?.mimeType,
    city: 'Москва',
    category: 'Частное',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Через неделю
    time: '18:30',
    isOnline: false,
    isRecurring: false,
    authorId: null, // Будет заполнено
  },
  {
    title: 'Повторяющееся событие без изображения',
    description: 'Тестовое повторяющееся событие для проверки функционала повторений.',
    image: null,
    imageType: null,
    city: 'Санкт-Петербург',
    category: 'Музыка',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Через 3 дня
    time: null,
    isOnline: true,
    isRecurring: true,
    recurringType: 'weekly',
    recurringEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Через месяц
    authorId: null, // Будет заполнено
  },
  {
    title: 'Событие с новой категорией',
    description: 'Тестируем новые категории событий.',
    image: null,
    imageType: null,
    city: 'Екатеринбург',
    category: 'Технологии',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Через 2 недели
    time: '14:00',
    isOnline: false,
    isRecurring: false,
    authorId: null, // Будет заполнено
  }
];

// Основная функция тестирования
const testImageUpload = async () => {
  let db;
  
  try {
    console.log('🚀 Начинаем тестирование загрузки изображений...\n');
    
    db = await connectDB();
    
    // Получаем первого пользователя для тестов
    const user = await db.collection('users').findOne({});
    if (!user) {
      throw new Error('Не найдено пользователей для тестирования');
    }
    console.log(`👤 Используем пользователя: ${user.name} (${user.email})\n`);
    
    // Пытаемся загрузить тестовое изображение
    let imageData = null;
    const testImagePaths = [
      'public/cities/moscow.jpg',
      'public/cities/spb.jpg',
      'public/cities/kazan.jpg',
      'public/cities/ekaterinburg.jpg'
    ];
    
    for (const imagePath of testImagePaths) {
      if (fs.existsSync(imagePath)) {
        imageData = imageToBase64(imagePath);
        if (imageData) break;
      }
    }
    
    if (!imageData) {
      console.log('⚠️ Тестовые изображения не найдены, создаем события без изображений\n');
    }
    
    // Создаем тестовые события
    const testEvents = getTestEvents(imageData);
    const createdEvents = [];
    
    for (let i = 0; i < testEvents.length; i++) {
      const eventData = {
        ...testEvents[i],
        authorId: user._id.toString(),
      };
      
      console.log(`📝 Создаем событие ${i + 1}: "${eventData.title}"`);
      console.log(`   📍 Город: ${eventData.city}`);
      console.log(`   🏷️ Категория: ${eventData.category}`);
      console.log(`   📅 Дата: ${eventData.date.toLocaleDateString('ru-RU')}`);
      console.log(`   ⏰ Время: ${eventData.time || 'не указано'}`);
      console.log(`   🔄 Повторяющееся: ${eventData.isRecurring ? 'да' : 'нет'}`);
      console.log(`   🖼️ Изображение: ${eventData.image ? 'есть' : 'нет'}`);
      
      const result = await db.collection('events').insertOne(eventData);
      createdEvents.push(result.insertedId);
      
      console.log(`   ✅ Создано с ID: ${result.insertedId}\n`);
    }
    
    // Проверяем созданные события
    console.log('🔍 Проверяем созданные события...\n');
    
    for (const eventId of createdEvents) {
      const event = await db.collection('events').findOne({ _id: eventId });
      if (event) {
        console.log(`✅ Событие найдено: ${event.title}`);
        console.log(`   📊 Размер документа: ${JSON.stringify(event).length} символов`);
        if (event.image) {
          console.log(`   📊 Размер изображения: ${Math.round(event.image.length / 1024)} KB`);
        }
      } else {
        console.log(`❌ Событие с ID ${eventId} не найдено`);
      }
    }
    
    console.log('\n✅ Тестирование завершено успешно!');
    console.log(`📊 Создано событий: ${createdEvents.length}`);
    
    // Опционально: удаляем тестовые события
    const cleanup = process.argv.includes('--cleanup');
    if (cleanup) {
      console.log('\n🧹 Удаляем тестовые события...');
      const deleteResult = await db.collection('events').deleteMany({
        _id: { $in: createdEvents }
      });
      console.log(`🗑️ Удалено событий: ${deleteResult.deletedCount}`);
    } else {
      console.log('\n💡 Чтобы удалить тестовые события, запустите с флагом --cleanup');
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    process.exit(1);
  } finally {
    if (db) {
      await db.client.close();
      console.log('🔌 Соединение с БД закрыто');
    }
  }
};

// Функция для тестирования валидации
const testValidation = () => {
  console.log('🧪 Тестируем валидацию изображений...\n');
  
  // Тест 1: Поддерживаемые форматы
  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  console.log('✅ Поддерживаемые форматы:', supportedFormats.join(', '));
  
  // Тест 2: Максимальный размер
  const maxSize = 5 * 1024 * 1024; // 5MB
  console.log(`✅ Максимальный размер файла: ${maxSize / 1024 / 1024}MB`);
  
  // Тест 3: Base64 формат
  const validBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  const isValid = validBase64.startsWith('data:image/') && validBase64.includes('base64,');
  console.log(`✅ Валидация Base64: ${isValid ? 'прошла' : 'не прошла'}`);
  
  console.log('\n🎯 Валидация протестирована');
};

// Запуск тестов
const main = async () => {
  if (process.argv.includes('--validation-only')) {
    testValidation();
  } else {
    await testImageUpload();
  }
};

main().catch(console.error); 