# 🎭 Афиша мероприятий

MVP-сайт для создания и поиска мероприятий с возможностью голосования и общения в чатах.

## 🚀 Технологии

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Аутентификация**: JWT + NextAuth.js
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

## 🛠️ Локальная разработка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd city-affiche
npm install
```

### 2. Настройка переменных окружения
Скопируйте `env.example` в `.env.local` и заполните переменные:

```bash
cp env.example .env.local
```

Пример для локальной разработки:
```env
# MongoDB (локальная)
MONGODB_URI=mongodb://username:password@localhost:27017/city-affiche?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# UploadThing (опционально)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### 3. Инициализация базы данных
```bash
npm run init-prod
```

### 4. Запуск в режиме разработки
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🚀 Деплой на Vercel

### 1. Подготовка MongoDB Atlas

1. **Создайте аккаунт** на [MongoDB Atlas](https://cloud.mongodb.com)
2. **Создайте кластер** (выберите FREE tier для начала)
3. **Создайте пользователя базы данных**:
   - Database Access → Add New Database User
   - Выберите Password authentication
   - Запомните username и password
4. **Настройте сетевой доступ**:
   - Network Access → Add IP Address
   - Выберите "Allow access from anywhere" (0.0.0.0/0)
5. **Получите строку подключения**:
   - Clusters → Connect → Connect your application
   - Скопируйте connection string

### 2. Настройка UploadThing (опционально)

1. **Создайте аккаунт** на [UploadThing](https://uploadthing.com)
2. **Создайте новое приложение**
3. **Получите API ключи** из дашборда

### 3. Деплой на Vercel

#### Вариант A: Через GitHub (рекомендуется)

1. **Загрузите код на GitHub**:
```bash
git add .
git commit -m "Подготовка к деплою"
git push origin main
```

2. **Подключите к Vercel**:
   - Зайдите на [vercel.com](https://vercel.com)
   - Import Git Repository
   - Выберите ваш репозиторий

3. **Настройте переменные окружения** в Vercel:
   - Settings → Environment Variables
   - Добавьте все переменные из `env.example`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/city-affiche?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-different-from-jwt
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
NODE_ENV=production
```

4. **Деплой**:
   - Нажмите "Deploy"
   - Дождитесь завершения сборки

#### Вариант B: Через Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 4. Инициализация продакшен базы данных

После успешного деплоя выполните инициализацию:

```bash
# Локально с продакшен переменными
NODE_ENV=production npm run init-prod
```

Или создайте временный скрипт на Vercel для инициализации.

### 5. Обновление домена

Обновите переменную `NEXTAUTH_URL` на ваш реальный домен:
```env
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## 🔧 Дополнительные настройки

### Кастомный домен

1. **В Vercel**:
   - Settings → Domains
   - Add Domain
   - Следуйте инструкциям по настройке DNS

2. **Обновите переменные окружения**:
```env
NEXTAUTH_URL=https://your-custom-domain.com
```

### Мониторинг и логи

- **Vercel Dashboard**: автоматические логи и метрики
- **MongoDB Atlas**: мониторинг базы данных
- **Опционально**: интеграция с Sentry для отслеживания ошибок

### Резервное копирование

Настройте автоматическое резервное копирование в MongoDB Atlas:
- Clusters → Backup → Enable

## 📊 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   │   ├── events/        # CRUD мероприятий
│   │   ├── cities/        # Управление городами
│   │   └── auth/         # Аутентификация
│   ├── city/[slug]/      # Страницы городов
│   ├── login/            # Авторизация
│   └── register/         # Регистрация
├── components/            # React компоненты
├── lib/                  # Утилиты и конфигурация
├── models/               # Mongoose схемы
└── types/                # TypeScript типы
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
- `GET /api/cities` - список городов

## 🛡️ Безопасность

- Валидация данных на сервере
- JWT аутентификация
- Заголовки безопасности
- Ограничение rate limiting
- Санитизация пользовательского ввода

## 🚨 Troubleshooting

### Проблемы с подключением к MongoDB

1. **Проверьте строку подключения**:
   - Правильность username/password
   - Название базы данных
   - Сетевой доступ в Atlas

2. **Проверьте переменные окружения**:
```bash
npm run init-prod
```

### Проблемы с аутентификацией

1. **Проверьте JWT_SECRET**:
   - Должен быть не менее 32 символов
   - Одинаковый для всех инстансов

2. **Проверьте NEXTAUTH_URL**:
   - Должен совпадать с доменом приложения

### Проблемы с изображениями

1. **Настройте UploadThing**:
   - Проверьте API ключи
   - Обновите домены в `next.config.ts`

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
