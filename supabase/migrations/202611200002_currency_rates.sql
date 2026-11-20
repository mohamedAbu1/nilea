-- AlpNile display currencies. Catalog prices remain stored in their source currency;
-- the client converts them using these administrator-controlled rates.

create table if not exists public.exchange_rates (
  currency_code text primary key check (currency_code in ('USD', 'EUR', 'GBP', 'EGP', 'CHF')),
  currency_name text not null,
  symbol text not null,
  rate_to_usd numeric(14, 6) not null check (rate_to_usd > 0),
  decimal_digits smallint not null default 2 check (decimal_digits between 0 and 4),
  is_active boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists exchange_rates_set_updated_at on public.exchange_rates;
create trigger exchange_rates_set_updated_at
before update on public.exchange_rates
for each row execute procedure public.set_updated_at();

insert into public.exchange_rates (currency_code, currency_name, symbol, rate_to_usd, decimal_digits)
values
  ('USD', 'US Dollar', '$', 1, 2),
  ('EUR', 'Euro', '€', 0.92, 2),
  ('GBP', 'Pound Sterling', '£', 0.79, 2),
  ('EGP', 'Egyptian Pound', 'ج.م', 49, 0),
  ('CHF', 'Swiss Franc', 'CHF', 0.88, 2)
on conflict (currency_code) do nothing;

alter table public.exchange_rates enable row level security;

drop policy if exists "everyone can view active exchange rates" on public.exchange_rates;
create policy "everyone can view active exchange rates"
on public.exchange_rates for select
using (is_active or public.is_staff());

drop policy if exists "admins can insert exchange rates" on public.exchange_rates;
create policy "admins can insert exchange rates"
on public.exchange_rates for insert
with check (public.is_admin());

drop policy if exists "admins can update exchange rates" on public.exchange_rates;
create policy "admins can update exchange rates"
on public.exchange_rates for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins can delete exchange rates" on public.exchange_rates;
create policy "admins can delete exchange rates"
on public.exchange_rates for delete
using (public.is_admin());
