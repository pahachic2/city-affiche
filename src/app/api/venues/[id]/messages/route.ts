import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Venue from '@/models/Venue';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/jwt';

// GET /api/venues/[id]/messages - Получение сообщений заведения
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    const messages = await Message.find({ eventId: params.id })
      .populate('userId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    const messagesWithUsername = messages.map(message => ({
      ...message,
      _id: message._id.toString(),
      userId: message.userId._id.toString(),
      username: message.userId.name,
      eventId: params.id
    }));

    return NextResponse.json(messagesWithUsername);

  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при получении сообщений' },
      { status: 500 }
    );
  }
}

// POST /api/venues/[id]/messages - Добавление сообщения
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

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

    // Проверка существования заведения
    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Содержимое сообщения не может быть пустым' },
        { status: 400 }
      );
    }

    // Создание сообщения (используем eventId для совместимости с существующей моделью Message)
    const message = new Message({
      eventId: params.id, // Используем ID заведения как eventId
      userId: decoded.userId,
      content: content.trim(),
    });

    await message.save();

    // Добавляем сообщение к заведению и увеличиваем счетчик
    await Venue.findByIdAndUpdate(params.id, {
      $push: { messages: message._id },
      $inc: { commentsCount: 1 }
    });

    // Получаем сообщение с информацией о пользователе
    const messageWithUser = await Message.findById(message._id)
      .populate('userId', 'name')
      .lean();

    const responseMessage = {
      ...messageWithUser,
      _id: messageWithUser._id.toString(),
      userId: messageWithUser.userId._id.toString(),
      username: messageWithUser.userId.name,
      eventId: params.id
    };

    return NextResponse.json(responseMessage, { status: 201 });

  } catch (error) {
    console.error('Ошибка при создании сообщения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при создании сообщения' },
      { status: 500 }
    );
  }
} 