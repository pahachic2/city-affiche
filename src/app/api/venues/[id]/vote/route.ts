import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Venue from '@/models/Venue';

// POST /api/venues/[id]/vote - Голосование за заведение
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Тип голоса должен быть "up" или "down"' },
        { status: 400 }
      );
    }

    // Находим заведение
    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    // Увеличиваем соответствующий счетчик
    const updateField = voteType === 'up' ? 'upvotes' : 'downvotes';
    await Venue.findByIdAndUpdate(params.id, {
      $inc: { [updateField]: 1 }
    });

    // Пересчитываем рейтинг
    const updatedVenue = await Venue.findById(params.id);
    if (updatedVenue) {
      updatedVenue.rating = updatedVenue.upvotes - updatedVenue.downvotes;
      await updatedVenue.save();
    }

    return NextResponse.json({ 
      message: 'Голос учтен',
      upvotes: updatedVenue?.upvotes || 0,
      downvotes: updatedVenue?.downvotes || 0,
      rating: updatedVenue?.rating || 0
    });

  } catch (error) {
    console.error('Ошибка при голосовании:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при голосовании' },
      { status: 500 }
    );
  }
} 