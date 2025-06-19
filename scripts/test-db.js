const mongoose = require('mongoose');

require('dotenv').config({ path: __dirname + '/../.env.local' });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function testConnection() {
  try {
    console.log('🔗 Подключаемся к MongoDB:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключение к MongoDB успешно!');
    
    // Проверяем коллекции
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Коллекции в базе:', collections.map(c => c.name));
    
    // Проверяем количество городов
    const City = mongoose.model('City', new mongoose.Schema({
      name: String,
      slug: String,
      imageUrl: String,
      eventsCount: Number
    }, { timestamps: true }));
    
    const cityCount = await City.countDocuments();
    console.log('🏙️ Количество городов в базе:', cityCount);
    
    if (cityCount > 0) {
      const cities = await City.find().limit(5);
      console.log('📍 Примеры городов:', cities.map(c => c.name));
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Подключение закрыто');
  }
}

testConnection(); 