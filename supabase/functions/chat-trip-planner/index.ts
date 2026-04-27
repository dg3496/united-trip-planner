import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ResponseType = 'suggestions' | 'clarifying_question' | 'no_results' | 'conflict'

interface Suggestion {
  destinationId: string
  city: string
  country: string
  whyThisMatches: string
  tradeOff: string | null
  isBestValue: boolean
  lowestFareUsd: number
  outboundDate: string
  returnDate: string
  flightDurationMinutes: number
  stops: number
}

interface TripPlannerResponse {
  responseType: ResponseType
  assistantMessage: string
  rankingCriteria: string | null
  suggestions: Suggestion[]
  conflictHint: string | null
  alternativeHint: string | null
  filterSuggestions: string[]
}

// Trim inventory to only fields the model needs — keeps token count low
function trimDestination(d: Record<string, unknown>) {
  return { id: d.id, city: d.city, country: d.country, region: d.region, tags: d.tags, description: d.description }
}

function trimFlight(f: Record<string, unknown>) {
  return {
    destination_id: f.destination_id,
    outbound_date: f.outbound_date,
    return_date: f.return_date,
    outbound_duration_minutes: f.outbound_duration_minutes,
    stops: f.stops,
    fare_usd: f.fare_usd,
    fare_class: f.fare_class,
  }
}

function buildSystemPrompt(user: Record<string, unknown>, destinations: unknown[], flights: unknown[]): string {
  const prefs = user.preferences as Record<string, unknown>

  const trimmedDests = (destinations as Record<string, unknown>[]).map(trimDestination)
  const trimmedFlights = (flights as Record<string, unknown>[]).map(trimFlight)

  return `You are the United Airlines AI Trip Planner. Help travelers discover destinations that match their needs.

RULES:
- Tone: calm, concise, helpful. Never salesy.
- Never use em dashes.
- Return ONLY valid JSON. No markdown, no text outside the JSON object.
- Only suggest destinations from the INVENTORY below. Never invent destinations.
- assistantMessage must never be empty. Write 1-2 sentences about what you found or what the issue is.
- Use the conversation history to understand what constraints the user has stated so far. Only apply constraints the user has explicitly requested -- do not invent constraints they did not mention.

CONSTRAINT HANDLING:
- Apply only constraints the user has explicitly stated in this conversation.
- If the user adds a new constraint in a follow-up (e.g. "nonstop only"), keep all prior constraints active too.
- If a follow-up is vague (e.g. "show more" or "show cheaper"), re-run within the same set of active constraints.
- Use responseType "conflict" only when the user's explicit constraints genuinely conflict with each other AND no results exist. Do not use conflict if results are available.
- Use responseType "no_results" only when there are truly no matching flights in inventory.
- Default to responseType "suggestions" whenever 3 or more matching flights exist.

FILTER SUGGESTIONS (for no_results and conflict only):
- Return 3-4 short tap-friendly phrases the user can send to try a different search.
- Keep each under 8 words, no punctuation. E.g. "Remove nonstop requirement", "Increase budget to $600".
- For "suggestions" responseType, filterSuggestions must be [].

BEST VALUE:
- Exactly one suggestion must have isBestValue: true -- best overall value, not just cheapest.

USER PROFILE:
- Name: ${user.display_name}, Home airport: ${user.home_airport}, Tier: ${user.mileage_plus_tier}
- Miles: ${user.mileage_balance}, Travel style: ${prefs?.travelStyle ?? 'leisure'}
- Budget ceiling: $${prefs?.budgetCeilingUsd ?? 800} USD round trip
- Seat preference: ${prefs?.seatPreference ?? 'aisle'}
- Recently visited (skip these): ${(user.recent_destinations as string[])?.join(', ') || 'none'}

INVENTORY:
Destinations: ${JSON.stringify(trimmedDests)}
Flights from ${user.home_airport}: ${JSON.stringify(trimmedFlights)}

RESPONSE CONTRACT (return nothing else):
{
  "responseType": "suggestions|clarifying_question|no_results|conflict",
  "assistantMessage": "string -- never empty",
  "rankingCriteria": "best_match|lowest_price|shortest_duration|null",
  "suggestions": [
    {
      "destinationId": "IATA code from inventory",
      "city": "string",
      "country": "string",
      "whyThisMatches": "one sentence tied to user preferences",
      "tradeOff": "one sentence or null",
      "isBestValue": true or false,
      "lowestFareUsd": integer (from inventory),
      "outboundDate": "YYYY-MM-DD",
      "returnDate": "YYYY-MM-DD",
      "flightDurationMinutes": integer,
      "stops": 0 or 1
    }
  ],
  "conflictHint": "string or null",
  "alternativeHint": "string or null",
  "filterSuggestions": []
}

For "suggestions": exactly 3 items, exactly one isBestValue true, filterSuggestions=[].
For all other types: suggestions=[], filterSuggestions has 3-4 actionable phrases.`
}

async function callOpenAI(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY secret is not set')

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ]

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`OpenAI ${res.status}:`, err)
    throw new Error(`OpenAI API ${res.status}`)
  }

  const json = await res.json()
  const text = json.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI returned empty content')
  return text
}

function parseAndValidateResponse(rawText: string, destinations: Array<{ id: string }>): TripPlannerResponse {
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  let parsed: TripPlannerResponse
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('OpenAI returned invalid JSON:', rawText.slice(0, 200))
    return {
      responseType: 'no_results',
      assistantMessage: "I'm having trouble right now. Please try again.",
      rankingCriteria: null,
      suggestions: [],
      conflictHint: null,
      alternativeHint: null,
      filterSuggestions: [],
    }
  }

  // Ensure assistantMessage is never empty
  if (!parsed.assistantMessage?.trim()) {
    parsed.assistantMessage = parsed.responseType === 'suggestions'
      ? 'Here are some destinations that match your trip.'
      : 'Let me help you adjust your search.'
  }

  // Ensure filterSuggestions is always an array
  if (!Array.isArray(parsed.filterSuggestions)) parsed.filterSuggestions = []

  // FR-022 grounding: strip suggestions with unknown destinationIds
  const validIds = new Set(destinations.map((d) => d.id))
  if (parsed.suggestions?.length) {
    parsed.suggestions = parsed.suggestions.filter((s) => validIds.has(s.destinationId))
  }

  // FR-025 Best Value normalization: ensure exactly one isBestValue
  if (parsed.responseType === 'suggestions' && parsed.suggestions?.length > 0) {
    const bestCount = parsed.suggestions.filter((s) => s.isBestValue).length
    if (bestCount === 0) {
      const cheapestIdx = parsed.suggestions.reduce(
        (mi, s, i, a) => (s.lowestFareUsd < a[mi].lowestFareUsd ? i : mi), 0
      )
      parsed.suggestions[cheapestIdx].isBestValue = true
    } else if (bestCount > 1) {
      let found = false
      parsed.suggestions = parsed.suggestions.map((s) => {
        if (s.isBestValue && !found) { found = true; return s }
        return { ...s, isBestValue: false }
      })
    }
    parsed.filterSuggestions = []
  }

  // If grounding stripped all suggestions
  if (parsed.responseType === 'suggestions' && (!parsed.suggestions || parsed.suggestions.length === 0)) {
    return {
      responseType: 'no_results',
      assistantMessage: "I couldn't find flights matching your request in our current inventory.",
      rankingCriteria: null,
      suggestions: [],
      conflictHint: null,
      alternativeHint: 'Try adjusting your budget or travel dates.',
      filterSuggestions: ['Increase budget to $600', 'Allow 1 stop', 'Try different dates', 'Show all beach destinations'],
    }
  }

  return parsed
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { conversationId, userId, messageText } = await req.json()

    if (!conversationId || !userId || !messageText?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing conversationId, userId, or messageText' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: user, error: userErr } = await supabase.from('users').select('*').eq('id', userId).single()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { ...corsHeaders, 'content-type': 'application/json' } })
    }

    const { data: history } = await supabase
      .from('messages').select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    const { data: destinations } = await supabase.from('destinations').select('*')
    const { data: flights } = await supabase.from('flights').select('*').eq('origin_airport', user.home_airport)

    await supabase.from('messages').insert({ conversation_id: conversationId, role: 'user', content: messageText.trim() })
    await supabase.from('conversations').update({ last_active_at: new Date().toISOString() }).eq('id', conversationId)

    const systemPrompt = buildSystemPrompt(user, destinations ?? [], flights ?? [])
    const rawText = await callOpenAI(systemPrompt, history ?? [], messageText.trim())
    const structured = parseAndValidateResponse(rawText, destinations ?? [])

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: structured.assistantMessage,
      metadata: structured,
    })

    return new Response(JSON.stringify(structured), { headers: { ...corsHeaders, 'content-type': 'application/json' } })
  } catch (err) {
    console.error('Edge Function error:', err)
    return new Response(
      JSON.stringify({
        responseType: 'no_results',
        assistantMessage: "I'm having trouble right now. Please try again.",
        rankingCriteria: null, suggestions: [], conflictHint: null, alternativeHint: null, filterSuggestions: [],
      }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  }
})
