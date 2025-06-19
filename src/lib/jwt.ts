import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d'; // 30 дней

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Генерирует JWT токен для пользователя
 */
export function generateToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Проверяет и декодирует JWT токен
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Недействительный токен');
  }
}

/**
 * Обновляет JWT токен (создает новый с тем же payload)
 */
export function refreshToken(token: string): string {
  try {
    const decoded = verifyToken(token);
    // Создаем новый токен с теми же данными
    return generateToken(decoded.userId, decoded.email);
  } catch (error) {
    throw new Error('Невозможно обновить токен');
  }
}

/**
 * Извлекает токен из заголовка Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Ожидаем формат: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
} 