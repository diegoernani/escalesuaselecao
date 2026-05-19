-- Optional helper used before Google OAuth login.
-- It checks whether an e-mail already exists in Supabase Auth.
-- Run this in Supabase SQL Editor.

create or replace function public.user_exists_by_email(p_email text)
returns boolean
language sql
security definer
set search_path = auth, public
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

revoke all on function public.user_exists_by_email(text) from public;
grant execute on function public.user_exists_by_email(text) to anon;
grant execute on function public.user_exists_by_email(text) to authenticated;
