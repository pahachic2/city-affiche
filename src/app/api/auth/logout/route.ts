import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Поскольку JWT токены stateless, логика выхода выполняется на клиенте
    // (удаление токена из localStorage)
    // Здесь мы просто возвращаем успешный ответ

    return NextResponse.json(
      { 
        message: 'Выход выполнен успешно'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка при выходе:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 