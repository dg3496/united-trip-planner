// ─── Claude Response Contract ────────────────────────────────────────────────
// These types mirror exactly the JSON shape the Edge Function returns.
// Every field here maps 1:1 to systemPatterns.md "Claude Response Contract".

export type ResponseType = 'suggestions' | 'clarifying_question' | 'no_results' | 'conflict'

export type RankingCriteria = 'best_match' | 'lowest_price' | 'shortest_duration' | null

export interface Suggestion {
  destinationId: string      // matches destinations.id in Supabase
  city: string
  country: string
  whyThisMatches: string     // FR-023 — always present
  tradeOff: string | null    // FR-024
  isBestValue: boolean       // FR-025 — exactly one true per suggestions array
  lowestFareUsd: number
  outboundDate: string       // ISO date e.g. "2026-03-14"
  returnDate: string
  flightDurationMinutes: number
  stops: number
}

export interface TripPlannerResponse {
  responseType: ResponseType
  assistantMessage: string
  rankingCriteria: RankingCriteria
  suggestions: Suggestion[]
  conflictHint: string | null   // FR-013
  alternativeHint: string | null // FR-014
}

// ─── Message Store Types ──────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  metadata?: TripPlannerResponse   // present on assistant messages with card data
  createdAt: string
}

// ─── Supabase DB Row Types ────────────────────────────────────────────────────

export interface DbUser {
  id: string
  email: string
  display_name: string
  home_airport: string
  mileage_plus_tier: 'general' | 'silver' | 'gold' | 'platinum' | '1k'
  mileage_balance: number
  preferences: {
    travelStyle: string
    budgetCeilingUsd: number
    blackoutDates: string[]
    seatPreference: string
  }
  recent_destinations: string[]
}

export interface DbDestination {
  id: string
  city: string
  country: string
  region: string
  tags: string[]
  description: string
  image_url: string
  popular_from_hubs: string[]
}

export interface DbFlight {
  id: string
  destination_id: string
  origin_airport: string
  outbound_date: string
  return_date: string
  outbound_duration_minutes: number
  return_duration_minutes: number
  stops: number
  fare_class: 'economy' | 'economy_plus' | 'business'
  fare_usd: number
  seats_available: number
  aircraft_type: string
}

export interface DbConversation {
  id: string
  user_id: string
  started_at: string
  last_active_at: string
}

export interface DbPriceAlert {
  id: string
  user_id: string
  destination_id: string
  flight_id: string
  threshold_fare_usd: number
  status: 'active' | 'fired' | 'expired'
  created_at: string
  expires_at: string
}
