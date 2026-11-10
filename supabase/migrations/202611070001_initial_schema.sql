-- AlpNile relational foundation for Supabase/Postgres.
-- Run this migration first, then run ../seed.sql in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Traveler',
  phone text,
  avatar_url text,
  preferred_locale text not null default 'en',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Traveler'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.profiles.phone),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text not null,
  description text not null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trip_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon_key text,
  tone text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  city_id uuid references public.cities(id) on delete set null,
  location_label text not null,
  category_id uuid references public.trip_categories(id) on delete set null,
  duration_label text not null,
  duration_minutes integer,
  description text not null,
  image_url text,
  price_from numeric(12, 2),
  currency text not null default 'USD',
  rating numeric(2, 1),
  review_count integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trips_duration_positive check (duration_minutes is null or duration_minutes > 0),
  constraint trips_price_non_negative check (price_from is null or price_from >= 0),
  constraint trips_rating_valid check (rating is null or rating between 0 and 5)
);

create table if not exists public.stays (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city_id uuid references public.cities(id) on delete set null,
  location_label text not null,
  stay_type text not null default 'hotel' check (stay_type in ('hotel', 'villa', 'home', 'residence')),
  description text not null,
  image_url text,
  price_from numeric(12, 2),
  currency text not null default 'USD',
  rating numeric(2, 1),
  review_count integer not null default 0,
  amenities text[] not null default '{}',
  max_guests integer,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint stays_price_non_negative check (price_from is null or price_from >= 0),
  constraint stays_rating_valid check (rating is null or rating between 0 and 5),
  constraint stays_guests_positive check (max_guests is null or max_guests > 0)
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  vehicle_type text not null check (vehicle_type in ('suv', 'van', 'sedan', 'minibus')),
  description text,
  image_url text,
  passenger_capacity integer not null,
  luggage_capacity integer,
  price_from numeric(12, 2),
  currency text not null default 'USD',
  with_driver boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint vehicles_capacity_positive check (passenger_capacity > 0),
  constraint vehicles_price_non_negative check (price_from is null or price_from >= 0)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  image_url text,
  price numeric(12, 2) not null,
  currency text not null default 'USD',
  stock_quantity integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_price_non_negative check (price >= 0),
  constraint products_stock_non_negative check (stock_quantity >= 0)
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  request_type text not null check (request_type in ('trip', 'stay', 'car', 'market', 'contact')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'quoted', 'confirmed', 'closed', 'spam')),
  full_name text not null,
  email text,
  phone text,
  message text,
  details jsonb not null default '{}'::jsonb,
  source text not null default 'website',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.car_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  pickup_city_id uuid references public.cities(id) on delete set null,
  dropoff_city_id uuid references public.cities(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  pickup_label text not null,
  dropoff_label text not null,
  dropoff_details text,
  pickup_date date not null,
  pickup_time time,
  return_date date,
  return_time time,
  passengers integer not null default 1,
  driver_service text not null default 'private_driver',
  luggage text,
  extras text[] not null default '{}',
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint car_bookings_passengers_positive check (passengers > 0),
  constraint car_bookings_return_after_pickup check (return_date is null or return_date >= pickup_date)
);

create table if not exists public.trip_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  trip_id uuid references public.trips(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  start_date date,
  end_date date,
  guests integer not null default 1,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trip_bookings_guests_positive check (guests > 0),
  constraint trip_bookings_end_after_start check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.stay_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  stay_id uuid references public.stays(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  check_in date not null,
  check_out date not null,
  guests integer not null default 1,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint stay_bookings_guests_positive check (guests > 0),
  constraint stay_bookings_checkout_after_checkin check (check_out > check_in)
);

create table if not exists public.product_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  delivery_country text not null,
  delivery_address text,
  contact_preference text not null default 'email' check (contact_preference in ('email', 'phone', 'whatsapp')),
  status text not null default 'new' check (status in ('new', 'contacted', 'paid', 'shipped', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.product_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(12, 2) not null,
  quantity integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  constraint product_order_items_price_non_negative check (unit_price >= 0),
  constraint product_order_items_quantity_positive check (quantity > 0)
);

create table if not exists public.saved_destinations (
  user_id uuid not null references public.profiles(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, city_id)
);

create table if not exists public.saved_trips (
  user_id uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, trip_id)
);

create table if not exists public.saved_stays (
  user_id uuid not null references public.profiles(id) on delete cascade,
  stay_id uuid not null references public.stays(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, stay_id)
);

create table if not exists public.saved_products (
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, product_id)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists trips_city_id_idx on public.trips(city_id);
create index if not exists trips_category_id_idx on public.trips(category_id);
create index if not exists stays_city_id_idx on public.stays(city_id);
create index if not exists car_bookings_user_id_idx on public.car_bookings(user_id);
create index if not exists car_bookings_pickup_date_idx on public.car_bookings(pickup_date);
create index if not exists trip_bookings_user_id_idx on public.trip_bookings(user_id);
create index if not exists stay_bookings_user_id_idx on public.stay_bookings(user_id);
create index if not exists product_orders_user_id_idx on public.product_orders(user_id);
create index if not exists inquiries_user_id_idx on public.inquiries(user_id);
create index if not exists inquiries_status_idx on public.inquiries(status);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists cities_set_updated_at on public.cities;
create trigger cities_set_updated_at before update on public.cities for each row execute procedure public.set_updated_at();
drop trigger if exists trip_categories_set_updated_at on public.trip_categories;
create trigger trip_categories_set_updated_at before update on public.trip_categories for each row execute procedure public.set_updated_at();
drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at before update on public.trips for each row execute procedure public.set_updated_at();
drop trigger if exists stays_set_updated_at on public.stays;
create trigger stays_set_updated_at before update on public.stays for each row execute procedure public.set_updated_at();
drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at before update on public.vehicles for each row execute procedure public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute procedure public.set_updated_at();
drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at before update on public.inquiries for each row execute procedure public.set_updated_at();
drop trigger if exists car_bookings_set_updated_at on public.car_bookings;
create trigger car_bookings_set_updated_at before update on public.car_bookings for each row execute procedure public.set_updated_at();
drop trigger if exists trip_bookings_set_updated_at on public.trip_bookings;
create trigger trip_bookings_set_updated_at before update on public.trip_bookings for each row execute procedure public.set_updated_at();
drop trigger if exists stay_bookings_set_updated_at on public.stay_bookings;
create trigger stay_bookings_set_updated_at before update on public.stay_bookings for each row execute procedure public.set_updated_at();
drop trigger if exists product_orders_set_updated_at on public.product_orders;
create trigger product_orders_set_updated_at before update on public.product_orders for each row execute procedure public.set_updated_at();
drop trigger if exists newsletter_subscribers_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_set_updated_at before update on public.newsletter_subscribers for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.trip_categories enable row level security;
alter table public.trips enable row level security;
alter table public.stays enable row level security;
alter table public.vehicles enable row level security;
alter table public.products enable row level security;
alter table public.inquiries enable row level security;
alter table public.car_bookings enable row level security;
alter table public.trip_bookings enable row level security;
alter table public.stay_bookings enable row level security;
alter table public.product_orders enable row level security;
alter table public.product_order_items enable row level security;
alter table public.saved_destinations enable row level security;
alter table public.saved_trips enable row level security;
alter table public.saved_stays enable row level security;
alter table public.saved_products enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "public can view active cities" on public.cities;
create policy "public can view active cities" on public.cities for select using (is_active = true);
drop policy if exists "public can view active trip categories" on public.trip_categories;
create policy "public can view active trip categories" on public.trip_categories for select using (is_active = true);
drop policy if exists "public can view active trips" on public.trips;
create policy "public can view active trips" on public.trips for select using (is_active = true);
drop policy if exists "public can view active stays" on public.stays;
create policy "public can view active stays" on public.stays for select using (is_active = true);
drop policy if exists "public can view active vehicles" on public.vehicles;
create policy "public can view active vehicles" on public.vehicles for select using (is_active = true);
drop policy if exists "public can view active products" on public.products;
create policy "public can view active products" on public.products for select using (is_active = true);

drop policy if exists "users can view their profile" on public.profiles;
create policy "users can view their profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "users can update their profile" on public.profiles;
create policy "users can update their profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "visitors can create inquiries" on public.inquiries;
create policy "visitors can create inquiries" on public.inquiries for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "users can view their inquiries" on public.inquiries;
create policy "users can view their inquiries" on public.inquiries for select using (auth.uid() = user_id);

drop policy if exists "visitors can create car bookings" on public.car_bookings;
create policy "visitors can create car bookings" on public.car_bookings for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "users can view their car bookings" on public.car_bookings;
create policy "users can view their car bookings" on public.car_bookings for select using (auth.uid() = user_id);

drop policy if exists "visitors can create trip bookings" on public.trip_bookings;
create policy "visitors can create trip bookings" on public.trip_bookings for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "users can view their trip bookings" on public.trip_bookings;
create policy "users can view their trip bookings" on public.trip_bookings for select using (auth.uid() = user_id);

drop policy if exists "visitors can create stay bookings" on public.stay_bookings;
create policy "visitors can create stay bookings" on public.stay_bookings for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "users can view their stay bookings" on public.stay_bookings;
create policy "users can view their stay bookings" on public.stay_bookings for select using (auth.uid() = user_id);

drop policy if exists "visitors can create product orders" on public.product_orders;
create policy "visitors can create product orders" on public.product_orders for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "users can view their product orders" on public.product_orders;
create policy "users can view their product orders" on public.product_orders for select using (auth.uid() = user_id);
drop policy if exists "visitors can create order items" on public.product_order_items;
create policy "visitors can create order items" on public.product_order_items for insert with check (
  exists (select 1 from public.product_orders orders where orders.id = order_id and (orders.user_id is null or orders.user_id = auth.uid()))
);
drop policy if exists "users can view their order items" on public.product_order_items;
create policy "users can view their order items" on public.product_order_items for select using (
  exists (select 1 from public.product_orders orders where orders.id = order_id and orders.user_id = auth.uid())
);

drop policy if exists "users can manage saved destinations" on public.saved_destinations;
create policy "users can manage saved destinations" on public.saved_destinations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users can manage saved trips" on public.saved_trips;
create policy "users can manage saved trips" on public.saved_trips for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users can manage saved stays" on public.saved_stays;
create policy "users can manage saved stays" on public.saved_stays for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users can manage saved products" on public.saved_products;
create policy "users can manage saved products" on public.saved_products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "visitors can subscribe to newsletter" on public.newsletter_subscribers;
create policy "visitors can subscribe to newsletter" on public.newsletter_subscribers for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "users can view their newsletter subscription" on public.newsletter_subscribers;
create policy "users can view their newsletter subscription" on public.newsletter_subscribers for select using (auth.uid() = user_id);

