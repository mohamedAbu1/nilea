-- Store the user's account classification and last-known device context.
-- Run after 202611200003_promote_alpnile_admins.sql.

alter table public.profiles
  add column if not exists account_type text generated always as (
    case
      when access_role in ('support', 'editor', 'admin') then 'admin'
      else 'user'
    end
  ) stored;

alter table public.profiles
  add column if not exists device_type text not null default 'computer';

alter table public.profiles
  drop constraint if exists profiles_device_type_check;

alter table public.profiles
  add constraint profiles_device_type_check
  check (device_type in ('phone', 'computer'));

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

-- Keep gender available even when this migration is applied to a partially migrated project.
alter table public.profiles
  add column if not exists gender text;

alter table public.profiles
  drop constraint if exists profiles_gender_check;

alter table public.profiles
  add constraint profiles_gender_check
  check (gender is null or gender in ('male', 'female'));

-- Keep all profile attributes in sync for future Auth users.
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
  requested_device text := case
    when lower(coalesce(new.raw_user_meta_data ->> 'device_type', '')) in ('phone', 'mobile') then 'phone'
    else 'computer'
  end;
begin
  insert into public.profiles (id, full_name, phone, avatar_url, gender, access_role, device_type, last_seen_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Traveler'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    requested_role,
    requested_device,
    timezone('utc', now())
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    gender = coalesce(excluded.gender, public.profiles.gender),
    access_role = case when requested_role = 'admin' then 'admin' else public.profiles.access_role end,
    device_type = excluded.device_type,
    last_seen_at = timezone('utc', now()),
    updated_at = timezone('utc', now());
  return new;
end;
$$;
