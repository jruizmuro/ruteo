-- Extensión PostGIS para geometría geoespacial (usada en Fase 4)
create extension if not exists postgis;

-- Tabla profiles vinculada a auth.users de Supabase
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text not null,
  avatar_url text,
  provider text not null check (provider in ('google', 'strava', 'apple')),
  created_at timestamptz not null default now()
);

-- RLS activo
alter table public.profiles enable row level security;

-- Políticas: cada usuario solo ve y edita su propio perfil
create policy "Perfil propio — lectura" on public.profiles
  for select using (auth.uid() = id);

create policy "Perfil propio — inserción" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Perfil propio — actualización" on public.profiles
  for update using (auth.uid() = id);
