import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vote from '@/models/Vote';
import Event from '@/models/Event';

// POST /api/events/[id]/vote - голосование за мероприятие
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: eventId } = await params;
    const body = await request.json();
    const { userId, value } = body;

    // Валидация
    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'Необходимо указать пользователя и мероприятие' },
        { status: 400 }
      );
    }

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: 'Значение голоса должно быть 1 или -1' },
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

    // Проверяем, не голосовал ли пользователь уже
    const existingVote = await Vote.findOne({ userId, eventId });

    if (existingVote) {
      // Если голос такой же, удаляем его (отмена голоса)
      if (existingVote.value === value) {
        await Vote.findByIdAndDelete(existingVote._id);
        
        // Удаляем ссылку из мероприятия
        await Event.findByIdAndUpdate(eventId, {
          $pull: { votes: existingVote._id }
        });

        return NextResponse.json({ message: 'Голос отменен' });
      } else {
        // Иначе меняем голос
        existingVote.value = value;
        await existingVote.save();

        return NextResponse.json({ 
          message: 'Голос изменен',
          vote: existingVote 
        });
      }
    } else {
      // Создаем новый голос
      const vote = new Vote({
        userId,
        eventId,
        value,
      });

      await vote.save();

      // Добавляем ссылку в мероприятие
      await Event.findByIdAndUpdate(eventId, {
        $push: { votes: vote._id }
      });

      return NextResponse.json({
        message: 'Голос засчитан',
        vote
      }, { status: 201 });
    }

  } catch (error: unknown) {
    console.error('Ошибка голосования:', error);
    
    // Обработка ошибки уникальности
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Вы уже голосовали за это мероприятие' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// GET /api/events/[id]/vote - получение статистики голосов
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: eventId } = await params;

    // Подсчитываем голоса
    const upvotes = await Vote.countDocuments({ eventId, value: 1 });
    const downvotes = await Vote.countDocuments({ eventId, value: -1 });

    return NextResponse.json({
      upvotes,
      downvotes,
      total: upvotes - downvotes
    });

  } catch (error) {
    console.error('Ошибка получения голосов:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 