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

type DbFlight = {
  destination_id: string
  outbound_date: string
  return_date: string
  outbound_duration_minutes: number
  stops: number
  fare_usd: number
  fare_class: string
}

type DbDestination = {
  id: string
  city: string
  country: string
  region: string
  tags: string[]
  description: string
}

type FlightOption = {
  dest: DbDestination
  month: string
  stops: number
  fare_usd: number
  duration_min: number
  depart: string
  ret: string
}

/**
 * Detect hard constraints from the full conversation text.
 * Returns structured filters we apply server-side.
 */
function detectConstraints(conversationText: string): {
  stopsFilter: number | null  // 0 = nonstop only, 1 = one-stop only, null = no filter
  maxFare: number | null
  monthFilter: string | null   // e.g. "2026-05"
  tagFilters: string[]         // e.g. ["beach", "warm"]
} {
  const text = conversationText.toLowerCase()

  // Stops filter
  let stopsFilter: number | null = null
  if (/\bnonstop\b|non-stop\b|direct\b/.test(text)) stopsFilter = 0
  else if (/\bone.?stop\b|1.?stop\b/.test(text)) stopsFilter = 1

  // Budget: "under $X", "less than $X", "budget $X", "$X or less", "max $X"
  let maxFare: number | null = null
  const fareMatch = text.match(/(?:under|less than|below|budget|max|maximum)[\s$]*(\d+)/)
    ?? text.match(/\$(\d+)\s*(?:or less|max|budget|round.?trip)?/)
  if (fareMatch) maxFare = parseInt(fareMatch[1], 10)

  // Month filter
  let monthFilter: string | null = null
  if (/\bmay\b/.test(text)) monthFilter = '2026-05'
  else if (/\bjune\b/.test(text)) monthFilter = '2026-06'
  else if (/\bjuly\b/.test(text)) monthFilter = '2026-07'
  else if (/\baugust\b/.test(text)) monthFilter = '2026-08'

  // Tag filters
  const tagFilters: string[] = []
  if (/\bbeach\b|tropical|coastal|ocean|seaside/.test(text)) tagFilters.push('beach')
  if (/\bwarm\b|hot\b|sunny/.test(text)) tagFilters.push('warm')
  if (/\badventure\b|hiking|outdoor/.test(text)) tagFilters.push('adventure')
  if (/\bski\b|skiing|snow/.test(text)) tagFilters.push('ski')
  if (/\bluxury\b|upscale/.test(text)) tagFilters.push('luxury')
  if (/\bcultur|historic|museum/.test(text)) tagFilters.push('cultural')

  return { stopsFilter, maxFare, monthFilter, tagFilters }
}

/**
 * Build cheapest-per-bucket flight options from raw DB rows,
 * filtering out past flights, then applying detected constraints.
 */
function buildFilteredOptions(
  destinations: DbDestination[],
  flights: DbFlight[],
  today: string,
  constraints: ReturnType<typeof detectConstraints>
): FlightOption[] {
  const destById: Record<string, DbDestination> = {}
  for (const d of destinations) destById[d.id] = d

  // Best flight per dest+month+stops bucket
  const best: Record<string, FlightOption> = {}

  for (const f of flights) {
    if (f.outbound_date < today) continue
    const dest = destById[f.destination_id]
    if (!dest) continue
    const month = f.outbound_date.slice(0, 7)
    const s = Number(f.stops)
    const key = `${f.destination_id}|${month}|${s}`
    const existing = best[key]
    if (!existing || f.fare_usd < existing.fare_usd) {
      best[key] = {
        dest,
        month,
        stops: s,
        fare_usd: f.fare_usd,
        duration_min: f.outbound_duration_minutes,
        depart: f.outbound_date,
        ret: f.return_date,
      }
    }
  }

  let options = Object.values(best)

  // Apply hard filters server-side
  if (constraints.stopsFilter !== null) {
    options = options.filter(o => o.stops === constraints.stopsFilter)
  }
  if (constraints.maxFare !== null) {
    options = options.filter(o => o.fare_usd < constraints.maxFare!)
  }
  if (constraints.monthFilter !== null) {
    options = options.filter(o => o.month === constraints.monthFilter)
  }
  for (const tag of constraints.tagFilters) {
    options = options.filter(o => o.dest.tags.includes(tag))
  }

  // Sort by fare ascending
  options.sort((a, b) => a.fare_usd - b.fare_usd)

  return options
}

function buildSystemPrompt(
  user: Record<string, unknown>,
  destinations: DbDestination[],
  options: FlightOption[],
  constraints: ReturnType<typeof detectConstraints>,
  today: string
): string {
  const prefs = user.preferences as Record<string, unknown>

  // Format options as a short table for the model
  const tableRows = options.slice(0, 40).map(o =>
    `${o.dest.id}|${o.dest.city}|${o.dest.country}|${o.stops === 0 ? 'nonstop' : '1-stop'}|$${o.fare_usd}|${o.duration_min}min|${o.depart}→${o.ret}`
  )
  const table = tableRows.length > 0
    ? tableRows.join('\n')
    : '(no matching flights found)'

  // Summarize active filters for the model
  const activeFilters: string[] = []
  if (constraints.stopsFilter === 0) activeFilters.push('nonstop only')
  if (constraints.stopsFilter === 1) activeFilters.push('one-stop only')
  if (constraints.maxFare !== null) activeFilters.push(`under $${constraints.maxFare}`)
  if (constraints.monthFilter) activeFilters.push(`month: ${constraints.monthFilter}`)
  if (constraints.tagFilters.length > 0) activeFilters.push(`tags: ${constraints.tagFilters.join(', ')}`)

  const destDescriptions = destinations.map(d => `${d.id} (${d.city}): ${d.description}`).join('\n')

  return `You are the United Airlines AI Trip Planner. Help travelers discover destinations.

TODAY'S DATE: ${today}

ACTIVE FILTERS (already applied server-side): ${activeFilters.length > 0 ? activeFilters.join(', ') : 'none'}

PRE-FILTERED FLIGHT OPTIONS (id|city|country|stops|fare|duration|dates):
${table}

DESTINATION DESCRIPTIONS:
${destDescriptions}

USER PROFILE:
- Name: ${user.display_name}, Home: ${user.home_airport}, Tier: ${user.mileage_plus_tier}
- Travel style: ${prefs?.travelStyle ?? 'leisure'}, Seat: ${prefs?.seatPreference ?? 'aisle'}
- Recently visited (skip): ${(user.recent_destinations as string[])?.join(', ') || 'none'}

RULES:
- Return ONLY valid JSON. No markdown, no text outside the JSON object.
- Never use em dashes.
- assistantMessage must never be empty.
- If PRE-FILTERED FLIGHT OPTIONS is empty, return responseType "no_results" with 3-4 actionable filterSuggestions.
- If 3+ options exist, return responseType "suggestions" with exactly 3 items.
- Pick the 3 best options from the pre-filtered list above. Do NOT apply additional filters.
- Exactly one suggestion must have isBestValue: true (pick the best value for the user's preferences).

RESPONSE CONTRACT:
{
  "responseType": "suggestions|clarifying_question|no_results|conflict",
  "assistantMessage": "1-2 sentences about what you found",
  "rankingCriteria": "best_match|lowest_price|shortest_duration|null",
  "suggestions": [
    {
      "destinationId": "id from options table",
      "city": "city name",
      "country": "country name",
      "whyThisMatches": "one sentence tied to user preferences",
      "tradeOff": "one sentence or null",
      "isBestValue": true or false,
      "lowestFareUsd": fare number from options,
      "outboundDate": "depart date from options",
      "returnDate": "return date from options",
      "flightDurationMinutes": duration number from options,
      "stops": 0 or 1
    }
  ],
  "conflictHint": "string or null",
  "alternativeHint": "string or null",
  "filterSuggestions": []
}

For "suggestions": exactly 3 items, filterSuggestions=[].
For no_results/conflict: suggestions=[], filterSuggestions has 3-4 short tap-friendly phrases.`
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

  if (!parsed.assistantMessage?.trim()) {
    parsed.assistantMessage = parsed.responseType === 'suggestions'
      ? 'Here are some destinations that match your trip.'
      : 'Let me help you adjust your search.'
  }

  if (!Array.isArray(parsed.filterSuggestions)) parsed.filterSuggestions = []

  const validIds = new Set(destinations.map((d) => d.id))
  if (parsed.suggestions?.length) {
    parsed.suggestions = parsed.suggestions.filter((s) => validIds.has(s.destinationId))
  }

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

    // Build full conversation text for constraint detection
    const historyText = (history ?? []).map(h => h.content).join(' ')
    const conversationText = `${historyText} ${messageText}`.trim()

    const today = new Date().toISOString().slice(0, 10)
    const constraints = detectConstraints(conversationText)
    const options = buildFilteredOptions(
      (destinations ?? []) as unknown as DbDestination[],
      (flights ?? []) as unknown as DbFlight[],
      today,
      constraints
    )

    const systemPrompt = buildSystemPrompt(
      user,
      (destinations ?? []) as unknown as DbDestination[],
      options,
      constraints,
      today
    )
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
