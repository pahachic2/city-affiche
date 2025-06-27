import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Venue from '@/models/Venue';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

// GET /api/venues - Получение списка заведений
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'rating'; // rating, name, newest

    // Построение фильтра
    const filter: any = {};
    if (city) {
      filter.city = city;
    }
    if (category) {
      filter.category = category;
    }

    // Определение сортировки
    let sortOptions: any = {};
    switch (sort) {
      case 'rating':
        sortOptions = { rating: -1, createdAt: -1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { rating: -1, createdAt: -1 };
    }

    // Получение заведений с пагинацией
    const venues = await Venue.find(filter)
      .populate('authorId', 'name email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Преобразование данных для фронтенда
    const venuesWithAuthor = venues.map(venue => ({
      ...venue,
      _id: venue._id.toString(),
      authorId: venue.authorId._id.toString(),
      author: {
        _id: venue.authorId._id.toString(),
        name: venue.authorId.name,
        email: venue.authorId.email
      },
      messages: venue.messages || [],
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt
    }));

    return NextResponse.json({
      venues: venuesWithAuthor,
      pagination: {
        page,
        limit,
        total: await Venue.countDocuments(filter)
      }
    });

  } catch (error) {
    console.error('Ошибка при получении заведений:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при получении заведений' },
      { status: 500 }
    );
  }
}

// POST /api/venues - Создание нового заведения
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Проверка авторизации
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Токен авторизации отсутствует' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      );
    }

    // Получение данных из запроса
    const body = await request.json();
    const { name, description, images, imageTypes, address, city, category } = body;

    // Валидация обязательных полей
    if (!name || !description || !city || !category) {
      return NextResponse.json(
        { error: 'Обязательные поля: name, description, city, category' },
        { status: 400 }
      );
    }

    // Валидация изображений
    if (images && images.length > 10) {
      return NextResponse.json(
        { error: 'Максимум 10 изображений разрешено' },
        { status: 400 }
      );
    }

    if (images && imageTypes && images.length !== imageTypes.length) {
      return NextResponse.json(
        { error: 'Количество изображений должно соответствовать количеству типов' },
        { status: 400 }
      );
    }

    // Создание slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Проверка уникальности slug в рамках города
    let slug = baseSlug;
    let counter = 1;
    while (await Venue.findOne({ city, slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Создание заведения
    const venue = new Venue({
      name,
      slug,
      description,
      images: images || [],
      imageTypes: imageTypes || [],
      address,
      city,
      category,
      authorId: decoded.userId,
      messages: [],
      upvotes: 0,
      downvotes: 0,
      rating: 0,
      commentsCount: 0,
      viewsCount: 0
    });

    await venue.save();

    // Получение созданного заведения с автором
    const createdVenue = await Venue.findById(venue._id)
      .populate('authorId', 'name email')
      .lean();

    // Преобразование для фронтенда
    const venueWithAuthor = {
      ...createdVenue,
      _id: createdVenue._id.toString(),
      authorId: createdVenue.authorId._id.toString(),
      author: {
        _id: createdVenue.authorId._id.toString(),
        name: createdVenue.authorId.name,
        email: createdVenue.authorId.email
      },
      messages: []
    };

    return NextResponse.json(venueWithAuthor, { status: 201 });

  } catch (error) {
    console.error('Ошибка при создании заведения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при создании заведения' },
      { status: 500 }
    );
  }
} 