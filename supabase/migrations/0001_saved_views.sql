-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Stores each signed-in user's saved globe views: camera position, which
-- layers were toggled, and which airlines were selected in the flights filter.

create table if not exists saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  camera jsonb not null,
  layers jsonb not null,
  selected_airlines text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists saved_views_user_id_idx on saved_views(user_id);

alter table saved_views enable row level security;

-- Each policy is scoped to auth.uid() = user_id, so a user can only ever
-- see/create/delete their own rows -- enforced by Postgres, not app code.
create policy "select_own_saved_views"
  on saved_views for select
  using (auth.uid() = user_id);

create policy "insert_own_saved_views"
  on saved_views for insert
  with check (auth.uid() = user_id);

create policy "delete_own_saved_views"
  on saved_views for delete
  using (auth.uid() = user_id);
