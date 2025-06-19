import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Event from '@/models/Event';
import { verifyToken } from '@/lib/jwt';

// DELETE /api/events/[id]/messages/[messageId] - удалить сообщение
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
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

    // Проверяем существование события
    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    // Находим сообщение
    const message = await Message.findById(params.messageId);
    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение не найдено' },
        { status: 404 }
      );
    }

    // Проверяем что сообщение принадлежит этому событию
    if (message.eventId.toString() !== params.id) {
      return NextResponse.json(
        { error: 'Сообщение не принадлежит этому событию' },
        { status: 400 }
      );
    }

    // Проверяем права на удаление
    const isAuthor = message.userId.toString() === decoded.userId;
    const isOrganizer = event.organizerId.toString() === decoded.userId;

    if (!isAuthor && !isOrganizer) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления сообщения' },
        { status: 403 }
      );
    }

    // Удаляем сообщение
    await Message.findByIdAndDelete(params.messageId);

    return NextResponse.json(
      { message: 'Сообщение удалено' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка удаления сообщения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 