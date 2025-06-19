import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authResult = await authenticate(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Возвращаем данные пользователя
    return NextResponse.json(
      {
        message: 'Данные пользователя получены успешно',
        user: authResult.user
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 