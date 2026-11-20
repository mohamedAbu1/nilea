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
8. Run `migrations/202611200001_chat_and_admin_dashboard.sql` to enable the private support inbox, attachment storage, Realtime messages and staff permissions.
9. Run `migrations/202611200002_currency_rates.sql` to enable the public currency selector and administrator-controlled exchange rates.
10. Promote the first staff member from the SQL Editor, replacing the placeholder UUID with the authenticated profile id:

   ```sql
   update public.profiles
   set access_role = 'admin'
   where id = '00000000-0000-0000-0000-000000000000';
   ```

   Staff can then open `/admin`. Use `support` for inbox and request handling, `editor` for catalog management, and `admin` for both plus role administration.
11. Keep the browser client configured with the public URL and anon key only. Never put a service-role key in `.env.local` exposed to the browser.

The migrations enable Row Level Security. Public visitors can read active catalog records, active exchange rates and submit requests, while authenticated users can read only their own profile, bookings, inquiries, orders, saved items and chat conversations. Staff access is controlled by `profiles.access_role`; never grant that role from a client-side form. Catalog changes and exchange-rate changes can be made from `/admin` after the role is granted, the Supabase dashboard or another protected server-side process. Catalog amounts are treated as USD by the frontend unless a record explicitly carries another source currency; exchange-rate values represent how many units of the target currency equal one USD.

The supplied `messages.sql`, `notifications.sql`, `purchases.sql` and `push_tokens.sql` exports are intentionally not imported into the public website. They contain private operational records, contact details and device tokens; keep them in a protected back-office workflow with separate access controls.

Review submissions start as `pending`; publish approved notes by updating `public.reviews.status` to `published` from the Supabase dashboard. Likes are anonymous per browser and are protected by an opaque visitor key stored locally.
