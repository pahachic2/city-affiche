# 🚀 Deployment Checklist - City Affiche

## 📋 Pre-Deployment Checklist

### ✅ 1. Environment Setup
- [ ] MongoDB Atlas кластер создан и настроен
- [ ] Пользователь базы данных создан с правильными правами
- [ ] Сетевой доступ настроен (0.0.0.0/0 для продакшена)
- [ ] Строка подключения MongoDB получена
- [ ] UploadThing аккаунт создан (опционально)
- [ ] UploadThing API ключи получены (опционально)

### ✅ 2. Code Preparation
- [ ] Все изменения закоммичены в Git
- [ ] Код загружен на GitHub
- [ ] `env.example` файл создан с примерами переменных
- [ ] Тестовые скрипты очищены от localhost ссылок
- [ ] Production логирование настроено

### ✅ 3. Vercel Setup
- [ ] Vercel аккаунт создан
- [ ] GitHub репозиторий подключен к Vercel
- [ ] Переменные окружения настроены в Vercel
- [ ] Домен настроен (если используется кастомный)

## 🔧 Environment Variables

Убедитесь, что все эти переменные настроены в Vercel:

```env
# Обязательные
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/city-affiche?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-different-from-jwt
NODE_ENV=production

# Опциональные
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

## 🚀 Deployment Steps

### 1. Final Code Check
```bash
# Проверка типов
npm run type-check

# Проверка линтера
npm run lint

# Тестовая сборка
npm run build
```

### 2. Deploy to Vercel
```bash
# Через Git (автоматический деплой)
git add .
git commit -m "Production deployment"
git push origin main

# Или через CLI
vercel --prod
```

### 3. Post-Deployment Verification

#### ✅ Basic Functionality
- [ ] Главная страница загружается
- [ ] API endpoints отвечают
- [ ] База данных подключена
- [ ] Регистрация работает
- [ ] Авторизация работает
- [ ] Создание событий работает
- [ ] Голосование работает
- [ ] Чат работает

#### ✅ Performance Check
- [ ] Время загрузки страниц < 3 сек
- [ ] Изображения оптимизированы
- [ ] API endpoints отвечают быстро
- [ ] Нет ошибок в консоли браузера

#### ✅ Security Check
- [ ] HTTPS работает
- [ ] Заголовки безопасности настроены
- [ ] JWT токены работают корректно
- [ ] Переменные окружения защищены

## 🔍 Testing URLs

После деплоя протестируйте эти URL:

```
https://your-app-name.vercel.app/
https://your-app-name.vercel.app/api/cities
https://your-app-name.vercel.app/api/events
https://your-app-name.vercel.app/login
https://your-app-name.vercel.app/register
https://your-app-name.vercel.app/city/moskva
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
```bash
# Проверить переменные окружения
npm run init-prod

# Проверить строку подключения
# Убедиться что IP адрес разрешен в Atlas
```

### Build Errors
```bash
# Очистить кэш
rm -rf .next
npm run build

# Проверить зависимости
npm install
```

### Runtime Errors
```bash
# Проверить логи в Vercel Dashboard
# Functions → View Function Logs
```

## 📊 Monitoring

### Vercel Dashboard
- Analytics → Performance metrics
- Functions → Error tracking
- Deployments → Build logs

### MongoDB Atlas
- Clusters → Metrics
- Database → Collections
- Network Access → IP Whitelist

### Optional: External Monitoring
- Sentry для отслеживания ошибок
- Google Analytics для пользовательской аналитики
- Uptime monitoring сервисы

## 🔄 Continuous Deployment

После настройки автоматический деплой будет происходить при:
- Push в main branch
- Merge pull request
- Manual trigger в Vercel

## 📝 Post-Launch Tasks

### Immediate (первые 24 часа)
- [ ] Мониторинг ошибок
- [ ] Проверка производительности
- [ ] Тестирование всех функций
- [ ] Backup базы данных

### Short-term (первая неделя)
- [ ] Настройка мониторинга
- [ ] Оптимизация производительности
- [ ] Сбор обратной связи пользователей
- [ ] Планирование улучшений

### Long-term (первый месяц)
- [ ] Анализ метрик использования
- [ ] Масштабирование при необходимости
- [ ] Регулярные бэкапы
- [ ] Security audit

## 🆘 Emergency Contacts

- **Vercel Support**: support@vercel.com
- **MongoDB Atlas Support**: через Atlas dashboard
- **UploadThing Support**: support@uploadthing.com

## 📚 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [UploadThing Documentation](https://docs.uploadthing.com/) 