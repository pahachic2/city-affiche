import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Event from '@/models/Event';
import User from '@/models/User';

// GET /api/events/[id]/messages - получение сообщений чата
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Проверяем существование мероприятия
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Мероприятие не найдено' },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ eventId })
      .populate('senderId', 'name email avatar', User)
      .sort({ timestamp: -1 }) // Новые сообщения первыми
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ eventId });

    return NextResponse.json({
      messages: messages.reverse(), // Обращаем порядок для отображения
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: unknown) {
    console.error('Ошибка получения сообщений:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/messages - отправка сообщения в чат
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: eventId } = await params;
    const body = await request.json();
    const { senderId, text, imageUrl } = body;

    // Валидация
    if (!senderId) {
      return NextResponse.json(
        { error: 'Необходимо указать отправителя' },
        { status: 400 }
      );
    }

    if (!text && !imageUrl) {
      return NextResponse.json(
        { error: 'Сообщение должно содержать текст или изображение' },
        { status: 400 }
      );
    }

    // Проверяем существование мероприятия
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Мероприятие не найдено' },
        { status: 404 }
      );
    }

    // Проверяем существование пользователя
    const user = await User.findById(senderId);
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const message = new Message({
      eventId,
      senderId,
      text,
      imageUrl,
      timestamp: new Date(),
    });

    await message.save();

    // Добавляем ссылку на сообщение в мероприятие
    await Event.findByIdAndUpdate(eventId, {
      $push: { messages: message._id }
    });

    // Возвращаем сообщение с информацией об отправителе
    const messageWithSender = await Message.findById(message._id)
      .populate('senderId', 'name email avatar', User)
      .lean();

    return NextResponse.json(messageWithSender, { status: 201 });

  } catch (error: unknown) {
    console.error('Ошибка отправки сообщения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 