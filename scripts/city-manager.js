// Универсальный менеджер городов

// Функция для вывода помощи
function showHelp() {
  console.log(`
🏙️ City Manager - Управление городами

Команды:
  node scripts/city-manager.js list                    - Показать все города
  node scripts/city-manager.js add "Название" "URL"   - Добавить новый город
  node scripts/city-manager.js update slug "URL"      - Обновить изображение
  node scripts/city-manager.js delete slug            - Удалить город
  node scripts/city-manager.js local                  - Перевести все на локальные изображения
  node scripts/city-manager.js external               - Перевести все на внешние URL

Примеры:
  node scripts/city-manager.js add "Нижний Новгород" "/cities/nn.jpg"
  node scripts/city-manager.js update ekaterinburg "/cities/ekaterinburg.jpg"
  node scripts/city-manager.js local
  `);
}

// Основные функции
async function listCities() {
  try {
    const response = await fetch('http://localhost:3000/api/cities');
    const data = await response.json();
    
    console.log('\n🏙️ Список городов:\n');
    data.cities.forEach((city, index) => {
      console.log(`${index + 1}. ${city.name} (${city.slug})`);
      console.log(`   📷 ${city.imageUrl}`);
      console.log(`   📊 События: ${city.eventsCount}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

async function addCity(name, imageUrl) {
  try {
    const response = await fetch('http://localhost:3000/api/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, imageUrl }),
    });
    
    if (response.ok) {
      const city = await response.json();
      console.log(`✅ Город "${name}" создан с slug: ${city.slug}`);
    } else {
      const error = await response.json();
      console.log(`❌ Ошибка: ${error.error}`);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

async function updateCity(slug, imageUrl) {
  try {
    const response = await fetch(`http://localhost:3000/api/cities/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    
    if (response.ok) {
      console.log(`✅ Изображение города "${slug}" обновлено`);
    } else {
      const error = await response.json();
      console.log(`❌ Ошибка: ${error.error}`);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

async function switchToLocal() {
  const localImages = {
    'moscow': '/cities/moscow.jpg',
    'sankt-peterburg': '/cities/spb.jpg',
    'ekaterinburg': '/cities/ekaterinburg.jpg',
    'kazan': '/cities/kazan.jpg'
  };
  
  console.log('🔄 Переводим города на локальные изображения...\n');
  
  for (const [slug, imageUrl] of Object.entries(localImages)) {
    await updateCity(slug, imageUrl);
  }
  
  console.log('\n✅ Все города переведены на локальные изображения!');
}

async function switchToExternal() {
  const externalImages = {
    'moscow': 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&h=600&fit=crop',
    'sankt-peterburg': 'https://images.unsplash.com/photo-1520637836862-4d197d17c767?w=1200&h=600&fit=crop',
    'ekaterinburg': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&h=600&fit=crop',
    'kazan': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1200&h=600&fit=crop'
  };
  
  console.log('🔄 Переводим города на внешние изображения...\n');
  
  for (const [slug, imageUrl] of Object.entries(externalImages)) {
    await updateCity(slug, imageUrl);
  }
  
  console.log('\n✅ Все города переведены на внешние изображения!');
}

// Быстрые команды для популярных городов
async function addPopularCities() {
  const cities = [
    { name: 'Нижний Новгород', imageUrl: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=1200&h=600&fit=crop' },
    { name: 'Новосибирск', imageUrl: 'https://images.unsplash.com/photo-1551974832-b5cc99c24b11?w=1200&h=600&fit=crop' },
    { name: 'Челябинск', imageUrl: 'https://images.unsplash.com/photo-1567093322503-e7c27d5b85b6?w=1200&h=600&fit=crop' },
    { name: 'Самара', imageUrl: 'https://images.unsplash.com/photo-1574869172199-e5b3b31e2007?w=1200&h=600&fit=crop' }
  ];
  
  console.log('🏙️ Добавляем популярные города...\n');
  
  for (const city of cities) {
    await addCity(city.name, city.imageUrl);
  }
  
  console.log('\n✅ Популярные города добавлены!');
}

// Обработка аргументов командной строки
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  // Проверяем доступность сервера
  try {
    await fetch('http://localhost:3000/api/cities');
  } catch (error) {
    console.log('❌ Сервер недоступен! Запустите: npm run dev');
    return;
  }
  
  switch (command) {
    case 'list':
      await listCities();
      break;
      
    case 'add':
      if (args.length < 3) {
        console.log('❌ Использование: node scripts/city-manager.js add "Название" "URL"');
        return;
      }
      await addCity(args[1], args[2]);
      break;
      
    case 'update':
      if (args.length < 3) {
        console.log('❌ Использование: node scripts/city-manager.js update slug "URL"');
        return;
      }
      await updateCity(args[1], args[2]);
      break;
      
    case 'local':
      await switchToLocal();
      break;
      
    case 'external':
      await switchToExternal();
      break;
      
    case 'popular':
      await addPopularCities();
      break;
      
    default:
      console.log(`❌ Неизвестная команда: ${command}`);
      showHelp();
  }
}

// Запуск если файл выполняется напрямую
if (typeof window === 'undefined') {
  main();
}

module.exports = { listCities, addCity, updateCity, switchToLocal, switchToExternal }; 