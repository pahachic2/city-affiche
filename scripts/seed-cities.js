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
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Схема города
const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  eventsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

CitySchema.index({ name: 'text' });
CitySchema.index({ slug: 1 });

const City = mongoose.models.City || mongoose.model('City', CitySchema);

// Данные городов
const cities = [
  {
    name: 'Москва',
    slug: 'moscow',
    imageUrl: '/cities/moscow.jpg',
    eventsCount: 0,
  },
  {
    name: 'Санкт-Петербург',
    slug: 'spb',
    imageUrl: '/cities/spb.jpg',
    eventsCount: 0,
  },
  {
    name: 'Казань',
    slug: 'kazan',
    imageUrl: '/cities/kazan.jpg',
    eventsCount: 0,
  },
  {
    name: 'Екатеринбург',
    slug: 'ekaterinburg',
    imageUrl: '/cities/ekaterinburg.jpg',
    eventsCount: 0,
  },
];

async function seedCities() {
  try {
    await connectDB();

    // Проверяем, есть ли уже города в БД
    const existingCities = await City.countDocuments();
    if (existingCities > 0) {
      console.log(`📊 В БД уже есть ${existingCities} городов. Пропускаем seed.`);
      return;
    }

    // Добавляем города
    for (const cityData of cities) {
      const existingCity = await City.findOne({ slug: cityData.slug });
      if (!existingCity) {
        const city = new City(cityData);
        await city.save();
        console.log(`✅ Добавлен город: ${cityData.name}`);
      } else {
        console.log(`⚠️  Город ${cityData.name} уже существует`);
      }
    }

    console.log('🎉 Seed городов завершен!');
    
  } catch (error) {
    console.error('❌ Ошибка при seed городов:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Отключено от MongoDB');
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  seedCities();
}

module.exports = { seedCities }; 