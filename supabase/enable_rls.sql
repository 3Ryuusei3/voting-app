-- =====================================================================
-- Activa Row-Level Security (RLS) en todas las tablas públicas y crea
-- políticas mínimas acordes al uso actual de la app.
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- Es idempotente: se puede ejecutar varias veces.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper: ¿el usuario actual es superadmin (role = 1)?
-- SECURITY DEFINER para evitar recursión de políticas sobre "users".
-- ---------------------------------------------------------------------
create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role_id = 1
  );
$$;

-- Helper: ¿el usuario actual tiene permiso sobre una encuesta?
create or replace function public.has_poll_access(p_poll_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.permissions
    where user_id = auth.uid() and poll_id = p_poll_id
  );
$$;

revoke all on function public.is_superadmin() from public, anon;
revoke all on function public.has_poll_access(bigint) from public, anon;
grant execute on function public.is_superadmin() to authenticated;
grant execute on function public.has_poll_access(bigint) to authenticated;

-- ---------------------------------------------------------------------
-- 1. Activar RLS en todas las tablas
-- ---------------------------------------------------------------------
alter table public.users       enable row level security;
alter table public.permissions enable row level security;
alter table public.polls       enable row level security;
alter table public.options     enable row level security;
alter table public.votes       enable row level security;

-- ---------------------------------------------------------------------
-- 2. users: cada usuario lee solo su propia fila (para obtener su rol)
-- ---------------------------------------------------------------------
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (id = auth.uid() or public.is_superadmin());

-- ---------------------------------------------------------------------
-- 3. permissions: cada usuario lee sus propios permisos
-- ---------------------------------------------------------------------
drop policy if exists "permissions_select_own" on public.permissions;
create policy "permissions_select_own" on public.permissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_superadmin());

-- ---------------------------------------------------------------------
-- 4. polls: se leen solo las encuestas a las que tienes acceso
-- ---------------------------------------------------------------------
drop policy if exists "polls_select_with_access" on public.polls;
create policy "polls_select_with_access" on public.polls
  for select to authenticated
  using (public.has_poll_access(id) or public.is_superadmin());

-- ---------------------------------------------------------------------
-- 5. options: lectura y alta de términos en encuestas con acceso
-- ---------------------------------------------------------------------
drop policy if exists "options_select_with_access" on public.options;
create policy "options_select_with_access" on public.options
  for select to authenticated
  using (public.has_poll_access(poll_id) or public.is_superadmin());

drop policy if exists "options_insert_with_access" on public.options;
create policy "options_insert_with_access" on public.options
  for insert to authenticated
  with check (public.has_poll_access(poll_id) or public.is_superadmin());

-- ---------------------------------------------------------------------
-- 6. votes: cada usuario gestiona solo sus votos; superadmin todos
-- ---------------------------------------------------------------------
drop policy if exists "votes_select_own" on public.votes;
create policy "votes_select_own" on public.votes
  for select to authenticated
  using (user_id = auth.uid() or public.is_superadmin());

drop policy if exists "votes_insert_own" on public.votes;
create policy "votes_insert_own" on public.votes
  for insert to authenticated
  with check (user_id = auth.uid() and public.has_poll_access(poll_id));

drop policy if exists "votes_update_own" on public.votes;
create policy "votes_update_own" on public.votes
  for update to authenticated
  using (user_id = auth.uid() or public.is_superadmin())
  with check (user_id = auth.uid() or public.is_superadmin());

-- ---------------------------------------------------------------------
-- 7. Comprobación: lista tablas públicas que siguen SIN RLS
--    (debe devolver 0 filas)
-- ---------------------------------------------------------------------
select tablename
from pg_tables
where schemaname = 'public' and rowsecurity = false;
