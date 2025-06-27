import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Venue from '@/models/Venue';
import { verifyToken } from '@/lib/jwt';

// GET /api/venues/[id] - Получение заведения по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const venue = await Venue.findById(params.id)
      .populate('authorId', 'name email')
      .populate({
        path: 'messages',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .lean();

    if (!venue) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    await Venue.findByIdAndUpdate(params.id, { $inc: { viewsCount: 1 } });

    // Преобразование для фронтенда
    const venueWithAuthor = {
      ...venue,
      _id: venue._id.toString(),
      authorId: venue.authorId._id.toString(),
      author: {
        _id: venue.authorId._id.toString(),
        name: venue.authorId.name,
        email: venue.authorId.email
      },
      messages: venue.messages.map((message: any) => ({
        ...message,
        _id: message._id.toString(),
        userId: message.userId._id.toString(),
        username: message.userId.name
      }))
    };

    return NextResponse.json(venueWithAuthor);

  } catch (error) {
    console.error('Ошибка при получении заведения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при получении заведения' },
      { status: 500 }
    );
  }
}

// PUT /api/venues/[id] - Обновление заведения
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

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

    // Получение заведения
    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    // Проверка прав на редактирование
    if (venue.authorId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для редактирования' },
        { status: 403 }
      );
    }

    // Получение данных из запроса
    const body = await request.json();
    const { name, description, images, imageTypes, address, category } = body;

    // Валидация изображений
    if (images && images.length > 10) {
      return NextResponse.json(
        { error: 'Максимум 10 изображений разрешено' },
        { status: 400 }
      );
    }

    if (images && imageTypes && images.length !== imageTypes.length) {
      return NextResponse.json(
        { error: 'Количество изображений должно соответствовать количеству типов' },
        { status: 400 }
      );
    }

    // Обновление slug если изменилось название
    let slug = venue.slug;
    if (name && name !== venue.name) {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-zа-яё0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Проверка уникальности нового slug в рамках города
      let newSlug = baseSlug;
      let counter = 1;
      while (await Venue.findOne({ city: venue.city, slug: newSlug, _id: { $ne: params.id } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      slug = newSlug;
    }

    // Обновление заведения
    const updatedVenue = await Venue.findByIdAndUpdate(
      params.id,
      {
        name: name || venue.name,
        slug,
        description: description || venue.description,
        images: images !== undefined ? images : venue.images,
        imageTypes: imageTypes !== undefined ? imageTypes : venue.imageTypes,
        address: address !== undefined ? address : venue.address,
        category: category || venue.category
      },
      { new: true }
    ).populate('authorId', 'name email');

    // Преобразование для фронтенда
    const venueWithAuthor = {
      ...updatedVenue.toObject(),
      _id: updatedVenue._id.toString(),
      authorId: updatedVenue.authorId._id.toString(),
      author: {
        _id: updatedVenue.authorId._id.toString(),
        name: updatedVenue.authorId.name,
        email: updatedVenue.authorId.email
      }
    };

    return NextResponse.json(venueWithAuthor);

  } catch (error) {
    console.error('Ошибка при обновлении заведения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при обновлении заведения' },
      { status: 500 }
    );
  }
}

// DELETE /api/venues/[id] - Удаление заведения
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

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

    // Получение заведения
    const venue = await Venue.findById(params.id);
    if (!venue) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    // Проверка прав на удаление
    if (venue.authorId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления' },
        { status: 403 }
      );
    }

    // Удаление заведения
    await Venue.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Заведение успешно удалено' });

  } catch (error) {
    console.error('Ошибка при удалении заведения:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при удалении заведения' },
      { status: 500 }
    );
  }
} 