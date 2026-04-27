# Progress

## Current Status

**Phases 1 to 8 merged to `main` across Tracks A, B, and C. Phase 9 polish and demo prep remain in progress.**

GitHub repo live at: https://github.com/dg3496/united-trip-planner
Team ownership: Dhruv on backend (Supabase), frontend team on React components.

## Frontend Track B Stock Check (2026-04-27)

Track B is the chat UI core workstream (`src/pages/Chat.tsx` and chat components).

- **Completed artifacts:** chat container mobile layout, message list scroll behavior, prompt chip UI, loading indicator rotation, and iOS keyboard offset handling in chat input.
- **Merge status:** `frontend-track-b` has been merged into `main`.
- **Remaining dependencies:** Phase 9 polish and final end-to-end demo validation.

## What Works

- **2026-04-27:** Project ideation, GTM strategy, PRD, and architectural documentation fully complete.
- **2026-04-27:** Vite + React + TS project bootstrapped with Tailwind CSS, Zustand, React Router 6, supabase-js, lucide-react, sonner. Node 20 via nvm.
- **2026-04-27:** Full directory structure created: `src/` (pages, components, lib, store, styles) and `supabase/` (functions, migrations, seed).
- **2026-04-27:** All shared types written (`src/lib/types.ts`) matching the structured response contract exactly.
- **2026-04-27:** Supabase client + Edge Function API wrapper written (`src/lib/supabase.ts`, `src/lib/api.ts`).
- **2026-04-27:** Zustand chat store written with optimistic user message rendering and lazy conversation creation (`src/store/chatStore.ts`).
- **2026-04-27:** All layout components written: MobileShell, TopBar, BottomNav.
- **2026-04-27:** All chat components written: MessageBubble, MessageList, DestinationCard, ExpandedFlightDetail, ChatInput, LoadingIndicator, ExamplePrompts.
- **2026-04-27:** Page stubs written with TODO comments for frontend team: Home, Chat, Booking.
- **2026-04-27:** chat-trip-planner Edge Function written with full orchestration: user fetch, history fetch, inventory fetch, system prompt build, model call, JSON validation + grounding, persistence, CORS.
- **2026-04-27:** SQL schema migration written (`supabase/migrations/001_schema.sql`) — all 6 tables, indexes, RLS disabled.
- **2026-04-27:** Seed data written (`supabase/seed/002_seed.sql`) — demo user, 9 destinations, flights for each. 15+ more destinations still needed.
- **2026-04-27:** Config files complete: tailwind.config.js, vercel.json, .env.example, .gitignore, CLAUDE.md, README.md.
- **2026-04-27:** GitHub repo created and initial commit pushed. Supabase MCP connected.
- **2026-04-27:** Memory Bank added to repo at `memory-bank/`.
- **2026-04-27:** Supabase schema applied via MCP (all 6 tables, indexes, RLS disabled).
- **2026-04-27:** Seed data applied: 1 demo user (Alex, Gold, EWR), 25 destinations across 6 regions, 70 flights from EWR (March 2026, $249-$1049 range).
- **2026-04-27:** chat-trip-planner Edge Function deployed (ACTIVE, JWT verify off for prototype).
- **2026-04-27:** Project URL and anon key confirmed. .env.example updated with real values.
- **2026-04-27:** Smoke test passed: all 25 destinations have flights, fares verified ($249 PHX to $1049 NRT).
- **2026-04-27:** Switched LLM from Anthropic Claude to Google Gemini Flash (gemini-2.0-flash) -- free tier, same JSON contract. Edge Function redeployed as version 2. Requires GEMINI_API_KEY secret (get free at aistudio.google.com/apikey).
- **2026-04-27:** Switched LLM from Gemini Flash to OpenAI gpt-4o-mini. Gemini had quota=0 on free tier account. OPENAI_API_KEY set in Supabase Vault. Edge Function redeployed as v12 (ACTIVE).
- **2026-04-27:** End-to-end smoke test PASSED. Query "Beach trip under $500 in March" returned responseType "suggestions" with 3 grounded cards: SJU $279 (Best Value, nonstop 270min), MBJ $419 (nonstop 250min), PHX $299 (nonstop 330min). assistantMessage populated. DB persistence confirmed. Backend is fully operational.

This section will be updated as features come online. Format going forward:

> **YYYY-MM-DD:** Feature X works end-to-end. Notes on caveats.

- **2026-04-27:** Track C (Phases 6 to 8 handoff) merged to `main` from `frontend-track-c`: expanded detail from seeded `flights`, booking at `/booking/:flightId`, price alerts with resolved or null `flight_id`.
- **2026-04-27:** Home screen (Phase 4) complete on `frontend-track-a`. Visually verified in browser at localhost:5173. Nav, CTA, featured destinations, and resume card all render correctly. Both `frontend` and `frontend-track-a` branches pushed to GitHub.
- **2026-04-27:** Chat core (Track B, Phase 5) merged to `main` from `frontend-track-b`.
- **2026-04-27:** Frontend quality polish pass merged on `main`: premium styling refinements across nav, chat, cards, expanded details, and booking, plus new `/alerts` page to resolve BottomNav dead-end.

## Build Checklist

Items grouped by build phase. Each item references the PRD requirement ID where applicable so traceability between the prototype and the spec is preserved.

### Phase 1: Project Scaffolding
- [ ] Vite + React + TypeScript project initialized with strict mode
- [ ] Tailwind CSS configured, mobile-first base styles set
- [ ] React Router 6 set up with routes: `/`, `/chat`, `/booking/:flightId`
- [ ] Zustand store for conversation state
- [ ] Supabase client initialized with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Mobile shell component (status bar, fixed top bar, bottom nav placeholder)
- [ ] Vercel project linked, env vars configured

### Phase 2: Supabase Backend
- [ ] Supabase project created
- [ ] `users` table created and seeded with one demo user (Gold tier, EWR home airport)
- [ ] `destinations` table created and seeded with 20 to 30 destinations
- [ ] `flights` table created and seeded with 3 to 5 flights per destination for March 2026 dates from EWR
- [ ] `conversations` table created
- [ ] `messages` table created with `metadata` JSONB column
- [ ] `price_alerts` table created with 90-day expiry default
- [ ] Indexes on `messages.conversation_id`, `flights.destination_id`, `flights.origin_airport`
- [ ] RLS disabled OR demo-user-scoped policies in place
- [x] `OPENAI_API_KEY` set as Supabase secret

### Phase 3: Edge Function
- [ ] `chat-trip-planner` Edge Function scaffolded
- [ ] CORS preflight handling
- [ ] Body parsing and input validation
- [ ] User profile + history + inventory fetch logic
- [ ] System prompt builder with persona, user profile, inventory blocks
- [x] OpenAI API call with conversation history passed via `messages`
- [x] JSON parsing and schema validation against the response contract
- [ ] Grounding validation: drop suggestions referencing unknown destinationIds (FR-022)
- [ ] Best Value normalization (exactly one suggestion marked, FR-025)
- [ ] User and assistant message persistence
- [x] Edge Function deployed and pingable from the frontend

### Phase 4: Home Screen (FR-001, FR-002, FR-003) — COMPLETE (2026-04-27, Track A)
- [x] United-branded header with logo / wordmark
- [x] "Not sure where to go?" banner with prominent CTA into chat (FR-003)
- [x] Bottom nav with a "Plan a Trip" tab (FR-002)
- [x] Tapping the banner OR the nav opens the chat with a new conversation
- [x] Resume card shown when active conversation exists in Zustand store
- [x] Featured destinations section (Cancun, Paris, Honolulu, Tokyo) — static, tap to start new trip
- [x] Fixed src/index.css (removed Vite default styles conflicting with MobileShell)

### Phase 5: Chat UI
- [ ] Welcome message rendered on first open with example prompts (FR-005)
- [ ] User can type a query in a text input (FR-007)
- [ ] User message bubbles render immediately on send (optimistic update)
- [ ] Loading indicator with contextual text shows while Edge Function is in flight (FR-021)
- [ ] Assistant message bubbles render the `assistantMessage` field
- [ ] Destination cards render below assistant message with: city, country, fare, dates, duration, "Why this matches" line, Best Value label where applicable (FR-016, FR-023, FR-025)
- [ ] Trade-off line renders on cards where present (FR-024)
- [ ] Ranking criteria subtitle renders above cards (FR-018)
- [ ] User can send follow-up messages on the same conversation (FR-011, FR-012)
- [ ] Conversation persists across navigation away and back within the session (FR-006)
- [ ] Conflicting-constraint case renders with conflict hint (FR-013)
- [ ] No-results case renders with alternative hint (FR-014)
- [ ] Vague-query clarifying-question case renders cleanly (FR-010)

### Phase 6: Expanded Flight Details (FR-019)
- [ ] Tapping a destination card expands to show: departure / return times, stops, aircraft type, fare class
- [ ] Expanded view has a clear "Book This Trip" CTA

### Phase 7: Booking Handoff
- [ ] "Book This Trip" navigates to `/booking/:flightId?conversationId=...` (FR-034)
- [ ] Booking confirmation screen pre-fills origin, destination, dates, fare class, passenger count from URL params and DB lookup (FR-035)
- [ ] User can edit dates and fare class on the booking screen (FR-036)
- [ ] "Confirm Booking" button shows a fake success state (no real payment)
- [ ] "Back to your trip planner" link returns to the chat (FR-037)

### Phase 8: Price Alerts (FR-038 through FR-042)
- [ ] "Notify Me if Price Drops" button on each destination card
- [ ] Tapping inserts a row into `price_alerts` with `expires_at = now() + 90 days`
- [ ] Confirmation toast shows "We'll let you know if the price drops"
- [ ] Alerts persist across reloads (FR-040, list view if time permits)

### Phase 9: Polish and Demo Prep
- [ ] Page transitions are smooth, no flash of unstyled content
- [ ] Loading states are tasteful (no jarring spinners)
- [ ] All copy reviewed for tone (calm, concise, no em dashes)
- [ ] Color palette matches United (navy, white, restrained accent colors)
- [ ] Tested on iPhone 14 viewport (390px wide) in Chrome DevTools and on a real phone
- [ ] Edge Function warmed before demo to avoid cold start latency on first message
- [ ] Demo script written: 4 to 5 talking points mapped to specific clicks
- [ ] Backup plan in place if OpenAI API has a hiccup mid-demo (e.g., a recorded video as fallback)
- [ ] Public URL deployed and shared with the team
- [ ] Short recorded video tour created (assignment deliverable)

## What's Not in Scope for the Prototype

These are real PRD requirements that are explicitly **deferred from the prototype build**. Document this clearly so the demo presentation doesn't overpromise.

- **Voice input (FR-008).** Out of scope per the original brief.
- **Search abandonment trigger (FR-004).** Hard to demo without a separate standard search flow. Home screen banner + bottom nav are sufficient entry points for the demo.
- **Side-by-side comparison (FR-026).** Marked Should Have in PRD; cut for prototype scope.
- **Time-sensitive flags on cards like "Only 4 seats left" (FR-027).** Should Have; cut unless time permits at the very end.
- **Recent-destination filtering (FR-030).** Recent destinations are seeded on the user but the prototype's prompt logic does not strictly enforce this. Mention as future work.
- **Settings screen for preferences (FR-031).** The demo user's preferences are static. No settings UI in the prototype.
- **Seat availability alerts (FR-043 through FR-047).** Entirely deferred. Only price drop alerts in the prototype.
- **Real authentication.** Hardcoded demo user only.
- **Real payment processing.** Booking confirmation is faked.
- **Real flight inventory.** All seeded.
- **Production fallback to curated destinations (NFR-07).** The prototype shows a retry toast on model failure; the production architecture has a richer fallback path.
- **Conversation deletion (NFR-04).** Not exposed in the prototype UI.
- **Push notifications.** Price alerts persist to DB but no notifications fire. No background worker / cron job.
- **Output Guardrail service, separate Destination Metadata Service, Query Cache, Local Session Tracker, Feature flag platform.** All folded or omitted per `systemPatterns.md`.
- **End-to-end latency optimizations** (caching, concurrent fetching). Not needed at single-user demo volume.

## Known Issues and Blockers

None yet. Update as they appear. Common categories to watch:

- **Integration with live United Airlines APIs is not available** and never will be for this project. Relies entirely on seeded inventory.
- **Strict 5-second latency requirement** in production specs requires highly optimized prompts; in the prototype, the smaller scale and simpler prompt should keep us comfortably under the threshold. Watch as conversation history grows.
- **Model returning malformed JSON.** Mitigate via strict response formatting plus defensive parsing and fallback handling.
- **Latency creeping above 5 seconds during refinement turns** when conversation history grows. Mitigate by capping history at 10 turns when constructing the messages array.
- **Mobile Safari rendering quirks** on the fixed bottom input bar (keyboard pushing layout). Test early.
- **Edge Function cold starts** on the first message of the demo. Pre-warm before going live.
- **Tailwind purging classes** that are dynamically generated. Use the safelist if any class names are constructed at runtime.

## Evolution of Project Decisions

This section tracks decisions that have changed materially since the PRD was approved. None yet. Future entries should follow this format:

> **YYYY-MM-DD:** Changed X from A to B because Y. Impact: ...

## Demo Readiness Gate

The prototype is "demo ready" when **all** of the following are true:

1. A user can open the URL on a phone, tap into the chat from the home screen, type "beach trip under $500 in March," and see 3 cards within 5 seconds.
2. One of those cards is labeled Best Value with a sensible "Why this matches" line.
3. The user can type "nonstop only" and see the results filter or update appropriately.
4. The user can tap a card, see the expanded view, tap "Book This Trip," and land on a pre-filled booking confirmation.
5. The user can tap "Notify Me if Price Drops" and see a confirmation toast.
6. None of the above hits a hard error in front of the audience.

When all six are stable on a real phone over a real network, the prototype is shipped.
