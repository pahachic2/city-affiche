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

// Схема пользователя
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Функция для просмотра всех пользователей
async function viewAllUsers() {
  console.log('👥 Все пользователи в базе данных\n');
  
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ Не удалось подключиться к БД');
    return;
  }
  
  try {
    // Получаем всех пользователей
    const users = await User.find({}, 'email name avatar createdAt updatedAt')
      .sort({ createdAt: 1 }) // Сортируем по дате создания (старые сначала)
      .lean();
    
    console.log(`📊 Всего пользователей: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('👤 Пользователей не найдено');
      return;
    }
    
    // Показываем всех пользователей
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🖼️  Avatar: ${user.avatar || 'Нет'}`);
      console.log(`   📅 Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}`);
      console.log(`   🔄 Обновлен: ${new Date(user.updatedAt).toLocaleString('ru-RU')}`);
      console.log(`   🆔 ID: ${user._id}`);
      console.log('   ' + '─'.repeat(50));
    });
    
    // Статистика
    console.log('\n📈 Статистика:');
    
    // Группировка по доменам email
    const emailDomains = {};
    users.forEach(user => {
      const domain = user.email.split('@')[1];
      emailDomains[domain] = (emailDomains[domain] || 0) + 1;
    });
    
    console.log('\n📧 Распределение по доменам email:');
    Object.entries(emailDomains)
      .sort(([,a], [,b]) => b - a)
      .forEach(([domain, count]) => {
        console.log(`   ${domain}: ${count} пользователей`);
      });
    
    // Пользователи с аватарами
    const usersWithAvatars = users.filter(user => user.avatar).length;
    console.log(`\n🖼️  Пользователей с аватарами: ${usersWithAvatars} из ${users.length}`);
    
    // По дате регистрации
    const today = new Date();
    const todayUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.toDateString() === today.toDateString();
    }).length;
    
    console.log(`📅 Зарегистрировано сегодня: ${todayUsers}`);
    
  } catch (error) {
    console.error('❌ Ошибка получения пользователей:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Отключено от MongoDB');
  }
}

// Функция для поиска пользователя
async function findUser(searchTerm) {
  console.log(`🔍 Поиск пользователя: "${searchTerm}"\n`);
  
  const connected = await connectDB();
  if (!connected) return;
  
  try {
    // Ищем по email или имени
    const users = await User.find({
      $or: [
        { email: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } }
      ]
    }, 'email name avatar createdAt').lean();
    
    if (users.length === 0) {
      console.log('❌ Пользователи не найдены');
    } else {
      console.log(`✅ Найдено пользователей: ${users.length}\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}`);
        console.log(`   ID: ${user._id}`);
        console.log();
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка поиска:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Функция для удаления тестовых пользователей
async function cleanupTestUsers() {
  console.log('🧹 Очистка тестовых пользователей...\n');
  
  const connected = await connectDB();
  if (!connected) return;
  
  try {
    // Ищем тестовых пользователей
    const testUsers = await User.find({
      $or: [
        { email: { $regex: 'test.*@example\\.com', $options: 'i' } },
        { email: { $regex: 'api-test', $options: 'i' } },
        { name: { $regex: 'тест', $options: 'i' } },
        { name: { $regex: 'test', $options: 'i' } }
      ]
    }).lean();
    
    if (testUsers.length === 0) {
      console.log('✅ Тестовых пользователей не найдено');
    } else {
      console.log(`⚠️  Найдено тестовых пользователей: ${testUsers.length}`);
      testUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
      
      console.log('\n❓ Хотите удалить их? Запустите: node scripts/view-users.js cleanup confirm');
    }
    
  } catch (error) {
    console.error('❌ Ошибка поиска тестовых пользователей:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Функция для подтверждения удаления
async function confirmCleanup() {
  console.log('🗑️  Удаление тестовых пользователей...\n');
  
  const connected = await connectDB();
  if (!connected) return;
  
  try {
    const result = await User.deleteMany({
      $or: [
        { email: { $regex: 'test.*@example\\.com', $options: 'i' } },
        { email: { $regex: 'api-test', $options: 'i' } },
        { name: { $regex: 'тест', $options: 'i' } },
        { name: { $regex: 'test', $options: 'i' } }
      ]
    });
    
    console.log(`✅ Удалено тестовых пользователей: ${result.deletedCount}`);
    
  } catch (error) {
    console.error('❌ Ошибка удаления:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Основная функция
async function main() {
  const command = process.argv[2];
  const param = process.argv[3];
  
  switch (command) {
    case 'search':
      if (param) {
        await findUser(param);
      } else {
        console.log('❌ Укажите поисковый запрос: node scripts/view-users.js search "текст"');
      }
      break;
      
    case 'cleanup':
      if (param === 'confirm') {
        await confirmCleanup();
      } else {
        await cleanupTestUsers();
      }
      break;
      
    default:
      await viewAllUsers();
  }
}

// Запуск
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { viewAllUsers, findUser, cleanupTestUsers }; 