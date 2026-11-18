-- =====================================================================
-- Optimiza las políticas RLS: mismas reglas de acceso, pero evaluadas
-- una sola vez por consulta en lugar de una vez por fila.
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- Es idempotente: se puede ejecutar varias veces.
-- =====================================================================

-- Encuestas a las que tiene acceso el usuario actual (se calcula una vez)
create or replace function public.my_poll_ids()
returns setof bigint
language sql
stable
security definer
set search_path = public
as $$
  select poll_id::bigint from public.permissions where user_id = auth.uid();
$$;

revoke all on function public.my_poll_ids() from public, anon;
grant execute on function public.my_poll_ids() to authenticated;

-- ---------------------------------------------------------------------
-- Políticas reescritas: envolver en (select ...) hace que Postgres las
-- evalúe una vez (InitPlan) y no por cada fila.
-- ---------------------------------------------------------------------
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_superadmin()));

drop policy if exists "permissions_select_own" on public.permissions;
create policy "permissions_select_own" on public.permissions
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_superadmin()));

drop policy if exists "polls_select_with_access" on public.polls;
create policy "polls_select_with_access" on public.polls
  for select to authenticated
  using (id in (select public.my_poll_ids()) or (select public.is_superadmin()));

drop policy if exists "options_select_with_access" on public.options;
create policy "options_select_with_access" on public.options
  for select to authenticated
  using (poll_id in (select public.my_poll_ids()) or (select public.is_superadmin()));

drop policy if exists "options_insert_with_access" on public.options;
create policy "options_insert_with_access" on public.options
  for insert to authenticated
  with check (poll_id in (select public.my_poll_ids()) or (select public.is_superadmin()));

drop policy if exists "votes_select_own" on public.votes;
create policy "votes_select_own" on public.votes
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_superadmin()));

drop policy if exists "votes_insert_own" on public.votes;
create policy "votes_insert_own" on public.votes
  for insert to authenticated
  with check (user_id = (select auth.uid()) and poll_id in (select public.my_poll_ids()));

drop policy if exists "votes_update_own" on public.votes;
create policy "votes_update_own" on public.votes
  for update to authenticated
  using (user_id = (select auth.uid()) or (select public.is_superadmin()))
  with check (user_id = (select auth.uid()) or (select public.is_superadmin()));

-- ---------------------------------------------------------------------
-- Índices para las columnas que filtran las políticas y las RPCs
-- ---------------------------------------------------------------------
create index if not exists options_poll_id_idx      on public.options (poll_id);
create index if not exists votes_user_poll_idx      on public.votes (user_id, poll_id);
create index if not exists votes_option_id_idx      on public.votes (option_id);
create index if not exists permissions_user_id_idx  on public.permissions (user_id);
