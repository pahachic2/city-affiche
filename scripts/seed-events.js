// Скрипт для создания тестовых мероприятий

// Функция для создания даты в будущем
const getRandomFutureDate = (minDays = 1, maxDays = 90) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const futureDate = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
  
  // Устанавливаем случайное время от 10:00 до 22:00
  const randomHour = Math.floor(Math.random() * 12) + 10;
  const randomMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  
  futureDate.setHours(randomHour, randomMinute, 0, 0);
  return futureDate;
};

// Функция для получения пользователей
async function getUsers() {
  try {
    const response = await fetch('http://localhost:3000/api/users');
    if (response.ok) {
      const data = await response.json();
      return data.users || [];
    }
    return [];
  } catch (error) {
    console.log('❌ Ошибка получения пользователей:', error.message);
    return [];
  }
}

// Функция для получения случайного пользователя
function getRandomUser(users) {
  if (users.length === 0) return 'default-user-id';
  return users[Math.floor(Math.random() * users.length)]._id;
}

const createTestEvents = (users) => [
  // Москва
  {
    title: "Концерт группы \"Кино\" в Лужниках",
    description: "Грандиозное шоу в честь 40-летия группы. Выступят все участники оригинального состава. Ожидается 80 000 зрителей!",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
    city: "Москва",
    category: "Музыка",
    date: getRandomFutureDate(7, 30),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 156,
    downvotes: 12,
    commentsCount: 43,
    viewsCount: 2341
  },
  {
    title: "Выставка \"Русский авангард\" в Третьяковской галерее",
    description: "Уникальная коллекция работ Малевича, Кандинского, Шагала. Более 200 экспонатов из частных коллекций.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    city: "Москва", 
    category: "Искусство",
    date: getRandomFutureDate(1, 14),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 89,
    downvotes: 3,
    commentsCount: 17,
    viewsCount: 1205
  },
  {
    title: "Спектакль \"Гамлет\" в МХТ",
    description: "Классическая постановка с современной интерпретацией. В главной роли - Константин Хабенский.",
    city: "Москва",
    category: "Театр", 
    date: getRandomFutureDate(3, 21),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 67,
    downvotes: 8,
    commentsCount: 25,
    viewsCount: 892
  },

  // Санкт-Петербург
  {
    title: "Белые ночи в Эрмитаже",
    description: "Ночная экскурсия по залам Эрмитажа во время белых ночей. Специальная программа с классической музыкой.",
    image: "https://images.unsplash.com/photo-1520637836862-4d197d17c767?w=800&h=400&fit=crop",
    city: "Санкт-Петербург",
    category: "Культура",
    date: getRandomFutureDate(14, 45),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 234,
    downvotes: 15,
    commentsCount: 67,
    viewsCount: 3456
  },
  {
    title: "Фестиваль \"Алые паруса\"",
    description: "Главное событие года для выпускников! Грандиозное шоу на Дворцовой площади с участием звезд эстрады.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
    city: "Санкт-Петербург",
    category: "Праздник",
    date: getRandomFutureDate(20, 50),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 445,
    downvotes: 23,
    commentsCount: 156,
    viewsCount: 8932
  },
  {
    title: "Балет \"Лебединое озеро\" в Мариинском театре",
    description: "Классическая постановка великого балета. Партию Одетты исполняет Ульяна Лопаткина.",
    city: "Санкт-Петербург",
    category: "Балет",
    date: getRandomFutureDate(10, 35),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 123,
    downvotes: 7,
    commentsCount: 34,
    viewsCount: 1567
  },

  // Екатеринбург
  {
    title: "Рок-фестиваль \"Уральская ночь\"",
    description: "Крупнейший рок-фестиваль Урала! Выступят Nautilus Pompilius, Агата Кристи, Чайф и другие легенды.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
    city: "Екатеринбург",
    category: "Музыка",
    date: getRandomFutureDate(15, 40),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 198,
    downvotes: 14,
    commentsCount: 78,
    viewsCount: 2876
  },
  {
    title: "День города Екатеринбурга",
    description: "Большой праздник в честь дня рождения города. Концерты, ярмарки, фейерверк на набережной Исети.",
    city: "Екатеринбург",
    category: "Праздник",
    date: getRandomFutureDate(60, 80),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 267,
    downvotes: 11,
    commentsCount: 89,
    viewsCount: 4321
  },
  {
    title: "Выставка минералов в Музее природы",
    description: "Уникальная коллекция уральских самоцветов. Более 500 экспонатов, включая знаменитые малахиты.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    city: "Екатеринбург",
    category: "Выставка",
    date: getRandomFutureDate(5, 25),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 76,
    downvotes: 4,
    commentsCount: 19,
    viewsCount: 987
  },

  // Казань
  {
    title: "Сабантуй в Казани",
    description: "Традиционный татарский праздник плуга. Национальная борьба, конкурсы, татарская кухня.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
    city: "Казань",
    category: "Традиции",
    date: getRandomFutureDate(12, 30),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 187,
    downvotes: 9,
    commentsCount: 52,
    viewsCount: 2654
  },
  {
    title: "Опера \"Тукай\" в Татарском театре",
    description: "Национальная опера о великом татарском поэте. Исполняется на татарском языке с синхронным переводом.",
    city: "Казань",
    category: "Опера",
    date: getRandomFutureDate(18, 45),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 95,
    downvotes: 6,
    commentsCount: 28,
    viewsCount: 1234
  },
  {
    title: "Фестиваль \"Казанская осень\"",
    description: "Международный фестиваль классической музыки. Участвуют оркестры из России, Европы и Азии.",
    city: "Казань",
    category: "Классика",
    date: getRandomFutureDate(70, 90),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 134,
    downvotes: 12,
    commentsCount: 41,
    viewsCount: 1876
  },

  // Дополнительные мероприятия для разнообразия
  {
    title: "Стендап-шоу \"Смех без границ\"",
    description: "Лучшие комики страны в одном шоу! Участвуют победители Comedy Club и Stand Up.",
    city: "Москва",
    category: "Юмор",
    date: getRandomFutureDate(25, 50),
    isOnline: true,
    authorId: getRandomUser(users),
    upvotes: 89,
    downvotes: 21,
    commentsCount: 67,
    viewsCount: 1543
  },
  {
    title: "Мастер-класс по гончарному делу",
    description: "Научитесь создавать керамику своими руками. Все материалы включены в стоимость.",
    city: "Санкт-Петербург",
    category: "Мастер-класс",
    date: getRandomFutureDate(8, 20),
    isOnline: false,
    authorId: getRandomUser(users),
    upvotes: 45,
    downvotes: 3,
    commentsCount: 12,
    viewsCount: 567
  },
  {
    title: "Киберспорт: Финал Dota 2",
    description: "Решающие матчи чемпионата России по Dota 2. Призовой фонд 5 миллионов рублей!",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    city: "Екатеринбург",
    category: "Киберспорт",
    date: getRandomFutureDate(35, 60),
    isOnline: true,
    authorId: getRandomUser(users),
    upvotes: 312,
    downvotes: 45,
    commentsCount: 198,
    viewsCount: 5432
  }
];

async function createEvent(eventData) {
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    
    if (response.ok) {
      const event = await response.json();
      console.log(`✅ Создано мероприятие: "${eventData.title}" в ${eventData.city}`);
      return event;
    } else {
      const error = await response.json();
      console.log(`❌ Ошибка создания "${eventData.title}": ${error.error}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Ошибка "${eventData.title}": ${error.message}`);
    return null;
  }
}

async function seedEvents() {
  console.log('🎭 Создаем тестовые мероприятия...\n');
  
  // Проверяем доступность сервера
  try {
    await fetch('http://localhost:3000/api/events');
  } catch (error) {
    console.log('❌ Сервер недоступен! Запустите: npm run dev');
    return;
  }
  
  // Получаем пользователей
  console.log('👥 Получаем пользователей...');
  const users = await getUsers();
  if (users.length === 0) {
    console.log('❌ Не найдено пользователей! Сначала запустите: node scripts/seed-users.js');
    return;
  }
  console.log(`✅ Найдено ${users.length} пользователей\n`);
  
  // Создаем мероприятия
  const testEvents = createTestEvents(users);
  let created = 0;
  let failed = 0;
  
  for (const eventData of testEvents) {
    const result = await createEvent(eventData);
    if (result) {
      created++;
    } else {
      failed++;
    }
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Результаты:`);
  console.log(`✅ Создано: ${created} мероприятий`);
  console.log(`❌ Ошибок: ${failed}`);
  console.log(`\n🎯 Готово! Теперь можете посмотреть мероприятия в городах:`);
  console.log(`   • http://localhost:3000/city/moskva`);
  console.log(`   • http://localhost:3000/city/sankt-peterburg`);
  console.log(`   • http://localhost:3000/city/ekaterinburg`);
  console.log(`   • http://localhost:3000/city/kazan`);
}

// Запуск если файл выполняется напрямую
if (typeof window === 'undefined') {
  seedEvents();
}

module.exports = { seedEvents, createTestEvents }; 