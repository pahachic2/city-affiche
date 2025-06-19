import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/jwt';

// GET /api/events/[id] - получить событие по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Находим событие
    const event = await Event.findById(params.id).lean();
    if (!event) {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    // Получаем информацию об авторе
    const author = await User.findById((event as any).authorId).select('name email').lean();
    
    // Добавляем автора к событию
    const eventWithAuthor = {
      ...event,
      author
    };

    // Увеличиваем счетчик просмотров (опционально)
    await Event.findByIdAndUpdate(params.id, {
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

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
    const event = await Event.findById(params.id);
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
    await Message.deleteMany({ eventId: params.id });

    // Удаляем само событие
    await Event.findByIdAndDelete(params.id);

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