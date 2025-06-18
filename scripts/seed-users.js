// Скрипт для создания тестовых пользователей

const testUsers = [
  {
    email: 'admin@cityaffiche.ru',
    name: 'Администратор',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    email: 'organizer1@cityaffiche.ru', 
    name: 'Анна Петрова',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
  },
  {
    email: 'organizer2@cityaffiche.ru',
    name: 'Михаил Иванов', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    email: 'organizer3@cityaffiche.ru',
    name: 'Елена Сидорова',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  },
  {
    email: 'organizer4@cityaffiche.ru',
    name: 'Дмитрий Козлов',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
  }
];

async function createUser(userData) {
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log(`✅ Создан пользователь: ${userData.name} (${userData.email})`);
      return user;
    } else {
      const error = await response.json();
      console.log(`❌ Ошибка создания пользователя ${userData.name}: ${error.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Ошибка пользователя ${userData.name}: ${error.message}`);
    return null;
  }
}

async function seedUsers() {
  console.log('👥 Создаем тестовых пользователей...\n');
  
  // Проверяем доступность сервера
  try {
    await fetch('http://localhost:3000/api/users');
  } catch (error) {
    console.log('❌ Сервер недоступен! Запустите: npm run dev');
    return;
  }
  
  const createdUsers = [];
  let created = 0;
  let failed = 0;
  
  for (const userData of testUsers) {
    const result = await createUser(userData);
    if (result) {
      createdUsers.push(result);
      created++;
    } else {
      failed++;
    }
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Результаты:`);
  console.log(`✅ Создано: ${created} пользователей`);
  console.log(`❌ Ошибок: ${failed}`);
  
  if (createdUsers.length > 0) {
    console.log(`\n👤 ID созданных пользователей:`);
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}: ${user._id}`);
    });
  }
  
  return createdUsers;
}

// Запуск если файл выполняется напрямую
if (typeof window === 'undefined') {
  seedUsers();
}

module.exports = { seedUsers, testUsers }; 