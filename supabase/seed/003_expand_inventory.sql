-- United AI Trip Planner — Inventory Expansion
-- Run AFTER 002_seed.sql
-- Adds 15 new destinations + May / June / July 2026 flights for all destinations.
-- Mountain trips (DEN, SEA, ANC) are especially well-stocked for May & July.
-- Safe to re-run: destinations use ON CONFLICT DO NOTHING.

-- ─── NEW DESTINATIONS ────────────────────────────────────────────────────────

insert into destinations (id, city, country, region, tags, description, image_url, popular_from_hubs) values

('CUN', 'Cancun',         'Mexico',          'Caribbean',    '{"beach","warm","all-inclusive","nonstop","family"}',
 'World-famous white-sand beaches, turquoise water, and wall-to-wall resorts. Cancun is the quintessential beach escape with great nonstop value from EWR.',
 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800', '{"EWR","ORD","JFK"}'),

('HNL', 'Honolulu',       'United States',   'Pacific',      '{"beach","tropical","warm","bucket-list","outdoor"}',
 'Hawaii''s iconic gateway. Waikiki Beach, Diamond Head, and the North Shore surf scene — Honolulu is a bucket-list trip with direct United service.',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', '{"EWR","LAX","SFO"}'),

('MIA', 'Miami',          'United States',   'Domestic',     '{"beach","warm","nightlife","culture","food"}',
 'Art Deco, white-sand beaches, and a Latin-influenced food scene make Miami one of the most exciting domestic getaways — just 3 hours from EWR.',
 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800', '{"EWR","ORD","BOS"}'),

('DUB', 'Dublin',         'Ireland',         'Europe',       '{"culture","history","pubs","outdoor","budget-friendly"}',
 'Green hills, world-class pubs, and a rich literary history. Dublin is Europe''s most approachable city — warm Irish hospitality and surprisingly good value.',
 'https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=800', '{"EWR","ORD","JFK"}'),

('FCO', 'Rome',           'Italy',           'Europe',       '{"culture","history","food","architecture","bucket-list"}',
 'The Colosseum, Vatican, and some of the world''s best pasta — Rome is a must-do bucket-list city with excellent EWR nonstop service.',
 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', '{"EWR","JFK","ORD"}'),

('AMS', 'Amsterdam',      'Netherlands',     'Europe',       '{"culture","cycling","history","art","budget-friendly"}',
 'Canals, world-class museums, and a bicycle culture unlike any other European city. Amsterdam is endlessly walkable and very well connected from EWR.',
 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', '{"EWR","JFK","IAD"}'),

('KEF', 'Reykjavik',      'Iceland',         'Europe',       '{"northern-lights","unique","adventure","outdoor","bucket-list"}',
 'Northern lights, midnight sun, geysers, and glacier hikes. Iceland is one of the world''s most unique destinations and closer than you think from EWR.',
 'https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=800', '{"EWR","JFK","BOS"}'),

('ICN', 'Seoul',          'South Korea',     'Asia',         '{"culture","food","technology","nightlife","shopping"}',
 'K-culture, extraordinary food, neon-lit night markets, and cutting-edge technology. Seoul is Asia''s most exciting city for first-timers and repeat visitors alike.',
 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800', '{"EWR","SFO","LAX"}'),

('MBJ', 'Montego Bay',    'Jamaica',         'Caribbean',    '{"beach","warm","all-inclusive","reggae","tropical"}',
 'Reggae rhythms, white-sand beaches, and luxurious all-inclusive resorts. Montego Bay is the ultimate Caribbean unwind, easy to reach from EWR.',
 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', '{"EWR","MIA","ATL"}'),

('PUJ', 'Punta Cana',     'Dominican Republic', 'Caribbean', '{"beach","all-inclusive","warm","family","tropical"}',
 'Miles of palm-fringed beaches and the Caribbean''s highest concentration of all-inclusive resorts. Punta Cana is the easiest tropical escape from the East Coast.',
 'https://images.unsplash.com/photo-1565073624497-7144969b0f3b?w=800', '{"EWR","JFK","MIA"}'),

('FLL', 'Fort Lauderdale', 'United States',  'Domestic',     '{"beach","warm","budget-friendly","boating","family"}',
 'Fort Lauderdale pairs beautiful beaches with a laid-back vibe at a lower price point than Miami — ideal for a quick, affordable warm-weather escape.',
 'https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800', '{"EWR","ORD","BOS"}'),

('LAX', 'Los Angeles',    'United States',   'Domestic',     '{"culture","beach","outdoor","entertainment","food"}',
 'Hollywood, Venice Beach, Griffith Observatory, and world-class food. Los Angeles is a coast-to-coast adventure with nonstop service from EWR.',
 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800', '{"EWR","ORD","JFK"}'),

('PHX', 'Phoenix',        'United States',   'Domestic',     '{"desert","warm","golf","spa","outdoor"}',
 'Sunny desert landscapes, world-class golf, and luxurious spas make Phoenix a perfect warm-weather retreat — especially beautiful in spring and fall.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', '{"EWR","ORD","DEN"}'),

('SEA', 'Seattle',        'United States',   'Domestic',     '{"mountains","hiking","outdoor","coffee","culture"}',
 'Gateway to the Cascades, Olympic Peninsula, and Mount Rainier. Seattle blends world-class hiking with a vibrant food and coffee culture — perfect for summer mountain adventures.',
 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800', '{"EWR","ORD","DEN"}'),

('ANC', 'Anchorage',      'United States',   'Domestic',     '{"mountains","wildlife","adventure","hiking","northern-lights","bucket-list"}',
 'Denali, Kenai Fjords, and more wildlife than anywhere in North America. Anchorage is Alaska''s adventure hub — jaw-dropping mountain scenery just a nonstop flight away.',
 'https://images.unsplash.com/photo-1531694611353-d4758f86fa6d?w=800', '{"EWR","SFO","LAX"}')

ON CONFLICT (id) DO NOTHING;


-- ─── FLIGHTS: MAY / JUNE / JULY 2026 — ALL DESTINATIONS ─────────────────────
-- Existing destinations (SJU, NAS, LIS, BCN, NRT, MEX, DEN, SAN, BOG)
-- + all 15 new destinations above
-- 3-4 departures per month per destination; mix of nonstop and 1-stop.
-- Summer fares: May = shoulder (cheapest), June/July = peak (+15-30%).
-- Mountain destinations (DEN, SEA, ANC) are stocked most heavily.

insert into flights (destination_id, origin_airport, outbound_date, return_date,
                     outbound_duration_minutes, return_duration_minutes,
                     stops, fare_class, fare_usd, seats_available, aircraft_type) values

-- ════════════════════════════════════════════════════════════════════════════
-- SJU — San Juan  (nonstop ~3h 35m, 1-stop ~5h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('SJU','EWR','2026-05-02','2026-05-09',  215,210, 0,'economy', 309, 9,'Boeing 737-800'),
('SJU','EWR','2026-05-09','2026-05-16',  215,210, 0,'economy', 329, 8,'Boeing 737 MAX 9'),
('SJU','EWR','2026-05-16','2026-05-23',  215,210, 0,'economy', 319, 9,'Boeing 737-800'),
('SJU','EWR','2026-05-09','2026-05-16',  275,270, 1,'economy', 269, 9,'Boeing 737-800'),
-- JUNE
('SJU','EWR','2026-06-06','2026-06-13',  215,210, 0,'economy', 369, 7,'Boeing 737 MAX 9'),
('SJU','EWR','2026-06-13','2026-06-20',  215,210, 0,'economy', 389, 6,'Boeing 737-800'),
('SJU','EWR','2026-06-20','2026-06-27',  215,210, 0,'economy', 399, 8,'Boeing 737-800'),
('SJU','EWR','2026-06-06','2026-06-13',  275,270, 1,'economy', 319, 9,'Boeing 737-800'),
-- JULY
('SJU','EWR','2026-07-04','2026-07-11',  215,210, 0,'economy', 419, 6,'Boeing 737 MAX 9'),
('SJU','EWR','2026-07-11','2026-07-18',  215,210, 0,'economy', 409, 7,'Boeing 737-800'),
('SJU','EWR','2026-07-18','2026-07-25',  215,210, 0,'economy', 429, 5,'Boeing 737 MAX 9'),
('SJU','EWR','2026-07-11','2026-07-18',  275,270, 1,'economy', 359, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- NAS — Nassau  (nonstop ~3h 5m, 1-stop ~4h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('NAS','EWR','2026-05-02','2026-05-09',  185,180, 0,'economy', 429, 9,'Airbus A320'),
('NAS','EWR','2026-05-09','2026-05-16',  185,180, 0,'economy', 449, 8,'Airbus A320'),
('NAS','EWR','2026-05-02','2026-05-09',  245,240, 1,'economy', 369, 9,'Boeing 737-800'),
-- JUNE
('NAS','EWR','2026-06-06','2026-06-13',  185,180, 0,'economy', 499, 7,'Airbus A320'),
('NAS','EWR','2026-06-13','2026-06-20',  185,180, 0,'economy', 519, 6,'Boeing 737 MAX 9'),
('NAS','EWR','2026-06-06','2026-06-13',  245,240, 1,'economy', 429, 9,'Boeing 737-800'),
-- JULY
('NAS','EWR','2026-07-04','2026-07-11',  185,180, 0,'economy', 549, 6,'Airbus A320'),
('NAS','EWR','2026-07-11','2026-07-18',  185,180, 0,'economy', 529, 7,'Boeing 737 MAX 9'),
('NAS','EWR','2026-07-04','2026-07-11',  245,240, 1,'economy', 459, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- LIS — Lisbon  (nonstop ~7h, 1-stop ~9h 30m)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('LIS','EWR','2026-05-02','2026-05-16',  415,430, 0,'economy', 619, 9,'Boeing 767-300ER'),
('LIS','EWR','2026-05-09','2026-05-23',  415,430, 0,'economy', 649, 7,'Boeing 767-300ER'),
('LIS','EWR','2026-05-16','2026-05-30',  415,430, 0,'economy', 629, 8,'Boeing 767-300ER'),
('LIS','EWR','2026-05-02','2026-05-16',  490,495, 1,'economy', 519, 9,'Boeing 737 MAX 9'),
-- JUNE
('LIS','EWR','2026-06-06','2026-06-20',  415,430, 0,'economy', 749, 6,'Boeing 767-300ER'),
('LIS','EWR','2026-06-13','2026-06-27',  415,430, 0,'economy', 769, 5,'Boeing 767-300ER'),
('LIS','EWR','2026-06-06','2026-06-20',  490,495, 1,'economy', 629, 9,'Boeing 737 MAX 9'),
-- JULY
('LIS','EWR','2026-07-04','2026-07-18',  415,430, 0,'economy', 819, 5,'Boeing 767-300ER'),
('LIS','EWR','2026-07-11','2026-07-25',  415,430, 0,'economy', 839, 4,'Boeing 787-9'),
('LIS','EWR','2026-07-04','2026-07-18',  490,495, 1,'economy', 689, 9,'Boeing 737 MAX 9'),

-- ════════════════════════════════════════════════════════════════════════════
-- BCN — Barcelona  (nonstop ~8h, 1-stop ~10h 30m)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('BCN','EWR','2026-05-02','2026-05-16',  490,510, 0,'economy', 699, 9,'Boeing 767-300ER'),
('BCN','EWR','2026-05-09','2026-05-23',  490,510, 0,'economy', 729, 7,'Boeing 767-300ER'),
('BCN','EWR','2026-05-02','2026-05-16',  565,575, 1,'economy', 589, 9,'Boeing 737-800'),
-- JUNE
('BCN','EWR','2026-06-06','2026-06-20',  490,510, 0,'economy', 799, 6,'Boeing 767-300ER'),
('BCN','EWR','2026-06-13','2026-06-27',  490,510, 0,'economy', 829, 5,'Boeing 787-9'),
('BCN','EWR','2026-06-06','2026-06-20',  565,575, 1,'economy', 669, 9,'Boeing 737-800'),
-- JULY
('BCN','EWR','2026-07-04','2026-07-18',  490,510, 0,'economy', 879, 5,'Boeing 787-9'),
('BCN','EWR','2026-07-11','2026-07-25',  490,510, 0,'economy', 899, 4,'Boeing 767-300ER'),
('BCN','EWR','2026-07-04','2026-07-18',  565,575, 1,'economy', 729, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- NRT — Tokyo  (nonstop ~14h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('NRT','EWR','2026-05-02','2026-05-16',  840,870, 0,'economy', 929, 9,'Boeing 787-9'),
('NRT','EWR','2026-05-09','2026-05-23',  840,870, 0,'economy', 969, 7,'Boeing 787-9'),
-- JUNE
('NRT','EWR','2026-06-07','2026-06-21',  840,870, 0,'economy', 1049, 6,'Boeing 787-9'),
('NRT','EWR','2026-06-14','2026-06-28',  840,870, 0,'economy', 1099, 5,'Boeing 787-10'),
-- JULY
('NRT','EWR','2026-07-05','2026-07-19',  840,870, 0,'economy', 1149, 5,'Boeing 787-9'),
('NRT','EWR','2026-07-12','2026-07-26',  840,870, 0,'economy', 1179, 4,'Boeing 787-10'),

-- ════════════════════════════════════════════════════════════════════════════
-- MEX — Mexico City  (nonstop ~5h 30m, 1-stop ~7h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('MEX','EWR','2026-05-02','2026-05-09',  335,350, 0,'economy', 449, 9,'Boeing 737 MAX 9'),
('MEX','EWR','2026-05-09','2026-05-16',  335,350, 0,'economy', 469, 8,'Boeing 737 MAX 9'),
('MEX','EWR','2026-05-02','2026-05-09',  395,410, 1,'economy', 369, 9,'Boeing 737-800'),
-- JUNE
('MEX','EWR','2026-06-06','2026-06-13',  335,350, 0,'economy', 519, 7,'Boeing 737 MAX 9'),
('MEX','EWR','2026-06-13','2026-06-20',  335,350, 0,'economy', 539, 6,'Boeing 737 MAX 9'),
('MEX','EWR','2026-06-06','2026-06-13',  395,410, 1,'economy', 429, 9,'Boeing 737-800'),
-- JULY
('MEX','EWR','2026-07-04','2026-07-11',  335,350, 0,'economy', 559, 6,'Boeing 737 MAX 9'),
('MEX','EWR','2026-07-11','2026-07-18',  335,350, 0,'economy', 579, 5,'Boeing 737 MAX 9'),
('MEX','EWR','2026-07-04','2026-07-11',  395,410, 1,'economy', 459, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- DEN — Denver / Rockies  ⛰️  (nonstop ~4h 30m)
-- Stocked most heavily — top mountain destination for May & July
-- ════════════════════════════════════════════════════════════════════════════
-- MAY  (hiking/wildflower season opens, shoulder pricing)
('DEN','EWR','2026-05-02','2026-05-09',  270,280, 0,'economy', 249, 9,'Boeing 737-800'),
('DEN','EWR','2026-05-09','2026-05-16',  270,280, 0,'economy', 259, 9,'Boeing 737-800'),
('DEN','EWR','2026-05-16','2026-05-23',  270,280, 0,'economy', 269, 8,'Boeing 737 MAX 9'),
('DEN','EWR','2026-05-23','2026-05-30',  270,280, 0,'economy', 279, 9,'Boeing 737-800'),
('DEN','EWR','2026-05-09','2026-05-16',  330,340, 1,'economy', 219, 9,'Boeing 737-800'),
('DEN','EWR','2026-05-16','2026-05-23',  330,340, 1,'economy', 229, 9,'Boeing 737-800'),
-- JUNE
('DEN','EWR','2026-06-06','2026-06-13',  270,280, 0,'economy', 309, 8,'Boeing 737 MAX 9'),
('DEN','EWR','2026-06-13','2026-06-20',  270,280, 0,'economy', 319, 7,'Boeing 737-800'),
('DEN','EWR','2026-06-20','2026-06-27',  270,280, 0,'economy', 329, 8,'Boeing 737 MAX 9'),
('DEN','EWR','2026-06-06','2026-06-13',  330,340, 1,'economy', 259, 9,'Boeing 737-800'),
-- JULY  (peak hiking season, Rocky Mountain National Park)
('DEN','EWR','2026-07-04','2026-07-11',  270,280, 0,'economy', 349, 7,'Boeing 737 MAX 9'),
('DEN','EWR','2026-07-11','2026-07-18',  270,280, 0,'economy', 339, 8,'Boeing 737-800'),
('DEN','EWR','2026-07-18','2026-07-25',  270,280, 0,'economy', 359, 6,'Boeing 737 MAX 9'),
('DEN','EWR','2026-07-25','2026-08-01',  270,280, 0,'economy', 369, 7,'Boeing 737-800'),
('DEN','EWR','2026-07-04','2026-07-11',  330,340, 1,'economy', 289, 9,'Boeing 737-800'),
('DEN','EWR','2026-07-11','2026-07-18',  330,340, 1,'economy', 279, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- SAN — San Diego  (nonstop ~6h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('SAN','EWR','2026-05-02','2026-05-09',  360,375, 0,'economy', 369, 9,'Boeing 737 MAX 9'),
('SAN','EWR','2026-05-09','2026-05-16',  360,375, 0,'economy', 389, 8,'Boeing 737 MAX 9'),
('SAN','EWR','2026-05-02','2026-05-09',  425,435, 1,'economy', 309, 9,'Boeing 737-800'),
-- JUNE
('SAN','EWR','2026-06-06','2026-06-13',  360,375, 0,'economy', 439, 7,'Boeing 737 MAX 9'),
('SAN','EWR','2026-06-13','2026-06-20',  360,375, 0,'economy', 459, 6,'Boeing 737 MAX 9'),
('SAN','EWR','2026-06-06','2026-06-13',  425,435, 1,'economy', 369, 9,'Boeing 737-800'),
-- JULY
('SAN','EWR','2026-07-04','2026-07-11',  360,375, 0,'economy', 479, 6,'Boeing 737 MAX 9'),
('SAN','EWR','2026-07-11','2026-07-18',  360,375, 0,'economy', 499, 5,'Boeing 737 MAX 9'),
('SAN','EWR','2026-07-04','2026-07-11',  425,435, 1,'economy', 409, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- BOG — Bogota  (nonstop ~5h 30m, 1-stop ~7h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('BOG','EWR','2026-05-02','2026-05-09',  340,355, 0,'economy', 469, 9,'Boeing 737 MAX 9'),
('BOG','EWR','2026-05-09','2026-05-16',  340,355, 0,'economy', 489, 8,'Boeing 737 MAX 9'),
('BOG','EWR','2026-05-02','2026-05-09',  405,415, 1,'economy', 399, 9,'Boeing 737-800'),
-- JUNE
('BOG','EWR','2026-06-06','2026-06-13',  340,355, 0,'economy', 529, 7,'Boeing 737 MAX 9'),
('BOG','EWR','2026-06-13','2026-06-20',  340,355, 0,'economy', 549, 6,'Boeing 737 MAX 9'),
-- JULY
('BOG','EWR','2026-07-04','2026-07-11',  340,355, 0,'economy', 569, 6,'Boeing 737 MAX 9'),
('BOG','EWR','2026-07-11','2026-07-18',  340,355, 0,'economy', 559, 7,'Boeing 737 MAX 9'),

-- ════════════════════════════════════════════════════════════════════════════
-- CUN — Cancun  (nonstop ~4h, 1-stop ~5h 30m)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('CUN','EWR','2026-05-02','2026-05-09',  240,250, 0,'economy', 329, 9,'Boeing 737-800'),
('CUN','EWR','2026-05-09','2026-05-16',  240,250, 0,'economy', 319, 9,'Boeing 737 MAX 9'),
('CUN','EWR','2026-05-16','2026-05-23',  240,250, 0,'economy', 339, 8,'Boeing 737-800'),
('CUN','EWR','2026-05-02','2026-05-09',  305,310, 1,'economy', 269, 9,'Boeing 737-800'),
-- JUNE
('CUN','EWR','2026-06-06','2026-06-13',  240,250, 0,'economy', 399, 7,'Boeing 737 MAX 9'),
('CUN','EWR','2026-06-13','2026-06-20',  240,250, 0,'economy', 419, 6,'Boeing 737-800'),
('CUN','EWR','2026-06-20','2026-06-27',  240,250, 0,'economy', 409, 8,'Boeing 737 MAX 9'),
('CUN','EWR','2026-06-06','2026-06-13',  305,310, 1,'economy', 339, 9,'Boeing 737-800'),
-- JULY
('CUN','EWR','2026-07-04','2026-07-11',  240,250, 0,'economy', 449, 6,'Boeing 737 MAX 9'),
('CUN','EWR','2026-07-11','2026-07-18',  240,250, 0,'economy', 459, 5,'Boeing 737-800'),
('CUN','EWR','2026-07-18','2026-07-25',  240,250, 0,'economy', 469, 6,'Boeing 737 MAX 9'),
('CUN','EWR','2026-07-04','2026-07-11',  305,310, 1,'economy', 369, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- HNL — Honolulu  (nonstop ~11h via UA, often via LAX/SFO in reality)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('HNL','EWR','2026-05-03','2026-05-17',  660,670, 0,'economy', 649, 9,'Boeing 787-9'),
('HNL','EWR','2026-05-10','2026-05-24',  660,670, 0,'economy', 679, 8,'Boeing 787-9'),
('HNL','EWR','2026-05-03','2026-05-17',  750,760, 1,'economy', 549, 9,'Boeing 737 MAX 9'),
-- JUNE
('HNL','EWR','2026-06-07','2026-06-21',  660,670, 0,'economy', 749, 7,'Boeing 787-9'),
('HNL','EWR','2026-06-14','2026-06-28',  660,670, 0,'economy', 779, 6,'Boeing 787-9'),
('HNL','EWR','2026-06-07','2026-06-21',  750,760, 1,'economy', 629, 9,'Boeing 737 MAX 9'),
-- JULY
('HNL','EWR','2026-07-05','2026-07-19',  660,670, 0,'economy', 829, 5,'Boeing 787-9'),
('HNL','EWR','2026-07-12','2026-07-26',  660,670, 0,'economy', 849, 4,'Boeing 787-10'),
('HNL','EWR','2026-07-05','2026-07-19',  750,760, 1,'economy', 699, 9,'Boeing 737 MAX 9'),

-- ════════════════════════════════════════════════════════════════════════════
-- MIA — Miami  (nonstop ~3h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('MIA','EWR','2026-05-02','2026-05-09',  185,190, 0,'economy', 219, 9,'Boeing 737-800'),
('MIA','EWR','2026-05-09','2026-05-16',  185,190, 0,'economy', 229, 9,'Boeing 737-800'),
('MIA','EWR','2026-05-16','2026-05-23',  185,190, 0,'economy', 239, 8,'Airbus A320'),
('MIA','EWR','2026-05-23','2026-05-30',  185,190, 0,'economy', 209, 9,'Boeing 737-800'),
-- JUNE
('MIA','EWR','2026-06-06','2026-06-13',  185,190, 0,'economy', 259, 8,'Boeing 737-800'),
('MIA','EWR','2026-06-13','2026-06-20',  185,190, 0,'economy', 269, 7,'Airbus A320'),
('MIA','EWR','2026-06-20','2026-06-27',  185,190, 0,'economy', 279, 8,'Boeing 737-800'),
-- JULY
('MIA','EWR','2026-07-04','2026-07-11',  185,190, 0,'economy', 299, 7,'Boeing 737 MAX 9'),
('MIA','EWR','2026-07-11','2026-07-18',  185,190, 0,'economy', 309, 6,'Boeing 737-800'),
('MIA','EWR','2026-07-18','2026-07-25',  185,190, 0,'economy', 319, 7,'Airbus A320'),

-- ════════════════════════════════════════════════════════════════════════════
-- DUB — Dublin  (nonstop ~7h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('DUB','EWR','2026-05-02','2026-05-16',  420,435, 0,'economy', 589, 9,'Boeing 767-300ER'),
('DUB','EWR','2026-05-09','2026-05-23',  420,435, 0,'economy', 619, 8,'Boeing 767-300ER'),
('DUB','EWR','2026-05-16','2026-05-30',  420,435, 0,'economy', 599, 9,'Boeing 767-300ER'),
-- JUNE
('DUB','EWR','2026-06-06','2026-06-20',  420,435, 0,'economy', 699, 7,'Boeing 767-300ER'),
('DUB','EWR','2026-06-13','2026-06-27',  420,435, 0,'economy', 729, 5,'Boeing 787-9'),
-- JULY
('DUB','EWR','2026-07-04','2026-07-18',  420,435, 0,'economy', 769, 5,'Boeing 767-300ER'),
('DUB','EWR','2026-07-11','2026-07-25',  420,435, 0,'economy', 789, 4,'Boeing 787-9'),

-- ════════════════════════════════════════════════════════════════════════════
-- FCO — Rome  (nonstop ~9h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('FCO','EWR','2026-05-02','2026-05-16',  540,555, 0,'economy', 679, 9,'Boeing 767-300ER'),
('FCO','EWR','2026-05-09','2026-05-23',  540,555, 0,'economy', 699, 8,'Boeing 767-300ER'),
('FCO','EWR','2026-05-02','2026-05-16',  610,625, 1,'economy', 569, 9,'Boeing 737 MAX 9'),
-- JUNE
('FCO','EWR','2026-06-06','2026-06-20',  540,555, 0,'economy', 799, 6,'Boeing 767-300ER'),
('FCO','EWR','2026-06-13','2026-06-27',  540,555, 0,'economy', 829, 5,'Boeing 787-9'),
('FCO','EWR','2026-06-06','2026-06-20',  610,625, 1,'economy', 669, 9,'Boeing 737 MAX 9'),
-- JULY
('FCO','EWR','2026-07-04','2026-07-18',  540,555, 0,'economy', 879, 4,'Boeing 787-9'),
('FCO','EWR','2026-07-11','2026-07-25',  540,555, 0,'economy', 899, 4,'Boeing 767-300ER'),
('FCO','EWR','2026-07-04','2026-07-18',  610,625, 1,'economy', 729, 9,'Boeing 737 MAX 9'),

-- ════════════════════════════════════════════════════════════════════════════
-- AMS — Amsterdam  (nonstop ~7h 30m)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('AMS','EWR','2026-05-02','2026-05-16',  450,465, 0,'economy', 629, 9,'Boeing 767-300ER'),
('AMS','EWR','2026-05-09','2026-05-23',  450,465, 0,'economy', 649, 8,'Boeing 767-300ER'),
-- JUNE
('AMS','EWR','2026-06-06','2026-06-20',  450,465, 0,'economy', 739, 6,'Boeing 767-300ER'),
('AMS','EWR','2026-06-13','2026-06-27',  450,465, 0,'economy', 759, 5,'Boeing 787-9'),
-- JULY
('AMS','EWR','2026-07-04','2026-07-18',  450,465, 0,'economy', 809, 5,'Boeing 787-9'),
('AMS','EWR','2026-07-11','2026-07-25',  450,465, 0,'economy', 829, 4,'Boeing 767-300ER'),

-- ════════════════════════════════════════════════════════════════════════════
-- KEF — Reykjavik  (nonstop ~6h 30m)  — midnight sun June/July is peak!
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('KEF','EWR','2026-05-02','2026-05-12',  390,400, 0,'economy', 599, 9,'Boeing 757-200'),
('KEF','EWR','2026-05-09','2026-05-19',  390,400, 0,'economy', 619, 8,'Boeing 757-200'),
('KEF','EWR','2026-05-16','2026-05-26',  390,400, 0,'economy', 579, 9,'Boeing 757-200'),
-- JUNE  (midnight sun season — premium)
('KEF','EWR','2026-06-06','2026-06-16',  390,400, 0,'economy', 729, 7,'Boeing 757-200'),
('KEF','EWR','2026-06-13','2026-06-23',  390,400, 0,'economy', 749, 6,'Boeing 757-200'),
('KEF','EWR','2026-06-20','2026-06-30',  390,400, 0,'economy', 769, 7,'Boeing 757-200'),
-- JULY
('KEF','EWR','2026-07-04','2026-07-14',  390,400, 0,'economy', 799, 5,'Boeing 757-200'),
('KEF','EWR','2026-07-11','2026-07-21',  390,400, 0,'economy', 779, 6,'Boeing 757-200'),
('KEF','EWR','2026-07-18','2026-07-28',  390,400, 0,'economy', 759, 7,'Boeing 757-200'),

-- ════════════════════════════════════════════════════════════════════════════
-- ICN — Seoul  (nonstop ~14h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('ICN','EWR','2026-05-02','2026-05-16',  850,870, 0,'economy', 899, 9,'Boeing 787-9'),
('ICN','EWR','2026-05-09','2026-05-23',  850,870, 0,'economy', 929, 7,'Boeing 787-9'),
-- JUNE
('ICN','EWR','2026-06-07','2026-06-21',  850,870, 0,'economy', 1029, 6,'Boeing 787-9'),
('ICN','EWR','2026-06-14','2026-06-28',  850,870, 0,'economy', 1059, 5,'Boeing 787-10'),
-- JULY
('ICN','EWR','2026-07-05','2026-07-19',  850,870, 0,'economy', 1099, 4,'Boeing 787-9'),
('ICN','EWR','2026-07-12','2026-07-26',  850,870, 0,'economy', 1129, 4,'Boeing 787-10'),

-- ════════════════════════════════════════════════════════════════════════════
-- MBJ — Montego Bay  (nonstop ~4h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('MBJ','EWR','2026-05-02','2026-05-09',  245,255, 0,'economy', 379, 9,'Boeing 737-800'),
('MBJ','EWR','2026-05-09','2026-05-16',  245,255, 0,'economy', 369, 9,'Boeing 737-800'),
('MBJ','EWR','2026-05-16','2026-05-23',  245,255, 0,'economy', 389, 8,'Boeing 737 MAX 9'),
-- JUNE
('MBJ','EWR','2026-06-06','2026-06-13',  245,255, 0,'economy', 439, 7,'Boeing 737 MAX 9'),
('MBJ','EWR','2026-06-13','2026-06-20',  245,255, 0,'economy', 449, 6,'Boeing 737-800'),
-- JULY
('MBJ','EWR','2026-07-04','2026-07-11',  245,255, 0,'economy', 479, 6,'Boeing 737 MAX 9'),
('MBJ','EWR','2026-07-11','2026-07-18',  245,255, 0,'economy', 489, 5,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- PUJ — Punta Cana  (nonstop ~4h 30m)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('PUJ','EWR','2026-05-02','2026-05-09',  270,280, 0,'economy', 349, 9,'Boeing 737-800'),
('PUJ','EWR','2026-05-09','2026-05-16',  270,280, 0,'economy', 339, 9,'Boeing 737 MAX 9'),
('PUJ','EWR','2026-05-16','2026-05-23',  270,280, 0,'economy', 359, 8,'Boeing 737-800'),
-- JUNE
('PUJ','EWR','2026-06-06','2026-06-13',  270,280, 0,'economy', 409, 8,'Boeing 737 MAX 9'),
('PUJ','EWR','2026-06-13','2026-06-20',  270,280, 0,'economy', 419, 7,'Boeing 737-800'),
-- JULY
('PUJ','EWR','2026-07-04','2026-07-11',  270,280, 0,'economy', 449, 6,'Boeing 737 MAX 9'),
('PUJ','EWR','2026-07-11','2026-07-18',  270,280, 0,'economy', 459, 5,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- FLL — Fort Lauderdale  (nonstop ~3h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('FLL','EWR','2026-05-02','2026-05-09',  185,190, 0,'economy', 189, 9,'Boeing 737-800'),
('FLL','EWR','2026-05-09','2026-05-16',  185,190, 0,'economy', 199, 9,'Airbus A320'),
('FLL','EWR','2026-05-16','2026-05-23',  185,190, 0,'economy', 209, 9,'Boeing 737-800'),
-- JUNE
('FLL','EWR','2026-06-06','2026-06-13',  185,190, 0,'economy', 229, 9,'Boeing 737-800'),
('FLL','EWR','2026-06-13','2026-06-20',  185,190, 0,'economy', 239, 8,'Airbus A320'),
('FLL','EWR','2026-06-20','2026-06-27',  185,190, 0,'economy', 249, 9,'Boeing 737-800'),
-- JULY
('FLL','EWR','2026-07-04','2026-07-11',  185,190, 0,'economy', 259, 8,'Boeing 737 MAX 9'),
('FLL','EWR','2026-07-11','2026-07-18',  185,190, 0,'economy', 269, 7,'Boeing 737-800'),
('FLL','EWR','2026-07-18','2026-07-25',  185,190, 0,'economy', 279, 8,'Airbus A320'),

-- ════════════════════════════════════════════════════════════════════════════
-- LAX — Los Angeles  (nonstop ~6h)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY
('LAX','EWR','2026-05-02','2026-05-09',  360,375, 0,'economy', 299, 9,'Boeing 737 MAX 9'),
('LAX','EWR','2026-05-09','2026-05-16',  360,375, 0,'economy', 319, 8,'Boeing 737 MAX 9'),
('LAX','EWR','2026-05-16','2026-05-23',  360,375, 0,'economy', 309, 9,'Boeing 757-200'),
-- JUNE
('LAX','EWR','2026-06-06','2026-06-13',  360,375, 0,'economy', 369, 7,'Boeing 737 MAX 9'),
('LAX','EWR','2026-06-13','2026-06-20',  360,375, 0,'economy', 389, 6,'Boeing 757-200'),
-- JULY
('LAX','EWR','2026-07-04','2026-07-11',  360,375, 0,'economy', 409, 6,'Boeing 737 MAX 9'),
('LAX','EWR','2026-07-11','2026-07-18',  360,375, 0,'economy', 419, 5,'Boeing 757-200'),
('LAX','EWR','2026-07-18','2026-07-25',  360,375, 0,'economy', 429, 6,'Boeing 737 MAX 9'),

-- ════════════════════════════════════════════════════════════════════════════
-- PHX — Phoenix  (nonstop ~5h 30m)
-- ════════════════════════════════════════════════════════════════════════════
-- MAY  (hot but good golf/spa value before peak summer)
('PHX','EWR','2026-05-02','2026-05-09',  335,345, 0,'economy', 249, 9,'Boeing 737-800'),
('PHX','EWR','2026-05-09','2026-05-16',  335,345, 0,'economy', 259, 9,'Boeing 737 MAX 9'),
('PHX','EWR','2026-05-16','2026-05-23',  335,345, 0,'economy', 269, 8,'Boeing 737-800'),
-- JUNE
('PHX','EWR','2026-06-06','2026-06-13',  335,345, 0,'economy', 299, 8,'Boeing 737 MAX 9'),
('PHX','EWR','2026-06-13','2026-06-20',  335,345, 0,'economy', 309, 7,'Boeing 737-800'),
-- JULY
('PHX','EWR','2026-07-04','2026-07-11',  335,345, 0,'economy', 319, 7,'Boeing 737 MAX 9'),
('PHX','EWR','2026-07-11','2026-07-18',  335,345, 0,'economy', 329, 6,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- SEA — Seattle / Cascades  ⛰️  (nonstop ~6h 30m)
-- Stocked heavily — top mountain/hiking destination alongside DEN
-- ════════════════════════════════════════════════════════════════════════════
-- MAY  (wildflower season begins, shoulder pricing)
('SEA','EWR','2026-05-02','2026-05-09',  390,400, 0,'economy', 319, 9,'Boeing 737 MAX 9'),
('SEA','EWR','2026-05-09','2026-05-16',  390,400, 0,'economy', 329, 9,'Boeing 737 MAX 9'),
('SEA','EWR','2026-05-16','2026-05-23',  390,400, 0,'economy', 339, 8,'Boeing 757-200'),
('SEA','EWR','2026-05-23','2026-05-30',  390,400, 0,'economy', 319, 9,'Boeing 737 MAX 9'),
('SEA','EWR','2026-05-09','2026-05-16',  455,465, 1,'economy', 269, 9,'Boeing 737-800'),
-- JUNE
('SEA','EWR','2026-06-06','2026-06-13',  390,400, 0,'economy', 389, 7,'Boeing 737 MAX 9'),
('SEA','EWR','2026-06-13','2026-06-20',  390,400, 0,'economy', 399, 7,'Boeing 757-200'),
('SEA','EWR','2026-06-20','2026-06-27',  390,400, 0,'economy', 409, 6,'Boeing 737 MAX 9'),
('SEA','EWR','2026-06-06','2026-06-13',  455,465, 1,'economy', 329, 9,'Boeing 737-800'),
-- JULY  (peak Rainier / Olympic hiking season)
('SEA','EWR','2026-07-04','2026-07-11',  390,400, 0,'economy', 429, 6,'Boeing 737 MAX 9'),
('SEA','EWR','2026-07-11','2026-07-18',  390,400, 0,'economy', 419, 7,'Boeing 757-200'),
('SEA','EWR','2026-07-18','2026-07-25',  390,400, 0,'economy', 439, 6,'Boeing 737 MAX 9'),
('SEA','EWR','2026-07-25','2026-08-01',  390,400, 0,'economy', 449, 7,'Boeing 737 MAX 9'),
('SEA','EWR','2026-07-04','2026-07-11',  455,465, 1,'economy', 359, 9,'Boeing 737-800'),

-- ════════════════════════════════════════════════════════════════════════════
-- ANC — Anchorage / Alaska  ⛰️  (nonstop ~8h 30m)
-- Peak season IS summer — stocked heavily for May, June, July
-- ════════════════════════════════════════════════════════════════════════════
-- MAY  (wildlife calving season, shoulder pricing)
('ANC','EWR','2026-05-02','2026-05-12',  510,525, 0,'economy', 449, 9,'Boeing 737 MAX 9'),
('ANC','EWR','2026-05-09','2026-05-19',  510,525, 0,'economy', 469, 8,'Boeing 737 MAX 9'),
('ANC','EWR','2026-05-16','2026-05-26',  510,525, 0,'economy', 459, 9,'Boeing 757-200'),
('ANC','EWR','2026-05-23','2026-06-02',  510,525, 0,'economy', 479, 8,'Boeing 737 MAX 9'),
('ANC','EWR','2026-05-09','2026-05-19',  575,590, 1,'economy', 389, 9,'Boeing 737-800'),
-- JUNE  (midnight sun, Denali clear season)
('ANC','EWR','2026-06-06','2026-06-16',  510,525, 0,'economy', 549, 7,'Boeing 737 MAX 9'),
('ANC','EWR','2026-06-13','2026-06-23',  510,525, 0,'economy', 569, 6,'Boeing 757-200'),
('ANC','EWR','2026-06-20','2026-06-30',  510,525, 0,'economy', 579, 7,'Boeing 737 MAX 9'),
('ANC','EWR','2026-06-06','2026-06-16',  575,590, 1,'economy', 469, 9,'Boeing 737-800'),
-- JULY  (peak Alaska hiking, Kenai Fjords, Denali season)
('ANC','EWR','2026-07-04','2026-07-14',  510,525, 0,'economy', 619, 5,'Boeing 737 MAX 9'),
('ANC','EWR','2026-07-11','2026-07-21',  510,525, 0,'economy', 599, 6,'Boeing 757-200'),
('ANC','EWR','2026-07-18','2026-07-28',  510,525, 0,'economy', 609, 6,'Boeing 737 MAX 9'),
('ANC','EWR','2026-07-25','2026-08-04',  510,525, 0,'economy', 629, 5,'Boeing 737 MAX 9'),
('ANC','EWR','2026-07-04','2026-07-14',  575,590, 1,'economy', 519, 9,'Boeing 737-800');
