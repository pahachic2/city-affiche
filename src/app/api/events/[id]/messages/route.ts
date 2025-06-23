import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Event from '@/models/Event';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

// GET /api/events/[id]/messages - получить сообщения события
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // Проверяем существование события
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    // Получаем сообщения
    const messages = await Message.find({ eventId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Реверсируем для показа от старых к новым
    const sortedMessages = messages.reverse();

    // Получаем общее количество для пагинации
    const total = await Message.countDocuments({ eventId: id });

    return NextResponse.json({
      messages: sortedMessages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total
      }
    });

  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/messages - создать новое сообщение
export async function POST(
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

    // Проверяем существование события
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content } = body;

    // Валидация контента
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Содержимое сообщения обязательно' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Сообщение не может быть пустым' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: 'Сообщение не должно превышать 500 символов' },
        { status: 400 }
      );
    }

    // Проверяем лимит сообщений (не более 10 сообщений в минуту от одного пользователя)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMessagesCount = await Message.countDocuments({
      eventId: id,
      userId: decoded.userId,
      createdAt: { $gte: oneMinuteAgo }
    });

    if (recentMessagesCount >= 10) {
      return NextResponse.json(
        { error: 'Слишком много сообщений. Подождите немного.' },
        { status: 429 }
      );
    }

    // Получаем информацию о пользователе
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Создаем сообщение
    const message = new Message({
      eventId: id,
      userId: decoded.userId,
      username: user.name,
      content: trimmedContent
    });

    await message.save();

    // Возвращаем созданное сообщение
    return NextResponse.json(message, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания сообщения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 