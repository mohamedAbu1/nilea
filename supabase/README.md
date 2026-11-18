# AlpNile Supabase database

The database is split into a public catalog and user-owned requests.

## Relationship map

```text
auth.users 1──1 profiles
cities 1──* trips
cities 1──* stays
trip_categories 1──* trips
vehicles 1──* car_bookings
trips 1──* trip_bookings
stays 1──* stay_bookings
product_orders 1──* product_order_items
products 1──* product_order_items
profiles 1──* inquiries / bookings / orders
profiles *──* cities / trips / stays / products through saved_* tables
reviews 1──* review_likes
```

## Apply it in Supabase

1. Open the Supabase project SQL Editor.
2. Run `migrations/202611070001_initial_schema.sql`.
3. Run `migrations/202611080001_reviews_and_public_feedback.sql`.
4. Run `migrations/202611090001_profile_gender.sql`.
5. Run `migrations/202611150001_secure_public_mutations.sql`.
6. Run `seed.sql` for the curated AlpNile starter records.
7. Run `migrations/202611150002_public_catalog_import.sql` to import the sanitized public catalog from the supplied SQL export (31 trips, day plans, inclusions and anonymized reviews).
8. Keep the browser client configured with the public URL and anon key only. Never put a service-role key in `.env.local` exposed to the browser.

The migration enables Row Level Security. Public visitors can read active catalog records and submit requests, while authenticated users can read only their own profile, bookings, inquiries, orders and saved items. Catalog changes should be made from the Supabase dashboard or a protected server-side process.

The supplied `messages.sql`, `notifications.sql`, `purchases.sql` and `push_tokens.sql` exports are intentionally not imported into the public website. They contain private operational records, contact details and device tokens; keep them in a protected back-office workflow with separate access controls.

Review submissions start as `pending`; publish approved notes by updating `public.reviews.status` to `published` from the Supabase dashboard. Likes are anonymous per browser and are protected by an opaque visitor key stored locally.
