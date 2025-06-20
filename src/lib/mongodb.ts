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
      console.log('✅ Успешно подключено к MongoDB');
      console.log(`📊 База данных: ${mongoose.connection.db?.databaseName || 'unknown'}`);
      console.log(`🔗 Состояние подключения: ${mongoose.connection.readyState}`);
      return mongoose;
    })
    .catch((error) => {
      console.error('❌ Ошибка подключения к MongoDB:', error.message);
      cached.promise = null;
      throw new Error(`Не удалось подключиться к MongoDB: ${error.message}`);
    });

  try {
    cached.conn = await cached.promise;
    
    // Добавляем обработчики событий подключения
    mongoose.connection.on('error', (error) => {
      console.error('🔥 Ошибка MongoDB:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB отключена');
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB переподключена');
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
    console.error('Ошибка проверки подключения:', error);
    return false;
  }
}

// Функция для принудительного закрытия подключения (для тестов)
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('🔌 Отключено от MongoDB');
  }
}

export default connectDB; 