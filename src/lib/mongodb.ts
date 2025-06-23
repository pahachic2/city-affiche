import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Пожалуйста, определите переменную окружения MONGODB_URI в .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// В production используем глобальный кэш для предотвращения множественных подключений
declare global {
  var mongoose_cache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose_cache || {
  conn: null,
  promise: null,
};

if (!global.mongoose_cache) {
  global.mongoose_cache = cached;
}

// Настройки подключения для реальной работы с БД
const connectOptions = {
  bufferCommands: false, // Отключаем буферизацию - все операции должны ждать подключения
  maxPoolSize: 10, // Максимум 10 соединений в пуле
  serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера 5 сек
  socketTimeoutMS: 45000, // Таймаут сокета 45 сек
  connectTimeoutMS: 10000, // Таймаут подключения 10 сек
};

// Функция для логирования с учетом окружения
const log = {
  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(message, ...args);
  }
};

async function connectDB(): Promise<typeof mongoose> {
  // Если уже подключены, возвращаем существующее подключение
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Если подключение в процессе, ждем его
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.promise = null;
      throw error;
    }
  }

  // Создаем новое подключение
  cached.promise = mongoose.connect(MONGODB_URI, connectOptions)
    .then((mongoose) => {
      log.info('✅ Успешно подключено к MongoDB');
      log.info(`📊 База данных: ${mongoose.connection.db?.databaseName || 'unknown'}`);
      log.info(`🔗 Состояние подключения: ${mongoose.connection.readyState}`);
      return mongoose;
    })
    .catch((error) => {
      log.error('❌ Ошибка подключения к MongoDB:', error.message);
      cached.promise = null;
      throw new Error(`Не удалось подключиться к MongoDB: ${error.message}`);
    });

  try {
    cached.conn = await cached.promise;
    
    // Добавляем обработчики событий подключения
    mongoose.connection.on('error', (error) => {
      log.error('🔥 Ошибка MongoDB:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      log.warn('⚠️  MongoDB отключена');
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('reconnected', () => {
      log.info('🔄 MongoDB переподключена');
    });

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

// Функция для проверки состояния подключения
export async function checkConnection(): Promise<boolean> {
  try {
    const readyState = mongoose.connection.readyState as number;
    if (readyState === 1) {
      return true;
    }
    await connectDB();
    return (mongoose.connection.readyState as number) === 1;
  } catch (error) {
    log.error('Ошибка проверки подключения:', error);
    return false;
  }
}

// Функция для принудительного закрытия подключения (для тестов)
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    log.info('🔌 Отключено от MongoDB');
  }
}

export default connectDB; 