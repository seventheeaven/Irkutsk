# Настройка Cloudinary для оптимизации изображений

## Шаг 1: Регистрация в Cloudinary

1. Зайди на https://cloudinary.com/
2. Нажми "Sign Up for Free"
3. Зарегистрируйся (бесплатный тариф дает 25 GB хранилища и 25 GB трафика в месяц)

## Шаг 2: Получение API ключей

1. После регистрации зайди в Dashboard
2. В правом верхнем углу найди "Account Details" или перейди по ссылке: https://console.cloudinary.com/settings/api
3. Скопируй следующие значения:
   - **Cloud Name** (например: `dxy8example`)
   - **API Key** (например: `123456789012345`)
   - **API Secret** (например: `abcdefghijklmnopqrstuvwxyz123456`)

## Шаг 3: Добавление переменных окружения в Vercel

1. Зайди в Vercel → твой проект → **Settings** → **Environment Variables**
2. У тебя есть два варианта:

### Вариант 1: Использовать CLOUDINARY_URL (проще)

1. В Cloudinary Dashboard скопируй **API environment variable** (полная строка вида `CLOUDINARY_URL=cloudinary://...`)
2. В Vercel добавь переменную:
   - **Name**: `CLOUDINARY_URL`
   - **Value**: скопированная строка (без `CLOUDINARY_URL=`, только `cloudinary://...`)
   - **Environment**: Production, Preview, Development (выбери все)
3. Нажми "Save"

### Вариант 2: Использовать отдельные переменные

Добавь три переменные:

   - **Name**: `CLOUDINARY_CLOUD_NAME`
   - **Value**: `dojojozli` (твой Cloud Name)
   - **Environment**: Production, Preview, Development (выбери все)

   - **Name**: `CLOUDINARY_API_KEY`
   - **Value**: `231429224618582` (твой API Key)
   - **Environment**: Production, Preview, Development (выбери все)

   - **Name**: `CLOUDINARY_API_SECRET`
   - **Value**: твой API Secret (нажми на иконку глаза в Cloudinary, чтобы увидеть)
   - **Environment**: Production, Preview, Development (выбери все)

3. Нажми "Save" для каждой переменной

**Рекомендация:** Используй Вариант 1 (CLOUDINARY_URL) - это проще и надежнее.

## Шаг 4: Перезапуск деплоя

После добавления переменных окружения:
1. Перейди в **Deployments**
2. Нажми "Redeploy" на последнем деплое
3. Или сделай новый push в GitHub - Vercel автоматически перезапустит деплой

## Что изменилось:

### До:
- Изображения хранились как base64 в Vercel KV
- Каждое изображение занимало ~2-5 MB в базе данных
- Загрузка была медленной, особенно на мобильных

### После:
- Изображения загружаются в Cloudinary CDN
- В Vercel KV хранятся только URL (несколько байт)
- Cloudinary автоматически:
  - Оптимизирует изображения (WebP, AVIF)
  - Ресайзит под разные экраны
  - Кеширует по всему миру
  - Ускоряет загрузку в 10-100 раз

## Проверка работы:

1. Открой сервис
2. Создай новую публикацию с изображением
3. Изображение должно загрузиться быстро
4. В консоли браузера (F12) проверь, что изображения загружаются с `res.cloudinary.com`

## Важно:

- Бесплатный тариф Cloudinary: 25 GB хранилища, 25 GB трафика в месяц
- Для MVP этого более чем достаточно
- Если превысишь лимит, Cloudinary уведомит тебя заранее

