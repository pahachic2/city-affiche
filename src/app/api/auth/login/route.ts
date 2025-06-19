import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Проверка обязательных полей
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Подключение к базе данных
    await connectDB();

    // Поиск пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Генерируем JWT токен
    const token = generateToken(user._id.toString(), user.email);

    // Возвращаем пользователя без пароля и токен
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'Авторизация прошла успешно',
        user: userResponse,
        token 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 