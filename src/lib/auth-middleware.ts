import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader, JwtPayload } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    _id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt: Date;
  };
}

/**
 * Извлекает и проверяет JWT токен из запроса
 */
export async function authenticate(request: NextRequest): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // Извлекаем токен из заголовка
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        success: false,
        error: 'Токен авторизации не предоставлен'
      };
    }

    // Проверяем токен
    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Недействительный токен'
      };
    }

    // Подключаемся к базе данных
    await connectDB();

    // Получаем пользователя из базы данных
    const user = await User.findById(decoded.userId).select('-password').lean();
    
    if (!user) {
      return {
        success: false,
        error: 'Пользователь не найден'
      };
    }

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return {
      success: false,
      error: 'Внутренняя ошибка сервера'
    };
  }
}

/**
 * Middleware для защищенных роутов
 */
export async function requireAuth(request: NextRequest) {
  const authResult = await authenticate(request);
  
  if (!authResult.success) {
    return {
      error: authResult.error,
      status: authResult.error?.includes('не предоставлен') ? 401 : 403
    };
  }

  return {
    user: authResult.user
  };
} 