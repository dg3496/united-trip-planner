import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ResponseType = 'suggestions' | 'clarifying_question' | 'no_results' | 'conflict'

// City/keyword → IATA code for destination pinning
const CITY_TO_IATA: Record<string, string> = {
  'amsterdam': 'AMS', 'anchorage': 'ANC', 'alaska': 'ANC',
  'barcelona': 'BCN', 'bangkok': 'BKK', 'thailand': 'BKK',
  'bogota': 'BOG', 'colombia': 'BOG',
  'cancun': 'CUN', 'mexico': 'MEX', 'mexico city': 'MEX',
  'denver': 'DEN', 'colorado': 'DEN',
  'dublin': 'DUB', 'ireland': 'DUB',
  'rome': 'FCO', 'italy': 'FCO',
  'fort lauderdale': 'FLL',
  'sao paulo': 'GRU', 'brazil': 'GRU',
  'honolulu': 'HNL', 'hawaii': 'HNL',
  'seoul': 'ICN', 'korea': 'ICN',
  'reykjavik': 'KEF', 'iceland': 'KEF',
  'los angeles': 'LAX',
  'lima': 'LIM', 'peru': 'LIM',
  'lisbon': 'LIS', 'portugal': 'LIS',
  'montego bay': 'MBJ', 'jamaica': 'MBJ',
  'miami': 'MIA',
  'nassau': 'NAS', 'bahamas': 'NAS',
  'tokyo': 'NRT', 'japan': 'NRT',
  'phoenix': 'PHX', 'arizona': 'PHX',
  'punta cana': 'PUJ', 'dominican': 'PUJ',
  'san diego': 'SAN',
  'seattle': 'SEA',
  'san juan': 'SJU', 'puerto rico': 'SJU',
}

// Month name → YYYY-MM for 2026
const MONTH_MAP: Record<string, string> = {
  january: '2026-01', february: '2026-02', march: '2026-03',
  april: '2026-04', may: '2026-05', june: '2026-06',
  july: '2026-07', august: '2026-08', september: '2026-09',
  october: '2026-10', november: '2026-11', december: '2026-12',
}

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
  matchType: 'strict' | 'alternative'
}

/**
 * Detect hard constraints from the full conversation text.
 * Returns structured filters we apply server-side.
 */
function detectConstraints(conversationText: string, today: string): {
  stopsFilter: number | null
  maxFare: number | null
  monthFilter: string | null
  requestedPastMonth: string | null
  tagFilters: string[]
  pinnedDestination: string | null  // IATA code if user named a specific city
} {
  const text = conversationText.toLowerCase()

  // Pinned destination — check multi-word phrases first, then single words
  let pinnedDestination: string | null = null
  const sortedCities = Object.keys(CITY_TO_IATA).sort((a, b) => b.length - a.length)
  for (const city of sortedCities) {
    if (text.includes(city)) {
      pinnedDestination = CITY_TO_IATA[city]
      break
    }
  }

  // Stops filter
  let stopsFilter: number | null = null
  if (/\bnonstop\b|non-stop\b|direct\b/.test(text)) stopsFilter = 0
  else if (/\bone.?stop\b|1.?stop\b/.test(text)) stopsFilter = 1

  // Budget: "under $X", "less than $X", "$X or less", "max $X"
  // Clear budget if user explicitly asks to increase it in the latest part of conversation
  let maxFare: number | null = null
  const increaseBudget = /increase.{0,20}budget|bump.{0,20}budget|raise.{0,20}budget|higher budget|more budget|expand budget|budget.{0,10}higher|budget.{0,10}more/.test(text)
  if (!increaseBudget) {
    const fareMatch = text.match(/(?:under|less than|below|max|maximum)[\s$]*(\d+)/)
      ?? text.match(/\$(\d+)\s*(?:or less|max|budget|round.?trip)?/)
    if (fareMatch) maxFare = parseInt(fareMatch[1], 10)
  }

  // Month filter — detect all 12 months; skip filter if month is in the past
  let monthFilter: string | null = null
  let requestedPastMonth: string | null = null
  const currentMonth = today.slice(0, 7) // e.g. "2026-04"
  for (const [name, ym] of Object.entries(MONTH_MAP)) {
    if (new RegExp(`\\b${name}\\b`).test(text)) {
      if (ym >= currentMonth) {
        monthFilter = ym
      } else {
        requestedPastMonth = name.charAt(0).toUpperCase() + name.slice(1)
      }
      break
    }
  }

  // Tag filters
  const tagFilters: string[] = []
  if (/\bbeach\b|tropical|coastal|ocean|seaside/.test(text)) tagFilters.push('beach')
  if (/\bwarm\b|hot\b|sunny/.test(text)) tagFilters.push('warm')
  if (/\badventure\b|hiking|outdoor/.test(text)) tagFilters.push('adventure')
  if (/\bski\b|skiing|snow/.test(text)) tagFilters.push('skiing')
  if (/\bluxury\b|upscale/.test(text)) tagFilters.push('luxury')
  if (/\bcultur|historic|museum/.test(text)) tagFilters.push('culture')

  return { stopsFilter, maxFare, monthFilter, requestedPastMonth, tagFilters, pinnedDestination }
}

/**
 * Build cheapest-per-bucket flight options from raw DB rows,
 * applying a tiered constraint hierarchy:
 *   1. Pinned city (named destination) — always included, bypass budget/stops
 *   2. Month / stops — hard constraints, never relaxed
 *   3. Budget / tags — soft constraints, relaxed when < 3 strict matches
 *
 * Options are labeled 'strict' (all constraints met) or 'alternative'
 * (relaxed to fill the 3-card minimum).
 */
function buildFilteredOptions(
  destinations: DbDestination[],
  flights: DbFlight[],
  today: string,
  constraints: ReturnType<typeof detectConstraints>
): FlightOption[] {
  const destById: Record<string, DbDestination> = {}
  for (const d of destinations) destById[d.id] = d

  // ── Build cheapest-per-dest+month+stops bucket ───────────────────────────
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
        dest, month, stops: s,
        fare_usd: f.fare_usd,
        duration_min: f.outbound_duration_minutes,
        depart: f.outbound_date,
        ret: f.return_date,
        matchType: 'strict',
      }
    }
  }
  const allOptions = Object.values(best)

  // ── STRICT PASS: all constraints applied ─────────────────────────────────
  let strictOptions = [...allOptions]
  if (constraints.stopsFilter !== null)
    strictOptions = strictOptions.filter(o => o.stops === constraints.stopsFilter)
  if (constraints.maxFare !== null)
    strictOptions = strictOptions.filter(o => o.fare_usd < constraints.maxFare!)
  if (constraints.monthFilter !== null)
    strictOptions = strictOptions.filter(o => o.month === constraints.monthFilter)
  for (const tag of constraints.tagFilters)
    strictOptions = strictOptions.filter(o => o.dest.tags.includes(tag))

  // ── PINNED CITY BYPASS: always include named city even if over budget/stops ──
  // Month filter is still respected (user said "Cancun in May" → May only)
  if (constraints.pinnedDestination) {
    const alreadyIn = strictOptions.some(o => o.dest.id === constraints.pinnedDestination)
    if (!alreadyIn) {
      const pinnedCandidates = allOptions
        .filter(o => {
          if (o.dest.id !== constraints.pinnedDestination) return false
          if (constraints.monthFilter && o.month !== constraints.monthFilter) return false
          return true
        })
        .sort((a, b) => a.fare_usd - b.fare_usd)
      if (pinnedCandidates.length > 0) {
        // Still label 'strict' — it's exactly what the user asked for; model will note the tradeoff
        strictOptions.unshift({ ...pinnedCandidates[0], matchType: 'strict' })
      }
    }
  }

  // ── ALTERNATIVE PASS: fill to 3+ slots when strict < 3 ──────────────────
  // Keep month + stops hard; relax budget + tags
  if (strictOptions.length < 3) {
    let relaxed = [...allOptions]
    if (constraints.stopsFilter !== null)
      relaxed = relaxed.filter(o => o.stops === constraints.stopsFilter)
    if (constraints.monthFilter !== null)
      relaxed = relaxed.filter(o => o.month === constraints.monthFilter)
    const includedKeys = new Set(strictOptions.map(o => `${o.dest.id}|${o.month}|${o.stops}`))
    relaxed = relaxed
      .filter(o => !includedKeys.has(`${o.dest.id}|${o.month}|${o.stops}`))
      .map(o => ({ ...o, matchType: 'alternative' as const }))
      .sort((a, b) => a.fare_usd - b.fare_usd)
    const needed = 3 - strictOptions.length + 2  // add 2 extra so model has choice
    strictOptions = [...strictOptions, ...relaxed.slice(0, needed)]
  }

  // CITY CONSTRAINT: if a city was pinned, everything else is an alternative
  // (they may meet budget/stops, but the user asked for a specific destination)
  if (constraints.pinnedDestination) {
    strictOptions = strictOptions.map(o => ({
      ...o,
      matchType: o.dest.id === constraints.pinnedDestination ? 'strict' : 'alternative',
    }))
  }

  // ── SORT: pinned → strict → alternative → fare ───────────────────────────
  strictOptions.sort((a, b) => {
    const aPinned = constraints.pinnedDestination && a.dest.id === constraints.pinnedDestination ? -1 : 0
    const bPinned = constraints.pinnedDestination && b.dest.id === constraints.pinnedDestination ? -1 : 0
    if (aPinned !== bPinned) return aPinned - bPinned
    if (a.matchType !== b.matchType) return a.matchType === 'strict' ? -1 : 1
    return a.fare_usd - b.fare_usd
  })

  return strictOptions
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
  // matchType: "strict" = meets ALL constraints; "alternative" = relaxed (over budget or different tags)
  const tableRows = options.slice(0, 40).map(o =>
    `${o.dest.id}|${o.dest.city}|${o.dest.country}|${o.stops === 0 ? 'nonstop' : '1-stop'}|$${o.fare_usd}|${o.duration_min}min|${o.depart}→${o.ret}|${o.matchType}`
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

  const pinnedNote = constraints.pinnedDestination
    ? `CITY CONSTRAINT (highest priority): The user specifically named ${constraints.pinnedDestination}. You MUST include ${constraints.pinnedDestination} as suggestion[0]. Even if it is marked "alternative" in the table (e.g. slightly over budget), still include it first — use tradeOff to note the difference. The other 2 slots can be complementary options.`
    : ''

  const pastMonthNote = constraints.requestedPastMonth
    ? `NOTE: The user mentioned ${constraints.requestedPastMonth}, which is already in the past. No ${constraints.requestedPastMonth} flights exist. Show the best available upcoming options instead and briefly acknowledge the date shift in assistantMessage.`
    : ''

  const destDescriptions = destinations.map(d => `${d.id} (${d.city}): ${d.description}`).join('\n')

  return `You are the United Airlines AI Trip Planner. Help travelers discover destinations.

TODAY'S DATE: ${today}

ACTIVE FILTERS (already applied server-side): ${activeFilters.length > 0 ? activeFilters.join(', ') : 'none'}
${pinnedNote ? `\n${pinnedNote}` : ''}${pastMonthNote ? `\n${pastMonthNote}` : ''}

PRE-FILTERED FLIGHT OPTIONS (id|city|country|stops|fare|duration|dates|match_type):
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
- If any options exist (even 1 or 2), return responseType "suggestions". Never return "no_results" when options are available.
- Pick the best 3 options. Prefer "strict" options; include "alternative" options when needed to fill 3 slots.
- For "alternative" options: set isAlternative: true and write a specific tradeOff: if it differs from the pinned city, say e.g. "You asked for Cancun specifically; this is a similar beach option worth considering at $151 less." If it's over budget, say exactly how much over. Be concrete and helpful.
- For "strict" options: set isAlternative: false, tradeOff: null (unless there's a genuine concern like cold weather).
- Exactly one suggestion must have isBestValue: true (pick the best value for the user's preferences).
- CONSTRAINT PRIORITY: city name > dates > stops > budget > tags. Honor higher-priority constraints even if lower ones can't be met.

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
      "tradeOff": "one sentence or null — REQUIRED if isAlternative is true",
      "isBestValue": true or false,
      "isAlternative": false,
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
    // Rule: isBestValue must NEVER be on an alternative when non-alternatives exist
    const strictSuggs = parsed.suggestions.filter(s => !s.isAlternative)
    if (strictSuggs.length > 0) {
      // Strip bestValue from any alternative the model incorrectly marked
      parsed.suggestions = parsed.suggestions.map(s => ({
        ...s,
        isBestValue: s.isAlternative ? false : s.isBestValue,
      }))
    }

    // Ensure exactly one suggestion has isBestValue: true
    const bestCount = parsed.suggestions.filter(s => s.isBestValue).length
    if (bestCount === 0) {
      // Assign to cheapest in the non-alternative pool (or cheapest overall)
      const pool = strictSuggs.length > 0 ? strictSuggs : parsed.suggestions
      const cheapest = pool.reduce((a, b) => a.lowestFareUsd < b.lowestFareUsd ? a : b)
      const idx = parsed.suggestions.indexOf(cheapest)
      if (idx >= 0) parsed.suggestions[idx].isBestValue = true
    } else if (bestCount > 1) {
      let found = false
      parsed.suggestions = parsed.suggestions.map(s => {
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
    const constraints = detectConstraints(conversationText, today)
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
