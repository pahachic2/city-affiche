import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import City from '@/models/City';

// GET /api/cities - получение списка городов с поиском
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = {};
    
    // Если есть поисковый запрос, ищем по названию
    if (search && search.trim()) {
      query = {
        name: { $regex: search.trim(), $options: 'i' }
      };
    }

    const cities = await City.find(query)
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ cities });

  } catch (error) {
    console.error('Ошибка получения городов:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Функция для создания slug из русского текста
function createSlug(text: string): string {
  const rusToLat: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  return text
    .toLowerCase()
    .split('')
    .map(char => rusToLat[char] || char)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// POST /api/cities - создание города (для админа)
export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ Начинаем создание города...');
    
    await connectDB();
    console.log('✅ Подключение к БД установлено');

    const body = await request.json();
    console.log('📥 Получены данные:', body);
    
    const { name, imageUrl } = body;

    if (!name || !imageUrl) {
      console.log('❌ Недостаточно данных:', { name, imageUrl });
      return NextResponse.json(
        { error: 'Название города и изображение обязательны' },
        { status: 400 }
      );
    }

    // Создаем slug из названия
    const slug = createSlug(name);
    console.log('🔗 Создан slug:', slug);

    // Проверяем, не существует ли город уже
    const existingCity = await City.findOne({ 
      $or: [{ name }, { slug }] 
    });

    if (existingCity) {
      console.log('⚠️ Город уже существует:', existingCity);
      return NextResponse.json(
        { error: 'Город с таким названием уже существует' },
        { status: 409 }
      );
    }

    console.log('💾 Создаем новый город...');
    const city = new City({
      name,
      slug,
      imageUrl,
      eventsCount: 0,
    });

    const savedCity = await city.save();
    console.log('✅ Город сохранен:', savedCity);

    return NextResponse.json(savedCity, { status: 201 });

  } catch (error) {
    console.error('❌ Ошибка создания города:', error);
    console.error('Stack trace:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
} 