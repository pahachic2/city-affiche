import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB, { checkConnection } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // Проверка обязательных полей
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверка подключения к базе данных
    await connectDB();
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.error('Нет подключения к базе данных');
      return NextResponse.json(
        { error: 'Сервис временно недоступен' },
        { status: 503 }
      );
    }

    // Проверка существования пользователя с таким email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создание нового пользователя
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
    });

    await newUser.save();
    console.log('✅ Пользователь сохранен в БД:', newUser._id);

    // Генерируем JWT токен
    const token = generateToken(newUser._id.toString(), newUser.email);

    // Возвращаем пользователя без пароля и токен
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      { 
        message: 'Пользователь успешно зарегистрирован',
        user: userResponse,
        token 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    
    // Обработка ошибок дублирования (MongoDB unique constraint)
    if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 