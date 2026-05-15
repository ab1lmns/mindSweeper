# 💣 MindSweeper

> Chess.com для Сапёра. ELO рейтинг, AI Coach, Daily Challenge, 1v1 дуэли.

## Быстрый старт

### 1. Установить зависимости
```bash
npm install
```

### 2. Настроить переменные
```bash
cp .env.example .env.local
```

Заполни `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Настроить Supabase
1. Зайди на [supabase.com](https://supabase.com) → New Project
2. SQL Editor → выполни файл `supabase/schema.sql`
3. Authentication → Providers → включи **Google**
4. Скопируй URL и anon key из Settings → API

### 4. Запустить
```bash
npm run dev
```
→ [http://localhost:3000](http://localhost:3000)

## Деплой (Vercel / Netlify)

**Vercel:**
```bash
npm i -g vercel && vercel
```
Добавь `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в переменные окружения.

**Netlify:**
```bash
npm run build
```
Задеплой папку `dist`. Добавь переменные в Site Settings → Environment.

## Стек

| | |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Стили | Tailwind CSS + Framer Motion |
| Auth + DB | Supabase (Google OAuth + email/password) |
| Роутинг | React Router v6 |

## Структура

```
src/
  lib/
    supabase.ts      — клиент Supabase
    gameEngine.ts    — вся логика сапёра (чистый TS)
  hooks/
    useAuth.tsx      — контекст авторизации
    useGame.ts       — хук управления игрой
  components/
    game/            — GameBoard, GameHUD
    layout/          — Navbar
  pages/             — HomePage, PlayPage, DailyPage,
                        LeaderboardPage, ProfilePage,
                        ProPage, LoginPage
  types/             — TypeScript типы, конфиги
supabase/
  schema.sql         — схема БД + RLS + триггер
```

## Авторизация

- **Google OAuth** — один клик
- **Email + Password** — классика
- Профиль создаётся автоматически через Supabase trigger
- Состояние хранится в `AuthContext`, доступно через `useAuth()`

---

*Сапёр — это не удача. Это математика.*
