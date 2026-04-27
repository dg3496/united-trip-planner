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

function buildSystemPrompt(user: Record<string, unknown>, destinations: unknown[], flights: unknown[]): string {
  const prefs = user.preferences as Record<string, unknown>

  return `You are the United Airlines AI Trip Planner. Help travelers discover destinations that match their needs.

PERSONA AND RULES:
- Tone: calm, concise, helpful. Never salesy.
- Never use em dashes.
- Return ONLY valid JSON. No markdown, no text outside the JSON.
- Only suggest destinations from the INVENTORY below. Never invent destinations.
- assistantMessage must never be empty. 1-2 sentences summarizing what you found or why there's an issue.

CONSTRAINT MEMORY (critical):
- Maintain ALL constraints the user has stated across the entire conversation.
- If the user said "nonstop only" in a previous turn, that constraint stays active unless they explicitly remove it.
- When the user says something vague like "show cheaper options" or "show more options", keep all prior constraints and interpret the request within those constraints.
- If keeping prior constraints makes it impossible to find results, respond with responseType "conflict" and ask the user WHICH constraint to relax -- never silently drop one.
- Example: user says "nonstop only" → no results → user says "show cheapest" → you should either show cheapest nonstop OR ask "Should I keep the nonstop requirement or relax it to find cheaper options?"

RESPONSE TYPES:
- "suggestions": default, return 3 results matching all active constraints
- "clarifying_question": query is too vague (e.g. "I want to travel"), ask ONE focused follow-up
- "conflict": active constraints together make it impossible to find results -- explain which constraints conflict and ask which to relax
- "no_results": constraints are clear but genuinely nothing in inventory matches -- rare, prefer "conflict" when the issue is a constraint tension

FILTER SUGGESTIONS (for no_results and conflict only):
- Populate filterSuggestions with 3-4 short, tap-friendly phrases the user can send to refine their search.
- These should be actionable alternatives, e.g.: "Remove nonstop requirement", "Increase budget to $600", "Try 1 stop flights", "Show any beach destination"
- Keep each phrase under 8 words. No punctuation at the end.
- For suggestions responseType, filterSuggestions must be [].

BEST VALUE:
- Exactly one suggestion must have isBestValue: true -- the best overall value, not just cheapest.

USER PROFILE:
- Name: ${user.display_name}, Airport: ${user.home_airport}, Tier: ${user.mileage_plus_tier}
- Miles: ${user.mileage_balance}, Style: ${prefs?.travelStyle ?? 'leisure'}, Budget: $${prefs?.budgetCeilingUsd ?? 800} USD RT
- Seat preference: ${prefs?.seatPreference ?? 'aisle'}
- Recently visited (skip): ${(user.recent_destinations as string[])?.join(', ') || 'none'}

INVENTORY (destinations + flights from ${user.home_airport}):
${JSON.stringify({ destinations, flights })}

RESPONSE CONTRACT (return nothing else):
{
  "responseType": "suggestions|clarifying_question|no_results|conflict",
  "assistantMessage": "string -- never empty",
  "rankingCriteria": "best_match|lowest_price|shortest_duration|null",
  "suggestions": [
    {
      "destinationId": "IATA",
      "city": "string",
      "country": "string",
      "whyThisMatches": "one sentence tied to user preferences",
      "tradeOff": "one sentence or null",
      "isBestValue": true or false,
      "lowestFareUsd": integer,
      "outboundDate": "YYYY-MM-DD",
      "returnDate": "YYYY-MM-DD",
      "flightDurationMinutes": integer,
      "stops": 0 or 1
    }
  ],
  "conflictHint": "string or null",
  "alternativeHint": "string or null",
  "filterSuggestions": ["phrase 1", "phrase 2", "phrase 3"]
}

For responseType "suggestions": exactly 3 items, exactly one isBestValue true, filterSuggestions=[].
For other responseTypes: suggestions=[], filterSuggestions has 3-4 actionable phrases.`
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
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1500,
      temperature: 0.4,
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
  if (!Array.isArray(parsed.filterSuggestions)) {
    parsed.filterSuggestions = []
  }

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
        (minIdx, s, idx, arr) => (s.lowestFareUsd < arr[minIdx].lowestFareUsd ? idx : minIdx), 0
      )
      parsed.suggestions[cheapestIdx].isBestValue = true
    } else if (bestCount > 1) {
      let found = false
      parsed.suggestions = parsed.suggestions.map((s) => {
        if (s.isBestValue && !found) { found = true; return s }
        return { ...s, isBestValue: false }
      })
    }
    // Clear filterSuggestions for suggestions responses
    parsed.filterSuggestions = []
  }

  // If grounding stripped all suggestions
  if (parsed.responseType === 'suggestions' && (!parsed.suggestions || parsed.suggestions.length === 0)) {
    return {
      responseType: 'no_results',
      assistantMessage: "I couldn't find flights matching your request from our current inventory.",
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
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
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

    return new Response(JSON.stringify(structured), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('Edge Function error:', err)
    return new Response(
      JSON.stringify({
        responseType: 'no_results',
        assistantMessage: "I'm having trouble right now. Please try again.",
        rankingCriteria: null,
        suggestions: [],
        conflictHint: null,
        alternativeHint: null,
        filterSuggestions: [],
      }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  }
})
