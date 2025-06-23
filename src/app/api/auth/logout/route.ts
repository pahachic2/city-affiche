import { NextResponse } from 'next/server';

export async function POST() {
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