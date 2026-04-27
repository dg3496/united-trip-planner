# System Patterns and Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React + Vite + TS frontend (mobile-first, Tailwind)    │
│  - Home screen (banner entry point)                     │
│  - Chat UI (messages, cards, expanded card, booking)    │
│  - Local session state (Zustand or React Context)       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS (supabase-js client)
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase                                               │
│  ├── Postgres (users, conversations, messages,          │
│  │              destinations, flights, price_alerts)    │
│  ├── Edge Functions (Deno runtime)                      │
│  │   └── /chat-trip-planner  ← orchestration entry      │
│  └── Auth (used minimally; hardcoded demo user)         │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
                           ▼
                    OpenAI Chat Completions API
                       (gpt-4o-mini)
```

The Edge Function is the **orchestration layer** described in Architecture doc §2. In the production architecture this would also call a Flight Inventory API and a MileagePlus Member Service. In the prototype, both are replaced by direct Postgres queries against the seeded `flights`/`destinations` tables and the `users` table.

## Client / Server Architecture

### 1. Client Layer (React)

- **UI Module:** A responsive chat module accessible via a home screen banner (FR-003) and bottom navigation bar (FR-002). The behavioral search-abandonment trigger (FR-004) is in the production architecture but deferred from the prototype.
- **State Management:** Conversation state is maintained locally with Zustand (preferred) or React Context for the duration of the session so users can navigate away and return (FR-006).
- **Constraint:** The client does not run any AI inference locally. It only communicates with the backend by invoking the Supabase Edge Function over HTTPS.

### 2. Backend Layer (Supabase)

- **Auth:** Supabase Auth would validate MileagePlus session tokens in production; in the prototype, a hardcoded demo user ID is used and auth is effectively bypassed.
- **AI Orchestration Service (Supabase Edge Function):** The central nervous system. When a message arrives:
  1. Fetches user profile, conversation history, and inventory from Postgres.
  2. Builds the system prompt with persona, profile, and inventory context.
  3. Calls OpenAI `gpt-4o-mini` with the conversation history.
  4. Validates the structured JSON response, persists the new turn, and returns the payload to the client.
- **Conversation Store (Supabase Postgres):** Persists conversation history, user preferences, price alert subscriptions, and seeded inventory. Postgres is preferred over DynamoDB for richer query support, per Architecture doc §2.
- **Price Alert Service:** In production this is a background worker that monitors fares and triggers push notifications. In the prototype, alerts persist to the database but no notifications fire.

## End-to-End Request Flow

For each user message:

1. **Frontend** appends the user's message to local conversation state and renders it immediately. Calls `POST /functions/v1/chat-trip-planner` with `{ conversationId, userId, messageText }`.
2. **Edge Function** fetches:
   - The user's profile from `users` (home airport, MileagePlus tier, preferences, recent destinations).
   - The conversation history from `messages` (last ~10 turns).
   - A relevant slice of the `destinations` + `flights` inventory. For the prototype, pass all ~20 to 30 seeded destinations into the prompt; volume is small enough that no retrieval logic is needed.
3. **Edge Function** assembles a single OpenAI API call:
   - System prompt with persona, rules, and the inventory + user profile.
   - User messages from history + the new user message.
   - `max_tokens` ~1500, model `gpt-4o-mini`, with `response_format: { type: "json_object" }`.
4. **OpenAI** returns structured JSON (see "LLM Response Contract" below).
5. **Edge Function** validates the JSON shape, persists the assistant turn to `messages`, and returns the payload to the frontend.
6. **Frontend** renders message bubble + destination cards. Spinner is shown during the round trip with contextual loading text (FR-021).

Latency target end-to-end: under 5 seconds (NFR-01, FR-020). With `gpt-4o-mini` typically responding in a few seconds, the budget allows for limited orchestration overhead, which is workable since inventory fetch is a single Postgres query.

## LLM Response Contract

The Edge Function instructs the model to respond **only** with a JSON object matching this shape. No prose outside the JSON, no markdown fences.

```json
{
  "responseType": "suggestions" | "clarifying_question" | "no_results" | "conflict",
  "assistantMessage": "string (shown as the chat bubble above any cards)",
  "rankingCriteria": "best_match" | "lowest_price" | "shortest_duration" | null,
  "suggestions": [
    {
      "destinationId": "string (matches destinations.id)",
      "city": "string",
      "country": "string",
      "whyThisMatches": "string (FR-023)",
      "tradeOff": "string or null (FR-024)",
      "isBestValue": true | false,
      "lowestFareUsd": 389,
      "outboundDate": "2026-03-14",
      "returnDate": "2026-03-21",
      "flightDurationMinutes": 245,
      "stops": 0
    }
  ],
  "conflictHint": "string or null (FR-013, which constraint to relax)",
  "alternativeHint": "string or null (FR-014, e.g., 'Try April instead of March')"
}
```

Rules:
- `responseType: "suggestions"` returns 3 cards (default per FR-015).
- `responseType: "clarifying_question"` returns 0 cards and uses `assistantMessage` to ask the user a single follow-up (FR-010).
- `responseType: "no_results"` returns 0 cards, uses `assistantMessage`, and populates `alternativeHint` (FR-014).
- `responseType: "conflict"` returns 0 cards, uses `assistantMessage`, and populates `conflictHint` (FR-013).
- Exactly one suggestion in a `suggestions` array must have `isBestValue: true` (FR-025).
- Every `destinationId` MUST exist in the seeded `destinations` table. The Edge Function validates this and falls back to a "no_results" response if the model hallucinates (FR-022 grounding requirement).

## System Prompt Structure (LLM)

The Edge Function builds the system prompt from three blocks, concatenated:

1. **Persona and rules block** (static)
   - "You are the United Airlines AI Trip Planner..."
   - Tone: helpful, concise, calm. No em dashes.
   - Always returns valid JSON only, no markdown fences, no prose.
   - Only suggests destinations from the inventory provided.
   - Always includes a "Why this matches" tied to user preferences (FR-023).
   - Labels exactly one suggestion as Best Value when returning suggestions (FR-025).
   - Asks a clarifying question if the query is too vague to filter inventory meaningfully (FR-010).
   - Identifies conflicts and suggests which constraint to relax (FR-013).

2. **User profile block** (per request)
   - Home airport, MileagePlus tier, stated preferences, destinations visited in past 6 months (so they can be deprioritized per FR-030).

3. **Inventory block** (per request)
   - The seeded destinations + their cheapest available round-trip fares for the demo date window. Compact JSON, not prose.

The conversation history is passed through the `messages` array of the OpenAI chat completions call, not in the system prompt.

## Frontend Component Structure

```
src/
├── App.tsx                    # Routing shell
├── pages/
│   ├── Home.tsx               # United-branded home screen + entry banner
│   ├── Chat.tsx               # Chat UI container
│   └── Booking.tsx            # Pre-filled booking confirmation
├── components/
│   ├── chat/
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── DestinationCard.tsx       # Compact card with Best Value label
│   │   ├── ExpandedFlightDetail.tsx  # FR-019 expanded view
│   │   ├── ChatInput.tsx
│   │   ├── LoadingIndicator.tsx       # FR-021 contextual loading text
│   │   └── ExamplePrompts.tsx         # FR-005 welcome prompts
│   ├── layout/
│   │   ├── MobileShell.tsx            # Phone-frame container, status bar
│   │   ├── TopBar.tsx
│   │   └── BottomNav.tsx              # FR-002 nav entry point
│   └── ui/
│       └── Toast.tsx                  # FR-038 confirmation toast
├── lib/
│   ├── supabase.ts                    # supabase-js client init
│   ├── api.ts                         # Wrapper for Edge Function call
│   └── types.ts                       # Shared TS types matching response contract
├── store/
│   └── chatStore.ts                   # Zustand store for conversation state
└── styles/
    └── tailwind.css
```

## Design Patterns

- **LLM Context Injection.** The orchestration layer provides structured context (user profile, live inventory results) directly in the system prompt to ground responses and prevent hallucination.
- **Optimistic User Message Rendering.** User's message appears in the bubble list immediately on send, before the Edge Function returns. Loading indicator follows.
- **Single Source of Truth for Conversation State.** The Zustand store holds the current conversation; on initial chat open, it hydrates from Supabase using the active `conversationId`. Page reloads should be safe (FR-006).
- **Conversation Creation on First Message.** A new `conversation` row is inserted lazily when the user sends the first message of a session, not when the chat UI opens.
- **Refinement Messages Reuse the Same `conversationId`.** No separate "filter" or "refine" code path. Every user input is just another message; the model maintains intent through the message history (FR-011, FR-012).
- **Booking Handoff via Deep Link.** Tapping "Book This Trip" navigates to `/booking/:flightId?conversationId=...` so the booking screen has full context and can pre-fill (FR-035). A "Back to your trip planner" link returns to the chat (FR-037).
- **Fallback / Circuit Breaker.** If the model exceeds latency caps or errors out, the system shows a retry toast. The production architecture (NFR-07) specifies degrading gracefully to cached popular destinations; the prototype simplifies this to a retry message.

## Error Handling and Fallbacks

| Failure | Behavior |
|---|---|
| Model API error or timeout | Show a toast: "I'm having trouble right now. Please try again." Do not crash the chat. |
| Model returns invalid JSON | Edge Function logs the raw output, returns a generic "Let me try that again" message to the client, does not persist a malformed assistant turn. |
| Model hallucinates a destination not in inventory | Edge Function strips the unknown destinations from the suggestions array. If 0 valid suggestions remain, returns a synthetic "no_results" response. |
| Supabase Edge Function unreachable | Frontend shows a toast and disables the input briefly. |
| User sends empty message | Disabled at input layer; send button is grayed out until the input has at least one non-whitespace character. |

## Persistence Patterns

- All assistant turns and user turns persist as rows in `messages`. The `metadata` JSONB column on assistant messages stores the full structured model response so the cards can re-render on reload.
- Price alerts (FR-038) persist in `price_alerts` with `user_id`, `destination_id`, `flight_id`, `threshold_fare_usd`, `created_at`, `expires_at` (90 days from creation per FR-041). For the prototype, no background job actually fires alerts; this is purely instrumentation to demonstrate the data model.
- The `users` table is read-mostly. The demo user is seeded once and not modified during a session.

## Mobile-First Patterns

- Default viewport is 390px wide (iPhone 14). Tailwind's `sm:` breakpoint is treated as "tablet/desktop"; everything below `sm:` is the demo target.
- The chat shell occupies the full viewport with a fixed top bar and a fixed input bar at the bottom. The message list scrolls between them.
- Destination cards are full-width within the message column with a stacked layout (image header, title, fare, why-this-matches, action button).
- Tap targets are minimum 44px tall.
- No hover states; all interactivity is tap-driven.

## What's Deliberately Not in the Architecture

These are real components in the production architecture (per Architecture doc §2 and §5) that we are **not** building in the prototype, to keep scope tight:

- API Gateway with auth and rate limiting (Supabase handles this at the platform level for the demo).
- Output Guardrail service as a separate component (folded into the Edge Function's JSON validation step).
- Push Notification Service / Email Service (price alerts persist but don't actually fire).
- Destination Metadata Service as a separate microservice (flat-baked into the seeded `destinations` table).
- Feature flag / experimentation platform (no A/B testing in the prototype).
- Local Session Tracker for behavioral GTM triggers (the prototype uses only the static home screen banner and bottom nav).
- Query cache layer in Redis (not needed at prototype volume).
- Price Alert background worker (rows persist but no fares are monitored).
