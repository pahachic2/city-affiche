import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import City from '@/models/City';

// GET /api/cities/[slug] - получение города по slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const city = await City.findOne({ slug: params.slug }).lean();

    if (!city) {
      return NextResponse.json(
        { error: 'Город не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(city);

  } catch (error) {
    console.error('Ошибка получения города:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// PATCH /api/cities/[slug] - обновление города
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { imageUrl, name } = body;

    // Находим город
    const city = await City.findOne({ slug: params.slug });

    if (!city) {
      return NextResponse.json(
        { error: 'Город не найден' },
        { status: 404 }
      );
    }

    // Обновляем поля
    if (imageUrl) {
      city.imageUrl = imageUrl;
    }
    
    if (name && name !== city.name) {
      // Если меняем название, нужно пересоздать slug
      const newSlug = createSlug(name);
      
      // Проверяем что новый slug не занят
      const existingCity = await City.findOne({ slug: newSlug, _id: { $ne: city._id } });
      if (existingCity) {
        return NextResponse.json(
          { error: 'Город с таким названием уже существует' },
          { status: 409 }
        );
      }
      
      city.name = name;
      city.slug = newSlug;
    }

    city.updatedAt = new Date();
    await city.save();

    return NextResponse.json(city);

  } catch (error) {
    console.error('Ошибка обновления города:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE /api/cities/[slug] - удаление города
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const city = await City.findOneAndDelete({ slug: params.slug });

    if (!city) {
      return NextResponse.json(
        { error: 'Город не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Город удален', city });

  } catch (error) {
    console.error('Ошибка удаления города:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Функция для создания slug из русского текста (дублируем из route.ts)
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