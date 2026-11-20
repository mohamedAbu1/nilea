-- AlpNile support inbox, live chat, attachments and staff controls.
-- Run after 202611150002_public_catalog_import.sql.

alter table public.profiles
  add column if not exists access_role text not null default 'traveler';

alter table public.profiles
  drop constraint if exists profiles_access_role_check;

alter table public.profiles
  add constraint profiles_access_role_check
  check (access_role in ('traveler', 'support', 'editor', 'admin'));

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and access_role in ('support', 'editor', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and access_role in ('editor', 'admin')
  );
$$;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.access_role is distinct from old.access_role
     and not public.is_admin() then
    raise exception 'Only an administrator can change access roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_access_role on public.profiles;
create trigger profiles_protect_access_role
before update on public.profiles
for each row execute procedure public.prevent_profile_role_escalation();

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  subject text not null default 'AlpNile support',
  status text not null default 'open' check (status in ('open', 'pending', 'resolved', 'closed')),
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_role text not null default 'user' check (sender_role in ('user', 'staff')),
  body text not null default '',
  message_type text not null default 'text' check (message_type in ('text', 'emoji', 'image', 'file')),
  attachment_path text,
  attachment_name text,
  attachment_mime text,
  attachment_size integer,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint chat_messages_content_present check (
    char_length(trim(body)) > 0 or attachment_path is not null
  )
);

create index if not exists chat_conversations_user_id_idx on public.chat_conversations(user_id);
create index if not exists chat_conversations_status_idx on public.chat_conversations(status);
create index if not exists chat_conversations_last_message_idx on public.chat_conversations(last_message_at desc);
create index if not exists chat_messages_conversation_id_idx on public.chat_messages(conversation_id, created_at);

create or replace function public.protect_chat_message_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.conversation_id is distinct from old.conversation_id
     or new.sender_id is distinct from old.sender_id
     or new.sender_role is distinct from old.sender_role
     or new.body is distinct from old.body
     or new.message_type is distinct from old.message_type
     or new.attachment_path is distinct from old.attachment_path
     or new.attachment_name is distinct from old.attachment_name
     or new.attachment_mime is distinct from old.attachment_mime
     or new.attachment_size is distinct from old.attachment_size
     or new.created_at is distinct from old.created_at then
    raise exception 'Chat messages cannot be edited after sending';
  end if;
  return new;
end;
$$;

drop trigger if exists chat_messages_protect_identity on public.chat_messages;
create trigger chat_messages_protect_identity
before update on public.chat_messages
for each row execute procedure public.protect_chat_message_identity();

drop trigger if exists chat_conversations_set_updated_at on public.chat_conversations;
create trigger chat_conversations_set_updated_at
before update on public.chat_conversations
for each row execute procedure public.set_updated_at();

create or replace function public.touch_chat_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_conversations
  set last_message_at = new.created_at,
      updated_at = timezone('utc', now()),
      status = case
        when new.sender_role = 'staff' then 'pending'
        else 'open'
      end
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists chat_messages_touch_conversation on public.chat_messages;
create trigger chat_messages_touch_conversation
after insert on public.chat_messages
for each row execute procedure public.touch_chat_conversation();

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "users can view own conversations" on public.chat_conversations;
create policy "users can view own conversations"
on public.chat_conversations for select
using (auth.uid() = user_id or public.is_staff());

drop policy if exists "users can create own conversations" on public.chat_conversations;
create policy "users can create own conversations"
on public.chat_conversations for insert
with check (auth.uid() = user_id);

drop policy if exists "staff can update conversations" on public.chat_conversations;
create policy "staff can update conversations"
on public.chat_conversations for update
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "users and staff can view messages" on public.chat_messages;
create policy "users and staff can view messages"
on public.chat_messages for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.chat_conversations conversations
    where conversations.id = chat_messages.conversation_id
      and conversations.user_id = auth.uid()
  )
);

drop policy if exists "users and staff can send messages" on public.chat_messages;
create policy "users and staff can send messages"
on public.chat_messages for insert
with check (
  sender_id = auth.uid()
  and (
    (sender_role = 'user' and exists (
      select 1
      from public.chat_conversations conversations
      where conversations.id = chat_messages.conversation_id
        and conversations.user_id = auth.uid()
    ))
    or (sender_role = 'staff' and public.is_staff())
  )
);

drop policy if exists "users and staff can mark messages read" on public.chat_messages;
create policy "users and staff can mark messages read"
on public.chat_messages for update
using (
  public.is_staff()
  or exists (
    select 1
    from public.chat_conversations conversations
    where conversations.id = chat_messages.conversation_id
      and conversations.user_id = auth.uid()
  )
)
with check (
  public.is_staff()
  or exists (
    select 1
    from public.chat_conversations conversations
    where conversations.id = chat_messages.conversation_id
      and conversations.user_id = auth.uid()
  )
);

drop policy if exists "staff can view all profiles" on public.profiles;
create policy "staff can view all profiles"
on public.profiles for select
using (auth.uid() = id or public.is_staff());

drop policy if exists "staff can view all inquiries" on public.inquiries;
create policy "staff can view all inquiries"
on public.inquiries for select
using (auth.uid() = user_id or public.is_staff());

drop policy if exists "staff can update inquiries" on public.inquiries;
create policy "staff can update inquiries"
on public.inquiries for update
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "staff can view all car bookings" on public.car_bookings;
create policy "staff can view all car bookings"
on public.car_bookings for select
using (auth.uid() = user_id or public.is_staff());

drop policy if exists "staff can update car bookings" on public.car_bookings;
create policy "staff can update car bookings"
on public.car_bookings for update
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "staff can view all trip bookings" on public.trip_bookings;
create policy "staff can view all trip bookings"
on public.trip_bookings for select
using (auth.uid() = user_id or public.is_staff());

drop policy if exists "staff can update trip bookings" on public.trip_bookings;
create policy "staff can update trip bookings"
on public.trip_bookings for update
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "staff can view all stay bookings" on public.stay_bookings;
create policy "staff can view all stay bookings"
on public.stay_bookings for select
using (auth.uid() = user_id or public.is_staff());

drop policy if exists "staff can update stay bookings" on public.stay_bookings;
create policy "staff can update stay bookings"
on public.stay_bookings for update
using (public.is_staff())
with check (public.is_staff());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_conversations'
    ) then
      alter publication supabase_realtime add table public.chat_conversations;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
    ) then
      alter publication supabase_realtime add table public.chat_messages;
    end if;
  end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760,
  array['image/*', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat participants can upload attachments" on storage.objects;
create policy "chat participants can upload attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'chat-attachments'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_staff()
  )
);

drop policy if exists "chat participants can read attachments" on storage.objects;
create policy "chat participants can read attachments"
on storage.objects for select
to authenticated
using (
  bucket_id = 'chat-attachments'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_staff()
  )
);

drop policy if exists "chat participants can delete own attachments" on storage.objects;
create policy "chat participants can delete own attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'chat-attachments'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
);
