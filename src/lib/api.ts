import { supabase, DEMO_USER_ID } from './supabase'
import type { TripPlannerResponse, DbFlight, DbDestination } from './types'

export interface ChatRequestPayload {
  conversationId: string
  userId: string
  messageText: string
}

// POST to the Supabase Edge Function
export async function sendChatMessage(
  conversationId: string,
  messageText: string
): Promise<TripPlannerResponse> {
  const payload: ChatRequestPayload = {
    conversationId,
    userId: DEMO_USER_ID,
    messageText,
  }

  const { data, error } = await supabase.functions.invoke('chat-trip-planner', {
    body: payload,
  })

  if (error) {
    throw new Error(error.message || 'Edge Function call failed')
  }

  return data as TripPlannerResponse
}

// Create a new conversation row and return its id
export async function createConversation(): Promise<string> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: DEMO_USER_ID })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error('Failed to create conversation')
  }

  return data.id
}

// Fetch the cheapest flight for a destination (booking, alerts, expanded detail)
export async function getCheapestFlightForDestination(
  destinationId: string
): Promise<DbFlight | null> {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('destination_id', destinationId)
    .order('fare_usd', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data as DbFlight | null
}

// Fetch the cheapest flight for a destination (used by booking screen)
export async function getFlightById(flightId: string): Promise<DbFlight | null> {
  const { data, error } = await supabase
    .from('flights')
    .select('*')
    .eq('id', flightId)
    .single()

  if (error) return null
  return data as DbFlight
}

export async function getDestinationById(id: string): Promise<DbDestination | null> {
  const { data, error } = await supabase.from('destinations').select('*').eq('id', id).maybeSingle()

  if (error) return null
  return data as DbDestination | null
}

// Set a price alert for a destination / flight
export async function setPriceAlert(
  destinationId: string,
  flightId: string | null,
  thresholdFareUsd: number
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 90)

  const { error } = await supabase.from('price_alerts').insert({
    user_id: DEMO_USER_ID,
    destination_id: destinationId,
    flight_id: flightId,
    threshold_fare_usd: thresholdFareUsd,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    throw new Error('Failed to set price alert')
  }
}
