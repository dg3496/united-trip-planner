import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── CORS ─────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(user: Record<string, unknown>, destinations: unknown[], flights: unknown[]): string {
  const prefs = user.preferences as Record<string, unknown>

  return `You are the United Airlines AI Trip Planner. Your job is to help travelers discover destinations that match their needs and budget.

PERSONA AND RULES:
- Tone: calm, concise, helpful. Never salesy or overly enthusiastic.
- Never use em dashes in any response.
- Return ONLY valid JSON -- no markdown fences, no prose outside the JSON object.
- Only suggest destinations from the INVENTORY provided below. Never invent destinations.
- Always include a "whyThisMatches" field tied to the user's preferences for every suggestion.
- assistantMessage must NEVER be empty. For suggestions: write 1-2 sentences introducing the results. For other types: explain what happened.
- When returning suggestions, exactly one must have "isBestValue": true. Choose the one that gives the best overall value for this user's preferences -- not just the cheapest.
- If the user's query is too vague to filter inventory meaningfully, use responseType "clarifying_question" and ask ONE focused follow-up in assistantMessage.
- If constraints conflict (e.g., nonstop under $300), use responseType "conflict" and suggest which constraint to relax in conflictHint.
- If no inventory matches, use responseType "no_results" and provide an alternativeHint.
- Default to 3 suggestions per query (responseType "suggestions").
- Do not surface destinations the user recently visited (recent_destinations list below).

USER PROFILE:
- Name: ${user.display_name}
- Home airport: ${user.home_airport}
- MileagePlus tier: ${user.mileage_plus_tier}
- MileagePlus balance: ${user.mileage_balance} miles
- Travel style: ${prefs?.travelStyle ?? 'leisure'}
- Budget ceiling: $${prefs?.budgetCeilingUsd ?? 800} USD round trip
- Seat preference: ${prefs?.seatPreference ?? 'aisle'}
- Recently visited (deprioritize): ${(user.recent_destinations as string[])?.join(', ') || 'none'}

AVAILABLE INVENTORY (destinations + flights from ${user.home_airport}):
${JSON.stringify({ destinations, flights })}

RESPONSE CONTRACT -- return exactly this JSON shape, nothing else:
{
  "responseType": "suggestions" | "clarifying_question" | "no_results" | "conflict",
  "assistantMessage": "string shown as the chat bubble -- never empty",
  "rankingCriteria": "best_match" | "lowest_price" | "shortest_duration" | null,
  "suggestions": [
    {
      "destinationId": "IATA code matching a destination id above",
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
  "alternativeHint": "string or null"
}

For responseType "suggestions": include exactly 3 suggestions, exactly one with isBestValue true.
For other responseTypes: suggestions array must be empty [].`
}

// ─── OpenAI API Call ──────────────────────────────────────────────────────────

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

// ─── Response Validation ──────────────────────────────────────────────────────

function parseAndValidateResponse(
  rawText: string,
  destinations: Array<{ id: string }>
): TripPlannerResponse {
  // Strip markdown fences just in case
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

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
    }
  }

  // Ensure assistantMessage is never empty
  if (!parsed.assistantMessage?.trim()) {
    if (parsed.responseType === 'suggestions') {
      parsed.assistantMessage = "Here are some destinations that match your trip."
    } else {
      parsed.assistantMessage = "Let me help you find the right trip."
    }
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
        (minIdx, s, idx, arr) => (s.lowestFareUsd < arr[minIdx].lowestFareUsd ? idx : minIdx),
        0
      )
      parsed.suggestions[cheapestIdx].isBestValue = true
    } else if (bestCount > 1) {
      let found = false
      parsed.suggestions = parsed.suggestions.map((s) => {
        if (s.isBestValue && !found) { found = true; return s }
        return { ...s, isBestValue: false }
      })
    }
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
    }
  }

  return parsed
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { conversationId, userId, messageText } = await req.json()

    if (!conversationId || !userId || !messageText?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing conversationId, userId, or messageText' }),
        { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    // Service-role client -- bypasses RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch user profile
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      )
    }

    // Fetch conversation history (last 20 messages = ~10 turns)
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Fetch full inventory
    const { data: destinations } = await supabase.from('destinations').select('*')
    const { data: flights } = await supabase
      .from('flights')
      .select('*')
      .eq('origin_airport', user.home_airport)

    // Persist user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: messageText.trim(),
    })

    // Update conversation last_active_at
    await supabase
      .from('conversations')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', conversationId)

    // Build system prompt and call OpenAI
    const systemPrompt = buildSystemPrompt(user, destinations ?? [], flights ?? [])
    const rawText = await callOpenAI(systemPrompt, history ?? [], messageText.trim())

    // Validate and ground the response
    const structured = parseAndValidateResponse(rawText, destinations ?? [])

    // Persist assistant turn
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
      }),
      { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    )
  }
})
