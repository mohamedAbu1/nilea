-- Secure the anonymous review-like and newsletter mutations behind validated RPCs.
-- Run after 202611080001_reviews_and_public_feedback.sql.

drop policy if exists "visitors can submit reviews" on public.reviews;
create policy "visitors can submit reviews" on public.reviews
  for insert
  with check (
    status = 'pending'
    and like_count = 0
    and (user_id is null or user_id = auth.uid())
  );

drop policy if exists "public can view review likes" on public.review_likes;
drop policy if exists "public can add review likes" on public.review_likes;
drop policy if exists "public can remove own review like" on public.review_likes;

create or replace function public.toggle_review_like(p_review_id uuid, p_visitor_key text)
returns table(liked boolean, like_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  had_like boolean;
begin
  if p_visitor_key is null or char_length(p_visitor_key) not between 16 and 128 then
    raise exception 'Invalid visitor key';
  end if;

  if not exists (select 1 from public.reviews where id = p_review_id and status = 'published') then
    raise exception 'Review not found';
  end if;

  select exists (
    select 1 from public.review_likes
    where review_id = p_review_id and visitor_key = p_visitor_key
  ) into had_like;

  if had_like then
    delete from public.review_likes where review_id = p_review_id and visitor_key = p_visitor_key;
  else
    insert into public.review_likes (review_id, visitor_key)
    values (p_review_id, p_visitor_key)
    on conflict (review_id, visitor_key) do nothing;
  end if;

  return query
    select not had_like,
      (select count(*)::integer from public.review_likes where review_id = p_review_id);
end;
$$;

revoke all on function public.toggle_review_like(uuid, text) from public;
grant execute on function public.toggle_review_like(uuid, text) to anon, authenticated;

drop policy if exists "visitors can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "users can update their newsletter subscription" on public.newsletter_subscribers;

create or replace function public.subscribe_to_newsletter(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
begin
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid email address';
  end if;

  insert into public.newsletter_subscribers (email, user_id, is_active)
  values (normalized_email, auth.uid(), true)
  on conflict (email) do update
    set is_active = true,
        user_id = coalesce(public.newsletter_subscribers.user_id, excluded.user_id),
        updated_at = timezone('utc', now());
end;
$$;

revoke all on function public.subscribe_to_newsletter(text) from public;
grant execute on function public.subscribe_to_newsletter(text) to anon, authenticated;
