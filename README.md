# 🎭 Афиша мероприятий

MVP-сайт для создания и поиска мероприятий с возможностью голосования и общения в чатах.

## 🚀 Технологии

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Аутентификация**: NextAuth.js
- **Загрузка файлов**: UploadThing
- **Чат**: WebSocket (Socket.io)
- **Хостинг**: Vercel + MongoDB Atlas

## 📦 Возможности

- ✅ Просмотр мероприятий (с фильтрами по городам, категориям, дате)
- ✅ Создание мероприятий с описанием и изображением
- ✅ Голосование за мероприятия (upvote/downvote)
- ✅ Чат под каждым мероприятием с поддержкой изображений
- ✅ Аутентификация пользователей
- ✅ Адаптивный дизайн

## 🛠️ Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd city-affiche
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env.local` в корне проекта:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/city-affiche
# Или для MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/city-affiche

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# UploadThing (для загрузки изображений)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### 3. Запуск в режиме разработки
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 4. Сборка для продакшена
```bash
npm run build
npm start
```

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   │   ├── events/        # CRUD мероприятий
│   │   └── auth/         # Аутентификация
│   ├── events/           # Страницы мероприятий
│   └── page.tsx          # Главная страница
├── components/            # React компоненты
│   ├── EventCard.tsx     # Карточка мероприятия
│   ├── EventsList.tsx    # Список мероприятий
│   ├── EventFilters.tsx  # Фильтры поиска
├── lib/                  # Утилиты
│   └── mongodb.ts        # Подключение к MongoDB
├── models/               # Mongoose схемы
│   ├── User.ts           # Модель пользователя
│   ├── Event.ts          # Модель мероприятия
│   ├── Message.ts        # Модель сообщения
│   └── Vote.ts           # Модель голоса
└── types/                # TypeScript типы
    └── index.ts          # Общие интерфейсы
```

## 🗄️ Модели данных

### Event (Мероприятие)
- title, description, image
- city, category, date, isOnline
- authorId, votes[], messages[]

### Message (Сообщение)
- eventId, senderId, text?, imageUrl?
- timestamp

### User (Пользователь)
- email, name, avatar

### Vote (Голос)
- userId, eventId, value (+1/-1)

## 🎯 API Endpoints

- `GET /api/events` - получение списка мероприятий
- `POST /api/events` - создание мероприятия
- `GET /api/events/[id]/messages` - сообщения чата
- `POST /api/events/[id]/messages` - отправка сообщения
- `POST /api/events/[id]/vote` - голосование
- `GET /api/events/[id]/vote` - статистика голосов

## 🚀 Развертывание

### Vercel
1. Подключите GitHub репозиторий к Vercel
2. Добавьте переменные окружения в настройках Vercel
3. Автоматическое развертывание при push в main

### MongoDB Atlas
1. Создайте кластер на [MongoDB Atlas](https://cloud.mongodb.com)
2. Получите строку подключения
3. Добавьте в MONGODB_URI

## 🛡️ Безопасность

- Валидация данных на сервере
- Защита от CSRF атак
- Ограничение голосования (1 голос на пользователя)
- Санитизация пользовательского ввода

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

Создано с ❤️ для объединения людей через события!
