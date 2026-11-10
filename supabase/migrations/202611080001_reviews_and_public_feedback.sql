-- Public feedback layer for the review archive.
-- Run after 202611070001_initial_schema.sql.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  city_country text not null,
  rating integer not null check (rating between 1 and 5),
  journey text not null,
  body text not null,
  avatar_url text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.review_likes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  visitor_key text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (review_id, visitor_key)
);

create index if not exists reviews_status_created_at_idx on public.reviews(status, created_at desc);
create index if not exists review_likes_review_id_idx on public.review_likes(review_id);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews for each row execute procedure public.set_updated_at();

create or replace function public.sync_review_like_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.reviews set like_count = like_count + 1 where id = new.review_id;
    return new;
  end if;
  update public.reviews set like_count = greatest(like_count - 1, 0) where id = old.review_id;
  return old;
end;
$$;

drop trigger if exists review_likes_count_insert on public.review_likes;
create trigger review_likes_count_insert after insert on public.review_likes for each row execute procedure public.sync_review_like_count();
drop trigger if exists review_likes_count_delete on public.review_likes;
create trigger review_likes_count_delete after delete on public.review_likes for each row execute procedure public.sync_review_like_count();

alter table public.reviews enable row level security;
alter table public.review_likes enable row level security;

drop policy if exists "public can view published reviews" on public.reviews;
create policy "public can view published reviews" on public.reviews for select using (status = 'published' or auth.uid() = user_id);
drop policy if exists "visitors can submit reviews" on public.reviews;
create policy "visitors can submit reviews" on public.reviews for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists "public can view review likes" on public.review_likes;
create policy "public can view review likes" on public.review_likes for select using (true);
drop policy if exists "public can add review likes" on public.review_likes;
create policy "public can add review likes" on public.review_likes for insert with check (char_length(visitor_key) between 16 and 128);
drop policy if exists "public can remove own review like" on public.review_likes;
create policy "public can remove own review like" on public.review_likes for delete using (char_length(visitor_key) between 16 and 128);
