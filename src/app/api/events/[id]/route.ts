import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/jwt';

// GET /api/events/[id] - получить событие по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Находим событие
    const event = await Event.findById(id).lean();
    if (!event) {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    // Получаем информацию об авторе
    const eventData = event as unknown as { authorId: string };
    const author = await User.findById(eventData.authorId).select('name email').lean();
    
    // Добавляем автора к событию
    const eventWithAuthor = {
      ...event,
      author
    };

    // Увеличиваем счетчик просмотров (опционально)
    await Event.findByIdAndUpdate(id, {
      $inc: { viewsCount: 1 }
    });

    return NextResponse.json(eventWithAuthor);

  } catch (error) {
    console.error('Ошибка получения события:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - удалить событие
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    // Находим событие
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    // Проверяем права на удаление (только автор)
    if (event.authorId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления события' },
        { status: 403 }
      );
    }

    // Удаляем все сообщения события
    await Message.deleteMany({ eventId: id });

    // Удаляем само событие
    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Событие успешно удалено' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка удаления события:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 