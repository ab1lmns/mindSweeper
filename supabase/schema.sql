-- Выполни в Supabase → SQL Editor

-- Профили пользователей
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  avatar_url text,
  elo_rating integer default 1000,
  country text default 'KZ',
  city text default 'Алматы',
  is_pro boolean default false,
  games_played integer default 0,
  games_won integer default 0,
  best_time_easy integer,
  best_time_medium integer,
  best_time_hard integer,
  best_score_rush integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  created_at timestamptz default now()
);

-- Игры
create table games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  difficulty text check (difficulty in ('easy','medium','hard','custom')),
  width integer not null,
  height integer not null,
  mines_count integer not null,
  result text check (result in ('win','loss')),
  time_seconds integer,
  board_seed text,
  created_at timestamptz default now()
);

-- Daily результаты
create table daily_results (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  user_id uuid references profiles(id) on delete cascade,
  time_seconds integer,
  result text check (result in ('win','loss')),
  completed_at timestamptz default now(),
  unique(date, user_id)
);

-- Достижения
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  achievement_key text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_key)
);

-- RLS
alter table profiles enable row level security;
alter table games enable row level security;
alter table daily_results enable row level security;
alter table achievements enable row level security;

create policy "Public profiles"         on profiles for select using (true);
create policy "Own profile insert"      on profiles for insert with check (auth.uid() = id);
create policy "Own profile update"      on profiles for update using (auth.uid() = id);
create policy "Own games"               on games for all using (auth.uid() = user_id);
create policy "Public daily results"    on daily_results for select using (true);
create policy "Own daily insert"        on daily_results for insert with check (auth.uid() = user_id);
create policy "Public achievements"     on achievements for select using (true);
create policy "Own achievements insert" on achievements for insert with check (auth.uid() = user_id);

-- Автосоздание профиля при регистрации
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      new.raw_user_meta_data->>'user_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
