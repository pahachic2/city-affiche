// Скрипт для очистки и финальной настройки городов

async function cleanup() {
  console.log('🧹 Очистка и настройка городов...\n');
  
  try {
    // 1. Получаем список всех городов
    const response = await fetch('http://localhost:3000/api/cities');
    const data = await response.json();
    const cities = data.cities || [];
    
    console.log(`📊 Найдено городов: ${cities.length}\n`);
    
    // 2. Удаляем тестовые города
    const testCities = cities.filter(city => 
      city.name.includes('Тест') || 
      city.name.includes('Test') ||
      city.slug.includes('test')
    );
    
    for (const city of testCities) {
      try {
        const deleteResponse = await fetch(`http://localhost:3000/api/cities/${city.slug}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Удален тестовый город: ${city.name}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка удаления ${city.name}:`, error.message);
      }
    }
    
    // 3. Обновляем изображения основных городов
    const mainCities = {
      'moskva': '/cities/moscow.jpg',
      'sankt-peterburg': '/cities/spb.jpg', 
      'ekaterinburg': '/cities/ekaterinburg.jpg',
      'kazan': '/cities/kazan.jpg'
    };
    
    console.log('\n🖼️ Обновляем изображения основных городов...\n');
    
    for (const [slug, imageUrl] of Object.entries(mainCities)) {
      try {
        const updateResponse = await fetch(`http://localhost:3000/api/cities/${slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Обновлено изображение: ${slug} -> ${imageUrl}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка обновления ${slug}:`, error.message);
      }
    }
    
    // 4. Финальный список
    console.log('\n📋 Финальный список городов:\n');
    const finalResponse = await fetch('http://localhost:3000/api/cities');
    const finalData = await finalResponse.json();
    const finalCities = finalData.cities || [];
    
    finalCities.forEach((city, index) => {
      console.log(`${index + 1}. ${city.name} (${city.slug})`);
      console.log(`   📷 ${city.imageUrl}`);
      console.log('');
    });
    
    console.log('✅ Очистка завершена!\n');
    
    // 5. Инструкции для пользователя
    console.log('🎯 Готово! Теперь вы можете:');
    console.log('   • Перейти на http://localhost:3000 - посмотреть главную страницу');
    console.log('   • Перейти на http://localhost:3000/admin/cities - управлять городами');
    console.log('   • Использовать scripts/city-manager.js для управления из командной строки');
    console.log('');
    console.log('📝 Полезные команды:');
    console.log('   node scripts/city-manager.js list              - показать все города');
    console.log('   node scripts/city-manager.js add "Город" "URL" - добавить город');
    console.log('   node scripts/city-manager.js update slug "URL" - изменить изображение');
    console.log('');

  } catch (error) {
    console.error('❌ Ошибка очистки:', error.message);
  }
}

// Запуск
cleanup(); 