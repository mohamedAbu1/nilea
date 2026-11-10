-- AlpNile starter catalog. Run after the initial migration.

insert into public.cities (slug, name, region, description, image_url, sort_order)
values
  ('cairo', 'Cairo', 'Lower Egypt · Culture', 'Pyramids, museums and a city that never stops moving.', '/alpnile-city-cairo-v2.png', 1),
  ('luxor', 'Luxor', 'Upper Egypt · Heritage', 'The world''s greatest open-air museum, revealed slowly.', '/alpnile-destination-luxor.png', 2),
  ('abu-simbel', 'Abu Simbel', 'Upper Egypt · Wonder', 'A timeless masterpiece at the edge of the desert.', '/alpnile-destination-abu-simbel.png', 3),
  ('alexandria', 'Alexandria', 'Mediterranean · Coastline', 'Sea air, layered history and a different Egyptian light.', '/alpnile-destination-alexandria.png', 4),
  ('siwa', 'Siwa Oasis', 'Western Desert · Stillness', 'Salt lakes, palm gardens and a slower desert rhythm.', '/alpnile-destination-siwa.png', 5),
  ('hurghada', 'Hurghada', 'Red Sea · Water', 'Clear water, coral gardens and long evenings by the sea.', '/alpnile-destination-hurghada-v2.png', 6),
  ('sharm-el-sheikh', 'Sharm El Sheikh', 'South Sinai · Escape', 'A dramatic coast where desert mountains meet turquoise coves.', '/alpnile-destination-sharm-v2.png', 7)
on conflict (slug) do update set
  name = excluded.name,
  region = excluded.region,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.trip_categories (slug, name, description, icon_key, tone, sort_order)
values
  ('heritage', 'Heritage & culture', 'Temples, museums and stories', 'spark', 'amber', 1),
  ('nile', 'Nile escapes', 'Feluccas, cruises and river light', 'pin', 'blue', 2),
  ('desert', 'Desert & oasis', 'Stillness beyond the map', 'compass', 'sand', 3),
  ('sea', 'Beach & diving', 'Red Sea and Mediterranean days', 'spark', 'coral', 4),
  ('food', 'Food & local life', 'Tables, markets and people', 'bag', 'violet', 5),
  ('family', 'Family journeys', 'Easy days for everyone', 'home', 'blue', 6)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_key = excluded.icon_key,
  tone = excluded.tone,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

with data(slug, title, city_slug, location_label, category_slug, duration_label, duration_minutes, description, image_url, price_from, is_featured) as (
  values
    ('temples-after-dark', 'Temples after dark', 'luxor', 'Luxor', 'heritage', '4 hours', 240, 'A slow evening through stone, shadow and the last light on the Nile.', '/alpnile-tour-temple-night.png', 89, true),
    ('food-walk', 'A table in the city', 'cairo', 'Cairo', 'food', '3 hours', 180, 'A generous food walk through the tastes and rituals locals return to.', '/alpnile-tour-food-walk.png', 75, true),
    ('nile-sunset', 'Sail into the sunset', null, 'Aswan', 'nile', '2.5 hours', 150, 'Quiet water, a traditional felucca and the river changing color around you.', '/alpnile-tour-nile-sunset.png', 65, true),
    ('salt-lakes-stars', 'Salt lakes & stars', 'siwa', 'Siwa Oasis', 'desert', 'Full day', 480, 'A wide-open day of salt water, palm gardens and a sky full of stars.', '/alpnile-destination-siwa.png', 140, false),
    ('coral-garden-morning', 'Coral garden morning', 'hurghada', 'Hurghada', 'sea', '5 hours', 300, 'Clear water, a private boat and the quiet rhythm of the Red Sea.', '/alpnile-destination-hurghada-v2.png', 110, false),
    ('pyramids-family', 'Pyramids with the family', 'cairo', 'Cairo', 'family', '6 hours', 360, 'An easy, story-filled day made for curious eyes of every age.', '/alpnile-city-cairo-v2.png', 120, false)
)
insert into public.trips (slug, title, city_id, location_label, category_id, duration_label, duration_minutes, description, image_url, price_from, is_featured)
select data.slug, data.title, cities.id, data.location_label, categories.id, data.duration_label, data.duration_minutes, data.description, data.image_url, data.price_from, data.is_featured
from data
left join public.cities cities on cities.slug = data.city_slug
left join public.trip_categories categories on categories.slug = data.category_slug
on conflict (slug) do update set
  title = excluded.title,
  city_id = excluded.city_id,
  location_label = excluded.location_label,
  category_id = excluded.category_id,
  duration_label = excluded.duration_label,
  duration_minutes = excluded.duration_minutes,
  description = excluded.description,
  image_url = excluded.image_url,
  price_from = excluded.price_from,
  is_featured = excluded.is_featured,
  updated_at = timezone('utc', now());

with data(slug, name, city_slug, location_label, stay_type, description, image_url, price_from, rating, review_count, amenities, max_guests, is_featured) as (
  values
    ('winter-palace', 'Sofitel Winter Palace', 'luxor', 'Luxor, Egypt', 'hotel', 'A grand riverside palace wrapped in palms, history and the warm glow of old Luxor.', '/alpnile-hotel-winter-palace.png', 280, 4.8, 982, array['Nile View', 'Pool', 'Dining'], 3, true),
    ('nile-palace', 'Steigenberger Nile Palace', 'luxor', 'Luxor, Egypt', 'residence', 'A calm Nile-facing stay with long horizons, quiet terraces and evening river lights.', '/alpnile-hotel-nile-palace.png', 240, 4.6, 754, array['Nile View', 'Pool', 'Spa'], 3, false),
    ('al-moudira', 'Al Moudira Hotel', 'luxor', 'West Luxor', 'hotel', 'An intimate oasis of carved stone, lantern-lit courtyards and private pool moments.', '/alpnile-hotel-al-moudira.png', 310, 4.7, 618, array['Pool', 'Spa', 'Dining'], 2, true)
)
insert into public.stays (slug, name, city_id, location_label, stay_type, description, image_url, price_from, rating, review_count, amenities, max_guests, is_featured)
select data.slug, data.name, cities.id, data.location_label, data.stay_type, data.description, data.image_url, data.price_from, data.rating, data.review_count, data.amenities, data.max_guests, data.is_featured
from data
left join public.cities cities on cities.slug = data.city_slug
on conflict (slug) do update set
  name = excluded.name,
  city_id = excluded.city_id,
  location_label = excluded.location_label,
  stay_type = excluded.stay_type,
  description = excluded.description,
  image_url = excluded.image_url,
  price_from = excluded.price_from,
  rating = excluded.rating,
  review_count = excluded.review_count,
  amenities = excluded.amenities,
  max_guests = excluded.max_guests,
  is_featured = excluded.is_featured,
  updated_at = timezone('utc', now());

insert into public.vehicles (slug, name, vehicle_type, description, image_url, passenger_capacity, luggage_capacity, price_from, with_driver)
values
  ('comfort-suv', 'Comfort SUV', 'suv', 'A calm, comfortable choice for city transfers and day routes.', '/alpnile-cars-v2.png', 3, 3, 85, true),
  ('family-van', 'Family van', 'van', 'Extra space for families, luggage and longer private routes.', '/alpnile-cars-v2.png', 7, 7, 120, true),
  ('premium-sedan', 'Premium sedan', 'sedan', 'A polished ride for airport arrivals, meetings and city evenings.', '/alpnile-cars-v2.png', 3, 2, 105, true),
  ('luxury-minibus', 'Luxury minibus', 'minibus', 'A spacious option for groups moving together across Egypt.', '/alpnile-cars-v2.png', 14, 14, 190, true)
on conflict (slug) do update set
  name = excluded.name,
  vehicle_type = excluded.vehicle_type,
  description = excluded.description,
  image_url = excluded.image_url,
  passenger_capacity = excluded.passenger_capacity,
  luggage_capacity = excluded.luggage_capacity,
  price_from = excluded.price_from,
  with_driver = excluded.with_driver,
  updated_at = timezone('utc', now());

insert into public.products (slug, name, description, image_url, price, stock_quantity, is_featured)
values
  ('brass-nile-compass', 'Brass Nile Compass', 'A small object for big journeys.', '/alpnile-bazaar-compass.png', 42, 25, true),
  ('egypt-field-notes', 'The Egypt Field Notes', 'A tactile guide for curious days.', '/alpnile-bazaar-field-notes.png', 28, 40, true),
  ('pharaonic-keepsake', 'Pharaonic Keepsake', 'Made to carry the story home.', '/alpnile-bazaar-keepsake.png', 36, 18, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  price = excluded.price,
  stock_quantity = excluded.stock_quantity,
  is_featured = excluded.is_featured,
  updated_at = timezone('utc', now());

