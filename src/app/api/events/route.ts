import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/events - получение списка мероприятий с фильтрами
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Строим фильтр
    const filter: Record<string, unknown> = {};
    
    if (city) filter.city = city;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Получаем только будущие мероприятия
    filter.date = { $gte: new Date() };

    const skip = (page - 1) * limit;

    const events = await Event.find(filter)
      .populate('authorId', 'name email avatar', User)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Event.countDocuments(filter);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения мероприятий:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/events - создание нового мероприятия (только для авторизованных)
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authResult = await requireAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, description, image, city, category, date, isOnline } = body;

    // Базовая валидация (authorId больше не нужен в body)
    if (!title || !description || !city || !category || !date) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    // Проверяем, что дата в будущем
    if (new Date(date) <= new Date()) {
      return NextResponse.json(
        { error: 'Дата мероприятия должна быть в будущем' },
        { status: 400 }
      );
    }

    // Используем authorId из токена авторизации
    const authorId = authResult.user._id;

    const event = new Event({
      title,
      description,
      image,
      city,
      category,
      date: new Date(date),
      isOnline: Boolean(isOnline),
      authorId: authorId.toString(),
    });

    await event.save();

    // Возвращаем созданное мероприятие с автором
    const eventWithAuthor = await Event.findById(event._id)
      .populate('authorId', 'name email avatar', User)
      .lean();

    return NextResponse.json(eventWithAuthor, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания мероприятия:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 