# Technical Context

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React 18 + Vite + TypeScript | Vite for fast dev cycles; TS strict mode on |
| Styling | Tailwind CSS 3.x | Mobile-first, utility-first. No CSS modules |
| State management | Zustand (preferred) or React Context | Lightweight; no Redux needed at this scope |
| Routing | React Router 6 | `/`, `/chat`, `/booking/:flightId` |
| HTTP / DB client | `@supabase/supabase-js` | Used for both DB queries and invoking Edge Functions |
| Backend platform | Supabase | Postgres + Edge Functions (Deno) + Auth |
| LLM | OpenAI gpt-4o-mini | Low cost. Called from Edge Function only, never from frontend |
| Hosting | Vercel (recommended) or Netlify | Static frontend; Supabase hosts Edge Functions |
| Icons | `lucide-react` | Lightweight, matches a clean airline aesthetic |
| Toast notifications | `sonner` | Used for "Price alert set" confirmation (FR-038) |

## Why Supabase over a Custom Backend

- All-in-one: Postgres + Edge Functions + Auth in one platform, no separate hosting concerns for the prototype.
- Edge Functions run Deno with TypeScript natively, so the orchestration logic stays in TS.
- Free tier is sufficient for a class demo.
- Postgres (not DynamoDB) matches Architecture doc §2's stated preference for richer query support.

## Why OpenAI gpt-4o-mini

- Low cost per token, well within demo budget.
- Reliable structured JSON output via `response_format: { type: 'json_object' }`.
- Latency is fast enough for the 5-second NFR budget.
- Straightforward REST API callable from a Deno Edge Function.
- Model: `gpt-4o-mini`. Secret name: `OPENAI_API_KEY` (set in Supabase Vault).
- Role names are `"user"`, `"assistant"`, and `"system"` -- matching the DB schema directly, no mapping needed.

Note: Gemini Flash was the original choice (free tier) but had quota=0 on the project's account. OpenAI was substituted with identical JSON contract -- no frontend changes required.

## Third-Party APIs and Integrations (Production vs Prototype)

| API / Integration | Production Role | Prototype Substitute |
|---|---|---|
| United Flight Inventory and Pricing API (internal) | Real-time flight availability, fares, seat maps | Direct Postgres query against the seeded `flights` table |
| MileagePlus Member Service (internal) | User tier, balance, home airport, travel history | Direct Postgres query against the seeded `users` table |
| Destination Metadata Service | Climate, activities, imagery | Flat-baked into the seeded `destinations` table |
| LLM Provider | OpenAI GPT-4o, Anthropic Claude, or fine-tuned internal | OpenAI `gpt-4o-mini` via Chat Completions |
| Push Notification Service (FCM/APNs) | Fires price drop alerts | Alerts persist to DB but no notifications fire |

## Performance Constraints (from production spec)

- **Throughput target:** ~500,000 monthly active trip planner users. Roughly 100,000 messages/day. Peak traffic ~50,000 messages/hour (14 messages/second).
- **Latency:** Strict p95 latency ceiling of 5 seconds end-to-end (NFR-01). The LLM call must execute in under 2 seconds.
- **Storage:** ~72 GB/year for conversation logs, ~2.5 GB for user profiles, ~110 MB for active price alerts. Supabase Postgres comfortably handles this.
- **Compliance:** Full CCPA and GDPR compliance for conversation data (NFR-03, NFR-04, NFR-05).

These targets describe the production system. The prototype is not load-tested; it just needs to feel responsive in a single-user demo.

## Environment Variables

Frontend (`.env.local`, prefixed with `VITE_`):
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<public anon key>
VITE_DEMO_USER_ID=<uuid of the seeded demo user>
```

Supabase Edge Function secrets (set via Supabase dashboard > Settings > Edge Functions > Secrets):
```
OPENAI_API_KEY=<server-side only, never exposed to frontend>
```

Never put `OPENAI_API_KEY` in the frontend env. The Edge Function is the only thing that should ever see it.

## Supabase Database Schema

All IDs are `uuid` with `gen_random_uuid()` defaults unless noted. All timestamps are `timestamptz` with `now()` defaults.

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Hardcoded UUID for demo user |
| `email` | text | "demo.user@example.com" |
| `display_name` | text | "Demo User" |
| `home_airport` | text | "EWR" |
| `mileage_plus_tier` | text | One of: "general", "silver", "gold", "platinum", "1k". Demo user is "gold" |
| `mileage_balance` | integer | e.g. 87500 |
| `preferences` | jsonb | `{ travelStyle: "leisure", budgetCeilingUsd: 800, blackoutDates: [], seatPreference: "aisle" }` |
| `recent_destinations` | text[] | IATA codes visited in past 6 months, drives FR-030 |
| `created_at` | timestamptz | |

### `conversations`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK -> users.id | |
| `started_at` | timestamptz | |
| `last_active_at` | timestamptz | Updated on each new message |

### `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `conversation_id` | uuid FK -> conversations.id | Indexed |
| `role` | text | "user" or "assistant" |
| `content` | text | The text message |
| `metadata` | jsonb | For assistant messages, the full structured model response so cards can re-render on reload |
| `created_at` | timestamptz | |

### `destinations`
| Column | Type | Notes |
|---|---|---|
| `id` | text PK | Use IATA airport code, e.g. "CUN", "MIA", "SJU" |
| `city` | text | "Cancun" |
| `country` | text | "Mexico" |
| `region` | text | "Caribbean", "Europe", "Asia", etc. |
| `tags` | text[] | `['beach','warm','budget-friendly']` used for matching |
| `description` | text | One-sentence summary used by the model in `whyThisMatches` synthesis |
| `image_url` | text | Stock image URL (Unsplash or similar) for the card header |
| `popular_from_hubs` | text[] | Hub IATA codes where this is popular (`['EWR','ORD','SFO']`) |

### `flights`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `destination_id` | text FK -> destinations.id | |
| `origin_airport` | text | "EWR" |
| `outbound_date` | date | |
| `return_date` | date | |
| `outbound_duration_minutes` | integer | |
| `return_duration_minutes` | integer | |
| `stops` | integer | 0 = nonstop, 1 = one stop |
| `fare_class` | text | "economy", "economy_plus", "business" |
| `fare_usd` | integer | Round-trip total in USD |
| `seats_available` | integer | Used for FR-027 if surfaced |
| `aircraft_type` | text | e.g., "Boeing 737-800" for the expanded view (FR-019) |

### `price_alerts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK -> users.id | |
| `destination_id` | text FK -> destinations.id | |
| `flight_id` | uuid FK -> flights.id | The specific flight the alert is anchored to |
| `threshold_fare_usd` | integer | Snapshot of the fare at alert creation |
| `status` | text | "active", "fired", "expired" (defaults to "active") |
| `created_at` | timestamptz | |
| `expires_at` | timestamptz | `created_at + interval '90 days'` per FR-041 |

### Seed Data Targets

- **1 demo user** with EWR home airport, Gold tier, leisure preferences.
- **20 to 30 destinations** across regions: Caribbean (CUN, MIA, SJU, NAS), Europe (LIS, BCN, ROM, LON), warm domestic (LAX, SAN, PHX), cold/scenic (DEN, SEA, ANC), Latin America (CDMX, BOG, MEX), Asia (NRT, HKG), each with a believable description, tags, and stock image.
- **3 to 5 flights per destination** spanning early-to-late March 2026 (or May to July 2026 if reseeded for freshness), with a mix of nonstop and 1-stop options, with realistic round-trip fares ($300 to $1200 range).
- **0 seeded conversations or messages.** Created at runtime.
- **0 seeded price alerts.** Created at runtime.

## Edge Function Structure

Single function: `supabase/functions/chat-trip-planner/index.ts`

```ts
serve(async (req) => {
  // 1. CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // 2. Parse body
  const { conversationId, userId, messageText } = await req.json();

  // 3. Initialize service-role Supabase client (server-side)
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 4. Fetch user profile
  const { data: user } = await supabase.from("users").select("*").eq("id", userId).single();

  // 5. Fetch conversation history (last 10 messages)
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  // 6. Fetch full inventory (small enough to send wholesale)
  const { data: destinations } = await supabase.from("destinations").select("*");
  const { data: flights } = await supabase
    .from("flights")
    .select("*")
    .eq("origin_airport", user.home_airport);

  // 7. Persist the new user message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: messageText,
  });

  // 8. Build system prompt with persona + user profile + inventory
  const systemPrompt = buildSystemPrompt(user, destinations, flights);

  // 9. Call OpenAI
  const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")!}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: "user", content: messageText },
      ],
    }),
  });

  // 10. Extract and validate JSON
  const openAiJson = await openAiResponse.json();
  const rawText = openAiJson.choices[0].message.content;
  const structured = parseAndValidateModelResponse(rawText, destinations);

  // 11. Persist assistant turn with full structured payload in metadata
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: structured.assistantMessage,
    metadata: structured,
  });

  // 12. Return to client
  return new Response(JSON.stringify(structured), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
```

Key implementation notes:
- Use the Supabase **service role key** in the Edge Function, not the anon key, so RLS doesn't block the inserts. Never expose this to the frontend.
- `parseAndValidateModelResponse` parses JSON, validates that every `destinationId` exists in the inventory (FR-022 grounding), and falls back to a "no_results" synthetic response if validation fails entirely.
- Don't trust the model to return exactly one Best Value. If multiple come back marked, keep only the first; if none, mark the cheapest. The frontend should never see ambiguous data.

## Row-Level Security (RLS) Policy

For the prototype, RLS can be disabled on all tables for simplicity since the only actor is the demo user and the Edge Function uses the service role key. If RLS is enabled, the only policy needed is "users can read/write rows where `user_id = auth.uid()`" on `conversations`, `messages`, `price_alerts`. The frontend uses the anon key so this matters only if the frontend queries those tables directly.

## Local Development Setup

```bash
# Frontend
npm create vite@latest united-trip-planner -- --template react-ts
cd united-trip-planner
npm install
npm install @supabase/supabase-js zustand react-router-dom lucide-react sonner
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Supabase CLI (for Edge Functions and migrations)
brew install supabase/tap/supabase   # macOS
supabase init
supabase login
supabase link --project-ref <ref>
supabase functions new chat-trip-planner

# Run frontend
npm run dev    # serves on http://localhost:5173

# Deploy Edge Function
supabase functions deploy chat-trip-planner
supabase secrets set OPENAI_API_KEY=sk-...
```

## Build and Deploy

- **Frontend:** deploy to Vercel via the Vercel CLI or GitHub integration. Vite builds to `dist/`. Set the three `VITE_*` env vars in Vercel project settings.
- **Edge Function:** deployed via `supabase functions deploy chat-trip-planner` to the Supabase project. The function URL is `https://<project-ref>.supabase.co/functions/v1/chat-trip-planner`.

## Constraints

- **OpenAI API rate limits.** Not a real concern at demo volume, but be aware that aggressive testing could hit per-minute token limits.
- **Edge Function cold starts.** Supabase Edge Functions can have ~500ms cold start. The first message in a fresh demo will be slower. Hit the function once before going on stage to warm it.
- **No streaming in v1.** The Edge Function returns the full model response after generation completes. Streaming would improve perceived latency but adds complexity not justified for a 5-minute demo.
- **No retry logic on model failures.** If generation fails, the user sees an error toast and retypes. Adding retries inside the Edge Function risks blowing the 5-second SLA.

## Documentation References for the Build Agent

- OpenAI Chat Completions API: https://platform.openai.com/docs/api-reference/chat/create
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase JS client: https://supabase.com/docs/reference/javascript/introduction
- Vite + React + TS: https://vitejs.dev/guide/
- Tailwind CSS: https://tailwindcss.com/docs

When in doubt about an API surface (OpenAI models, Supabase syntax), read the docs rather than guessing. Both OpenAI and Supabase have evolving APIs.
