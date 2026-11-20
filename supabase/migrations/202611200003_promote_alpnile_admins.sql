-- Promote the requested AlpNile administrator accounts.
-- Run after 202611200001_chat_and_admin_dashboard.sql.

do $$
begin
  update public.profiles as profile
  set access_role = 'admin',
      updated_at = timezone('utc', now())
  from auth.users as auth_user
  where auth_user.id = profile.id
    and lower(trim(coalesce(auth_user.email, ''))) in (
      'mohamedahmed33m11@gmail.com',
      'kanow54@gmail.com'
    );
end;
$$;

-- Keep the same allowlist for future sign-ups and prevent client-side role changes.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(new.email, '')));
  requested_role text := case
    when normalized_email in (
      'mohamedahmed33m11@gmail.com',
      'kanow54@gmail.com'
    ) then 'admin'
    else 'traveler'
  end;
begin
  insert into public.profiles (id, full_name, phone, avatar_url, access_role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Traveler'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    requested_role
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    access_role = case when requested_role = 'admin' then 'admin' else public.profiles.access_role end,
    updated_at = timezone('utc', now());
  return new;
end;
$$;
