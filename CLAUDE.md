# United Airlines AI Trip Planner

Columbia Business School PM Final Project. Prototype of a conversational AI trip planner.

## Quick start

```bash
# Requires Node >=20. If using nvm: nvm use 20
cp .env.example .env.local   # fill in Supabase URL, anon key, demo user id
npm install
npm run dev                  # http://localhost:5173
```

## Team ownership

| Area | Owner | Key directories |
|---|---|---|
| Supabase Edge Function | Dhruv | `supabase/functions/chat-trip-planner/` |
| Database schema + seed | Dhruv | `supabase/migrations/`, `supabase/seed/` |
| Frontend pages + components | Frontend team | `src/pages/`, `src/components/` |
| Shared types + API client | Shared | `src/lib/`, `src/store/` |

## Architecture in one paragraph

React SPA (Vite + TS + Tailwind) calls a Supabase Edge Function (`chat-trip-planner`) on every chat message. The Edge Function fetches the demo user's profile and the full flight inventory from Supabase Postgres, builds a system prompt, calls OpenAI `gpt-4o-mini` with the conversation history, validates the structured JSON response against the inventory (grounding), persists both the user and assistant turns, and returns the payload to the frontend. The frontend renders destination cards from the structured payload.

## Shared contracts

All types that cross the frontend/backend boundary live in `src/lib/types.ts`. Do not change `TripPlannerResponse` or `Suggestion` without coordinating — the Edge Function and the card renderer both depend on this shape.

## Environment variables

Frontend needs (`.env.local`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DEMO_USER_ID`

Edge Function needs (set via Supabase dashboard > Settings > Edge Functions > Secrets):
- `OPENAI_API_KEY`  — get a key at https://platform.openai.com/account/api-keys

## Supabase setup

```bash
# Install CLI
brew install supabase/tap/supabase
supabase init
supabase login
supabase link --project-ref <ref>

# Run schema + seed in Supabase SQL Editor, or:
supabase db push

# Deploy Edge Function
supabase functions deploy chat-trip-planner
supabase secrets set OPENAI_API_KEY=sk-...
```

## Deploy frontend

Connect the repo to Vercel. Set the three `VITE_*` env vars in Vercel project settings. Vite builds to `dist/` — Vercel picks this up automatically.

## Design decisions (do not relitigate without a conversation)

- Hardcoded demo user, no real auth
- Cash bookings only, no miles+cash UI
- Seeded fake inventory (not real flights)
- OpenAI gpt-4o-mini is called server-side only (Edge Function), never from the browser
- Structured JSON output from the model (not free-form text)
- Exactly 3 suggestions per query; exactly 1 marked Best Value
- Conversation history capped at 20 rows (~10 turns) when passed to the model
- No em dashes anywhere in the UI or in the system prompt

## Deferred from prototype

Voice input, real auth, real payment, side-by-side comparison, seat availability alerts, push notifications. See `progress.md` for the full list.
