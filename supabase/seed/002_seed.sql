-- United AI Trip Planner — Demo Seed Data
-- Run AFTER 001_schema.sql
-- See techContext.md for seed targets (1 user, 20-30 destinations, 3-5 flights each)

-- ─── Demo User ───────────────────────────────────────────────────────────────
-- Replace the UUID below with the value you set in VITE_DEMO_USER_ID

insert into users (id, email, display_name, home_airport, mileage_plus_tier, mileage_balance, preferences, recent_destinations)
values (
  '00000000-0000-0000-0000-000000000001',  -- TODO: replace with your VITE_DEMO_USER_ID
  'demo.user@example.com',
  'Alex',
  'EWR',
  'gold',
  87500,
  '{"travelStyle":"leisure","budgetCeilingUsd":800,"blackoutDates":[],"seatPreference":"aisle"}',
  '{MIA,CUN}'  -- recently visited, will be deprioritized
);

-- ─── Destinations ─────────────────────────────────────────────────────────────
-- TODO: Add 20-30 destinations covering Caribbean, Europe, domestic warm, Latin America, Asia
-- Format: (id, city, country, region, tags, description, image_url, popular_from_hubs)

insert into destinations (id, city, country, region, tags, description, image_url, popular_from_hubs) values
('SJU', 'San Juan',    'Puerto Rico',   'Caribbean', '{"beach","warm","nonstop","budget-friendly"}',
 'Vibrant culture, world-class beaches, and direct flights make San Juan one of the best-value Caribbean getaways from EWR.',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', '{"EWR","JFK","ORD"}'),

('NAS', 'Nassau',      'Bahamas',       'Caribbean', '{"beach","warm","luxury","snorkeling"}',
 'Crystal-clear waters and a relaxed island pace. Nassau is easy to reach and endlessly relaxing.',
 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800', '{"EWR","MIA","ATL"}'),

('LIS', 'Lisbon',      'Portugal',      'Europe',    '{"culture","history","food","budget-friendly"}',
 'One of Europe''s most affordable capitals, with stunning architecture, great food, and warm weather well into fall.',
 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800', '{"EWR","JFK","BOS"}'),

('BCN', 'Barcelona',   'Spain',         'Europe',    '{"culture","beach","architecture","nightlife"}',
 'Gaudí, tapas, and a Mediterranean beach — Barcelona delivers culture and relaxation in equal measure.',
 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', '{"EWR","JFK","IAD"}'),

('NRT', 'Tokyo',       'Japan',         'Asia',      '{"culture","food","technology","bucket-list"}',
 'An unforgettable mix of ancient temples and futuristic cityscapes. Best for travelers with more flexibility on budget.',
 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', '{"EWR","SFO","LAX"}'),

('MEX', 'Mexico City', 'Mexico',        'Latin America', '{"culture","food","history","budget-friendly"}',
 'Rich history, world-class cuisine, and surprisingly affordable flights make CDMX a hidden gem for East Coast travelers.',
 'https://images.unsplash.com/photo-1585208798174-6cedd4ada00c?w=800', '{"EWR","ORD","IAH"}'),

('DEN', 'Denver',      'United States', 'Domestic',  '{"mountains","outdoor","skiing","hiking"}',
 'Gateway to the Rockies. Perfect for skiers in winter and hikers in summer, with short nonstop flights from EWR.',
 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800', '{"EWR","ORD","LAX"}'),

('SAN', 'San Diego',   'United States', 'Domestic',  '{"beach","warm","outdoor","family"}',
 'Consistently sunny, with great beaches, world-class zoo, and a relaxed SoCal vibe.',
 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800', '{"EWR","ORD","DFW"}'),

('BOG', 'Bogota',      'Colombia',      'Latin America', '{"culture","coffee","budget-friendly","emerging"}',
 'A rapidly evolving city with incredible food, a thriving arts scene, and some of the most affordable fares from EWR.',
 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800', '{"EWR","MIA","JFK"}');

-- TODO: Add 15-20 more destinations to reach the 20-30 target from techContext.md

-- ─── Flights ─────────────────────────────────────────────────────────────────
-- TODO: Add 3-5 flights per destination for March 2026 dates from EWR
-- Mix of nonstop (stops=0) and 1-stop (stops=1), fares in $300-$1200 range
-- Format: (destination_id, origin_airport, outbound_date, return_date,
--          outbound_duration_minutes, return_duration_minutes, stops, fare_class, fare_usd, seats_available, aircraft_type)

insert into flights (destination_id, origin_airport, outbound_date, return_date, outbound_duration_minutes, return_duration_minutes, stops, fare_class, fare_usd, seats_available, aircraft_type) values
-- San Juan (SJU) — nonstop ~3.5h
('SJU','EWR','2026-03-07','2026-03-14', 215, 210, 0, 'economy', 329, 9, 'Boeing 737-800'),
('SJU','EWR','2026-03-14','2026-03-21', 215, 210, 0, 'economy', 349, 7, 'Boeing 737-800'),
('SJU','EWR','2026-03-21','2026-03-28', 215, 210, 0, 'economy', 379, 5, 'Boeing 737 MAX 9'),

-- Nassau (NAS) — nonstop ~3h
('NAS','EWR','2026-03-07','2026-03-14', 185, 180, 0, 'economy', 449, 9, 'Airbus A320'),
('NAS','EWR','2026-03-14','2026-03-21', 185, 180, 0, 'economy', 489, 6, 'Airbus A320'),
('NAS','EWR','2026-03-07','2026-03-14', 240, 235, 1, 'economy', 379, 9, 'Boeing 737-800'),

-- Lisbon (LIS) — ~7h nonstop
('LIS','EWR','2026-03-07','2026-03-21', 415, 430, 0, 'economy', 649, 9, 'Boeing 767-300ER'),
('LIS','EWR','2026-03-14','2026-03-28', 415, 430, 0, 'economy', 699, 7, 'Boeing 767-300ER'),
('LIS','EWR','2026-03-07','2026-03-21', 480, 490, 1, 'economy', 549, 9, 'Boeing 737 MAX 9'),

-- Barcelona (BCN) — ~8h nonstop
('BCN','EWR','2026-03-07','2026-03-21', 490, 510, 0, 'economy', 729, 8, 'Boeing 767-300ER'),
('BCN','EWR','2026-03-14','2026-03-28', 490, 510, 0, 'economy', 769, 6, 'Boeing 767-300ER'),
('BCN','EWR','2026-03-07','2026-03-21', 560, 575, 1, 'economy', 619, 9, 'Boeing 737-800'),

-- Tokyo (NRT) — ~14h nonstop
('NRT','EWR','2026-03-07','2026-03-21', 840, 870, 0, 'economy', 989, 9, 'Boeing 787-9'),
('NRT','EWR','2026-03-14','2026-03-28', 840, 870, 0, 'economy', 1049, 7, 'Boeing 787-9'),

-- Mexico City (MEX) — ~5.5h nonstop
('MEX','EWR','2026-03-07','2026-03-14', 335, 350, 0, 'economy', 469, 9, 'Boeing 737 MAX 9'),
('MEX','EWR','2026-03-14','2026-03-21', 335, 350, 0, 'economy', 499, 8, 'Boeing 737 MAX 9'),
('MEX','EWR','2026-03-07','2026-03-14', 390, 405, 1, 'economy', 389, 9, 'Boeing 737-800'),

-- Denver (DEN) — ~4.5h nonstop
('DEN','EWR','2026-03-07','2026-03-14', 270, 280, 0, 'economy', 299, 9, 'Boeing 737-800'),
('DEN','EWR','2026-03-14','2026-03-21', 270, 280, 0, 'economy', 319, 8, 'Boeing 737 MAX 9'),
('DEN','EWR','2026-03-21','2026-03-28', 270, 280, 0, 'economy', 279, 9, 'Boeing 737-800'),

-- San Diego (SAN) — ~6h nonstop
('SAN','EWR','2026-03-07','2026-03-14', 360, 375, 0, 'economy', 389, 9, 'Boeing 737 MAX 9'),
('SAN','EWR','2026-03-14','2026-03-21', 360, 375, 0, 'economy', 419, 7, 'Boeing 737 MAX 9'),
('SAN','EWR','2026-03-07','2026-03-14', 420, 435, 1, 'economy', 329, 9, 'Boeing 737-800'),

-- Bogota (BOG) — ~5.5h nonstop
('BOG','EWR','2026-03-07','2026-03-14', 340, 355, 0, 'economy', 489, 9, 'Boeing 737 MAX 9'),
('BOG','EWR','2026-03-14','2026-03-21', 340, 355, 0, 'economy', 519, 8, 'Boeing 737 MAX 9'),
('BOG','EWR','2026-03-07','2026-03-14', 400, 415, 1, 'economy', 419, 9, 'Boeing 737-800');
