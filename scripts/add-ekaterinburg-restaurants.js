const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI не найден в переменных окружения');
  process.exit(1);
}

// Данные ресторанов Екатеринбурга
const restaurants = [
  {
    "name": "Паштет",
    "description": "Уютный ресторан в стиле дачного дома с авторской русской и европейской кухней, милой кошкой Пашей и атмосферной верандой. Отличное место для неспешных обедов или ужинов в центре Екатеринбурга.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Малышева, 74",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 15,
    "downvotes": 2
  },
  {
    "name": "Троекуровъ",
    "description": "Ресторан, расположенный в историческом особняке с интерьерами в стиле купеческой старины, специализируется на русской и уральской кухне. Здесь подают строганину, уху и настойки собственного приготовления.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Карла Либкнехта, 23",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 25,
    "downvotes": 3
  },
  {
    "name": "Culta Bistronomic",
    "description": "Элегантный ресторан современной кухни с авторскими средиземноморскими блюдами и обширной винной картой. Находится на набережной Исети, предлагая прекрасные виды и стильный интерьер.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Бориса Ельцина, 3",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 20,
    "downvotes": 1
  },
  {
    "name": "Gavi",
    "description": "Элегантный итальянский ресторан с уютным интерьером и панорамными окнами, где подают пасту, пиццу и традиционные итальянские десерты. Отлично подходит для романтических ужинов и встреч с друзьями.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Бориса Ельцина, 10",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 13,
    "downvotes": 1
  },
  {
    "name": "Si!",
    "description": "Светлый ресторан в итальянском стиле с дружелюбной атмосферой и обширным меню паст, пицц и антипасти. Здесь любят собираться семьи и компании друзей, особенно по выходным.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Ленина, 49",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 18,
    "downvotes": 2
  },
  {
    "name": "Зверобой",
    "description": "Ресторан, где уральская кухня переосмыслена в авторском стиле. Здесь подают блюда из местных продуктов: грибов, дичи, ягод, с современными кулинарными техниками и изысканной подачей.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Вайнера, 10",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 21,
    "downvotes": 1
  },
  {
    "name": "Falafel Brothers",
    "description": "Небольшой стритфуд-корнер с современной израильской кухней. Предлагают свежий фалафель, хумус, питы и вегетарианские опции. Отличный вариант для быстрого перекуса или takeaway.",
    "images": [],
    "imageTypes": [],
    "address": "ТРЦ Гринвич, ул. 8 Марта, 46",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 9,
    "downvotes": 0
  },
  {
    "name": "Нигора",
    "description": "Аутентичная узбекская чайхана, где готовят традиционные пловы, манты, лагман и домашние лепешки. Интерьер оформлен восточными орнаментами, создавая атмосферу настоящего восточного уюта.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Карла Либкнехта, 13",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 16,
    "downvotes": 2
  },
  {
    "name": "Золотой бамбук",
    "description": "Популярный вьетнамский ресторан с минималистичным интерьером и настоящими вьетнамскими блюдами: фо-бо, бун-ча, спринг-роллы. Отличный выбор для любителей азиатской кухни и свежих специй.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Малышева, 56",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 10,
    "downvotes": 1
  },
  {
    "name": "Пьемкрафт",
    "description": "Крафтовый бар с широким выбором сортов пива, закусок и настольных игр. Идеальное место для встреч с друзьями в уютной и непринужденной атмосфере.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Вайнера, 55",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 12,
    "downvotes": 1
  },
  {
    "name": "The Yankee Bar",
    "description": "Американский бар с акцентом на сытные бургеры, рёбра и крафтовое пиво. Интерьер выдержан в стиле sports-bar, идеально подходит для просмотра матчей и весёлых компаний.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Хохрякова, 74",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 14,
    "downvotes": 2
  },
  {
    "name": "Строганов Гриль",
    "description": "Ресторан-гриль со специализацией на стейках, мясных деликатесах и морепродуктах. Открытая кухня позволяет наблюдать процесс приготовления блюд на углях.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Мамина-Сибиряка, 36",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 19,
    "downvotes": 2
  },
  {
    "name": "Корова",
    "description": "Мясной ресторан с акцентом на блюда, приготовленные в дровяной печи. Интерьер выполнен в индустриальном стиле, создавая стильную атмосферу для ужинов и встреч.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Хохрякова, 8",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 11,
    "downvotes": 0
  },
  {
    "name": "Espresso Season",
    "description": "Кофейня с уклоном в спешелти-кофе, легкими завтраками и десертами. Отличное место для утренних встреч или работы за ноутбуком в спокойной атмосфере.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Малышева, 51",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 8,
    "downvotes": 0
  },
  {
    "name": "Duo",
    "description": "Светлая и минималистичная кофейня, которая подходит для работы, встреч или неспешного завтрака. Здесь подают круассаны, боулы, свежие соки и качественный кофе.",
    "images": [],
    "imageTypes": [],
    "address": "ул. 8 Марта, 14",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 7,
    "downvotes": 0
  },
  {
    "name": "TomYumBar",
    "description": "Паназиатский корнер в ТРЦ «Гринвич», где готовят острые том-ямы, лапшу вок и рисовые боулы. Прекрасный выбор для быстрого и вкусного обеда с азиатским колоритом.",
    "images": [],
    "imageTypes": [],
    "address": "ТРЦ Гринвич, ул. 8 Марта, 46",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 13,
    "downvotes": 1
  },
  {
    "name": "Jang Su",
    "description": "Современное китайское бистро с фокусом на аутентичные блюда и домашнюю атмосферу. Здесь подают как классические китайские хиты, так и блюда с тайским акцентом.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Луначарского, 240",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 10,
    "downvotes": 1
  },
  {
    "name": "Гастрономика",
    "description": "Ресторан высокой кухни на верхних этажах здания с панорамным видом на Екатеринбург. Меню сочетает авторские блюда, уральские деликатесы и современную подачу.",
    "images": [],
    "imageTypes": [],
    "address": "пр. Ленина, 49",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 23,
    "downvotes": 1
  },
  {
    "name": "Юность",
    "description": "Молодежный бар-ресторан с атмосферой ностальгии по советскому времени. Здесь подают русскую кухню в современном исполнении и авторские коктейли.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Ленина, 50",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 12,
    "downvotes": 2
  },
  {
    "name": "Дюшес",
    "description": "Семейное кафе с ретро-интерьером в стиле советской кондитерской. Большой выбор тортов, десертов и традиционных напитков, таких как морс и квас.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Малышева, 31",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 9,
    "downvotes": 1
  },
  {
    "name": "Стейк Хаус Goodman",
    "description": "Сеть стейк-хаусов с большим выбором премиального мяса, классической американской кухни и строгим интерьером. Хороший вариант для деловых ужинов и мясоедов.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Малышева, 51",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 17,
    "downvotes": 2
  },
  {
    "name": "Simple Coffee",
    "description": "Кофейня с лаконичным интерьером и упором на качественный кофе и десерты. Часто используется как место для встреч или работы вне офиса.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Вайнера, 16",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 11,
    "downvotes": 0
  },
  {
    "name": "Хочу Пури",
    "description": "Ресторан грузинской кухни, где готовят настоящие хачапури, шашлыки, лобио и домашние грузинские вина. Интерьер создаёт атмосферу теплого грузинского гостеприимства.",
    "images": [],
    "imageTypes": [],
    "address": "ул. Радищева, 33",
    "city": "Екатеринбург",
    "category": "Рестораны",
    "upvotes": 14,
    "downvotes": 1
  }
];

// Функция для создания slug
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

async function addRestaurants() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Подключение к MongoDB...');
    await client.connect();
    
    const db = client.db();
    console.log(`✅ Подключено к базе данных: ${db.databaseName}`);
    
    // Находим пользователя для authorId
    const usersCollection = db.collection('users');
    const testUser = await usersCollection.findOne({});
    
    if (!testUser) {
      console.error('❌ Пользователи не найдены. Сначала создайте пользователя.');
      return;
    }
    
    console.log(`👤 Используем пользователя: ${testUser.name} (${testUser.email})`);
    
    const venuesCollection = db.collection('venues');
    let addedCount = 0;
    let skippedCount = 0;
    
    console.log(`\n🏪 Начинаем добавление ${restaurants.length} ресторанов...`);
    
    for (const restaurant of restaurants) {
      // Создаем slug
      const baseSlug = createSlug(restaurant.name);
      let slug = baseSlug;
      let counter = 1;
      
      // Проверяем уникальность slug в рамках города
      while (await venuesCollection.findOne({ city: restaurant.city, slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Проверяем, существует ли уже такой ресторан
      const existing = await venuesCollection.findOne({ 
        city: restaurant.city, 
        name: restaurant.name 
      });
      
      if (existing) {
        console.log(`⚠️  Ресторан "${restaurant.name}" уже существует`);
        skippedCount++;
        continue;
      }
      
      // Создаем объект заведения для базы данных
      const venue = {
        name: restaurant.name,
        slug: slug,
        description: restaurant.description,
        images: restaurant.images,
        imageTypes: restaurant.imageTypes,
        address: restaurant.address,
        city: restaurant.city,
        category: restaurant.category,
        authorId: testUser._id,
        messages: [],
        upvotes: restaurant.upvotes,
        downvotes: restaurant.downvotes,
        rating: restaurant.upvotes - restaurant.downvotes,
        commentsCount: 0,
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Добавляем в базу данных
      const result = await venuesCollection.insertOne(venue);
      console.log(`✅ Добавлен: "${restaurant.name}" (slug: ${slug})`);
      addedCount++;
    }
    
    console.log(`\n📊 Результаты:`);
    console.log(`   ✅ Добавлено ресторанов: ${addedCount}`);
    console.log(`   ⚠️  Пропущено (уже существуют): ${skippedCount}`);
    console.log(`   📝 Всего обработано: ${restaurants.length}`);
    
    // Показываем общую статистику по Екатеринбургу
    const totalVenues = await venuesCollection.countDocuments({ city: 'Екатеринбург' });
    console.log(`\n🏙️  Всего заведений в Екатеринбурге: ${totalVenues}`);
    
    console.log('\n🎉 Добавление ресторанов завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при добавлении ресторанов:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Соединение с базой данных закрыто');
  }
}

// Запуск скрипта
addRestaurants(); 