import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth-middleware';
import { isValidBase64Image, getImageMimeType } from '@/lib/image-utils';

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

// Функция для создания повторяющихся событий
const createRecurringEvents = async (baseEvent: Record<string, unknown>, recurringType: 'weekly' | 'monthly', endDate: Date) => {
  const events = [];
  const startDate = new Date(baseEvent.date as string);
  const currentDate = new Date(startDate);
  
  // Добавляем интервал в зависимости от типа повторения
  while (currentDate <= endDate) {
    if (recurringType === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (recurringType === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    if (currentDate <= endDate) {
      const eventData = {
        ...baseEvent,
        date: new Date(currentDate),
        _id: undefined // Убираем _id чтобы создать новое событие
      };
      
      const recurringEvent = new Event(eventData);
      await recurringEvent.save();
      events.push(recurringEvent);
    }
  }
  
  return events;
};

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
    const { 
      title, 
      description, 
      image, 
      city, 
      category, 
      date, 
      time,
      isOnline,
      isRecurring,
      recurringType,
      recurringEndDate
    } = body;

    // Базовая валидация
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

    // Валидация времени (если указано)
    if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return NextResponse.json(
        { error: 'Неверный формат времени (используйте ЧЧ:ММ)' },
        { status: 400 }
      );
    }

    // Валидация повторяющихся событий
    if (isRecurring) {
      if (!recurringType || !recurringEndDate) {
        return NextResponse.json(
          { error: 'Для повторяющегося события укажите тип повторения и дату окончания' },
          { status: 400 }
        );
      }
      
      if (new Date(recurringEndDate) <= new Date(date)) {
        return NextResponse.json(
          { error: 'Дата окончания повторений должна быть позже даты события' },
          { status: 400 }
        );
      }
    }

    const authorId = authResult.user!._id;

    // Проверяем лимит событий на пользователя (максимум 4)
    const userEventsCount = await Event.countDocuments({ 
      authorId: authorId.toString(),
      date: { $gte: new Date() } // Считаем только будущие события
    });

    if (userEventsCount >= 4) {
      return NextResponse.json(
        { error: 'Вы можете создать максимум 4 события. Удалите старые события или дождитесь их завершения.' },
        { status: 400 }
      );
    }

    // Валидация изображения (если есть)
    let imageType = null;
    if (image) {
      if (!isValidBase64Image(image)) {
        return NextResponse.json(
          { error: 'Неверный формат изображения или превышен размер файла' },
          { status: 400 }
        );
      }
      imageType = getImageMimeType(image);
    }

    // Создаем основное событие
    const eventData = {
      title,
      description,
      image: image || null,
      imageType,
      city,
      category,
      date: new Date(date),
      time: time || null,
      isOnline: Boolean(isOnline),
      isRecurring: Boolean(isRecurring),
      recurringType: isRecurring ? recurringType : null,
      recurringEndDate: isRecurring ? new Date(recurringEndDate) : null,
      authorId: authorId.toString(),
    };

    const event = new Event(eventData);
    await event.save();

    // Создаем повторяющиеся события (если нужно)
    let recurringEvents = [];
    if (isRecurring && recurringType && recurringEndDate) {
      // Проверяем, не превысим ли лимит с повторяющимися событиями
      const totalNewEvents = calculateRecurringEventsCount(
        new Date(date), 
        recurringType, 
        new Date(recurringEndDate)
      );
      
      if (userEventsCount + totalNewEvents > 4) {
        // Удаляем созданное событие и возвращаем ошибку
        await Event.findByIdAndDelete(event._id);
        return NextResponse.json(
          { error: `Создание ${totalNewEvents} повторяющихся событий превысит лимит в 4 события` },
          { status: 400 }
        );
      }
      
      recurringEvents = await createRecurringEvents(eventData, recurringType, new Date(recurringEndDate));
    }

    // Возвращаем созданное мероприятие с автором
    const eventWithAuthor = await Event.findById(event._id)
      .populate('authorId', 'name email avatar', User)
      .lean();

    return NextResponse.json({
      event: eventWithAuthor,
      recurringEventsCount: recurringEvents.length,
      totalEventsCreated: 1 + recurringEvents.length
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания мероприятия:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для подсчета количества повторяющихся событий
function calculateRecurringEventsCount(startDate: Date, recurringType: 'weekly' | 'monthly', endDate: Date): number {
  let count = 1; // Считаем основное событие
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (recurringType === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (recurringType === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    if (currentDate <= endDate) {
      count++;
    }
  }
  
  return count;
} 