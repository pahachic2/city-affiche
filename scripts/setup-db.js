#!/usr/bin/env node

const { initDB } = require('./init-db');
const { seedCities } = require('./seed-cities');

async function setupDatabase() {
  console.log('🚀 Полная настройка базы данных City Affiche\n');
  
  try {
    // Шаг 1: Инициализация БД
    console.log('📋 Шаг 1: Инициализация базы данных');
    await initDB();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Шаг 2: Заполнение городами
    console.log('📋 Шаг 2: Заполнение городами');
    await seedCities();
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 База данных полностью настроена и готова к работе!');
    console.log('');
    console.log('📝 Что было сделано:');
    console.log('   ✅ Подключение к MongoDB проверено');
    console.log('   ✅ Индексы созданы для всех моделей');
    console.log('   ✅ Начальные данные городов добавлены');
    console.log('');
    console.log('🔧 Следующие шаги:');
    console.log('   1. Запустите сервер: npm run dev');
    console.log('   2. Протестируйте регистрацию: node scripts/test-auth.js');
    console.log('   3. Создайте первое мероприятие через интерфейс');
    
  } catch (error) {
    console.error('❌ Ошибка при настройке БД:', error);
    process.exit(1);
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 