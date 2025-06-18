import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users - получение списка пользователей
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await User.find({}, 'name email avatar createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/users - создание пользователя
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, name, avatar } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email и имя обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, не существует ли пользователь уже
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    const user = new User({
      email,
      name,
      avatar,
    });

    await user.save();

    return NextResponse.json(user, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
} 