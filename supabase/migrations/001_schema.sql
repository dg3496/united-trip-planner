-- United AI Trip Planner — Database Schema
-- Run this in Supabase SQL Editor or via supabase db push
-- See techContext.md for full column documentation

-- Users (demo user seeded in 002_seed.sql)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text not null,
  home_airport text not null default 'EWR',
  mileage_plus_tier text not null default 'general'
    check (mileage_plus_tier in ('general','silver','gold','platinum','1k')),
  mileage_balance integer not null default 0,
  preferences jsonb not null default '{}',
  recent_destinations text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_id_idx on messages(conversation_id);

-- Destinations (seeded in 002_seed.sql)
create table if not exists destinations (
  id text primary key,  -- IATA code e.g. 'CUN', 'MIA'
  city text not null,
  country text not null,
  region text not null,
  tags text[] not null default '{}',
  description text not null,
  image_url text not null default '',
  popular_from_hubs text[] not null default '{}'
);

-- Flights (seeded in 002_seed.sql)
create table if not exists flights (
  id uuid primary key default gen_random_uuid(),
  destination_id text not null references destinations(id) on delete cascade,
  origin_airport text not null default 'EWR',
  outbound_date date not null,
  return_date date not null,
  outbound_duration_minutes integer not null,
  return_duration_minutes integer not null,
  stops integer not null default 0,
  fare_class text not null default 'economy'
    check (fare_class in ('economy','economy_plus','business')),
  fare_usd integer not null,
  seats_available integer not null default 9,
  aircraft_type text not null default 'Boeing 737-800'
);
create index if not exists flights_destination_id_idx on flights(destination_id);
create index if not exists flights_origin_airport_idx on flights(origin_airport);

-- Price Alerts
create table if not exists price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  destination_id text not null references destinations(id) on delete cascade,
  flight_id uuid references flights(id) on delete set null,
  threshold_fare_usd integer not null,
  status text not null default 'active'
    check (status in ('active','fired','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

-- Disable RLS for prototype (single demo user, service-role key used server-side)
alter table users disable row level security;
alter table conversations disable row level security;
alter table messages disable row level security;
alter table destinations disable row level security;
alter table flights disable row level security;
alter table price_alerts disable row level security;
