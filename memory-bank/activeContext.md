# Active Context

## Current Focus

**Frontend (Abhinav) and Backend (Dhruv) running in parallel.**
Backend is largely deployed — Edge Function is ACTIVE. Frontend Track A is complete; Track B (chat UI) and Track C (cards, booking, alerts) are merged to `main`.

GitHub repo: https://github.com/dg3496/united-trip-planner
Active branch: `frontend`
Supabase project ref: jexqrbxpgxnmwxgkyinn

---

## Backend Status (Dhruv — Track B Backend)

1. ~~Apply schema migration via MCP~~ **DONE**
2. ~~Seed demo user + destinations + flights~~ **DONE** (25 destinations, 70 flights)
3. Set API key secret — **PENDING** (add via Supabase dashboard > Settings > Edge Functions > Secrets)
4. ~~Deploy chat-trip-planner Edge Function~~ **DONE** (ACTIVE)
5. ~~Get project URL + anon key for .env.local~~ **DONE** (values in .env.example)

**Frontend team action required:** Copy `.env.example` to `.env.local` and fill in the real values, then run `npm run dev` to connect to the live backend.

---

## Frontend Team Split (3 Parallel Tracks)

All three tracks work off the `frontend` branch. Each person commits to their own sub-branch (`frontend-track-a`, `frontend-track-b`, `frontend-track-c`) and opens a PR into `frontend` when done. Merge order: B first (chat core), then A and C, then `frontend` → `main`.

---

### Track A — Home Screen + Polish + Deploy ✅ COMPLETE
**Assigned to:** Abhinav
**Branch:** `frontend-track-a` (merged into `frontend` and `main`)
**Stack:** React + Vite + TypeScript + Tailwind (no Next.js, no Vercel)

Delivered:
- Full United-branded home screen: TopBar, hero, "Not sure where to go?" CTA (FR-001, FR-003), BottomNav (FR-002)
- Resume card when active conversation exists in Zustand store
- Featured destinations section (static, tap starts new trip)
- Fixed `src/index.css` (Vite default conflicts removed)
- `design.md` — full UI design reference for Tracks B and C

---

### Track B — Chat UI Core ✅ MERGED TO `main`
**Files:** `src/pages/Chat.tsx`, `src/components/chat/MessageList.tsx`, `src/components/chat/ChatInput.tsx`, `src/components/chat/ExamplePrompts.tsx`, `src/components/chat/LoadingIndicator.tsx`
**Phases:** 5 (main chat flow)

Deliverables:
- `Chat.tsx` — confirm TopBar + MessageList + ChatInput + BottomNav layout is correct and full-height on mobile
- `MessageList.tsx` — welcome state with ExamplePrompts when empty (FR-005), auto-scroll to bottom on new messages, LoadingIndicator at bottom while isLoading
- `ChatInput.tsx` — textarea send on Enter (Shift+Enter for newline), disabled while loading or empty, auto-focus on mount, iOS visual viewport resize handling for keyboard push
- `ExamplePrompts.tsx` — 3 to 4 tap-to-send example prompts styled as pill chips (FR-005)
- `LoadingIndicator.tsx` — animated indicator with contextual copy like "Finding trips for you..." (FR-021)
- `MessageBubble.tsx` — already complete; review conflict/no-results hints (FR-013, FR-014)

Note: `DestinationCard` rendering inside `MessageBubble` is Track C's responsibility.

---

### Track C — Destination Cards + Booking + Price Alerts ✅ MERGED TO `main`
**Files:** `src/components/chat/DestinationCard.tsx`, `src/components/chat/ExpandedFlightDetail.tsx`, `src/pages/Booking.tsx`
**Phases:** 6 + 7 + 8

Deliverables:
- `DestinationCard.tsx` — full card: city, country, fare (USD), dates, flight duration, stops, "Why this matches" (FR-023), Best Value badge (FR-025), trade-off line (FR-024), "Notify Me if Price Drops" (FR-038); resolves cheapest flight for `price_alerts.flight_id` when present
- `ExpandedFlightDetail.tsx` — expand in-card panel: departure/return times (demo clocks from dates), stops, aircraft type, fare class from DB row, "Book This Trip" to `/booking/:flightId` with query params (FR-019)
- `Booking.tsx` — fare class selector, passenger count fixed at 1, Confirm Booking fake success + toast, "Back to your trip planner" link (FR-034 to FR-037)
- Price alerts: `setPriceAlert` inserts `price_alerts` with `expires_at` +90 days and `toast.success` (FR-038 to FR-040); helpers in `src/lib/api.ts`: `getCheapestFlightForDestination`, `getDestinationById`

---

## Recent Changes

- **2026-04-27:** Track C merged to `main` from `frontend-track-c` (booking route `/booking/:flightId`, expanded detail from seeded flights, price alerts with optional `flight_id`).
- **2026-04-27:** Track A complete and merged to `main`. Home screen, `design.md`, `index.css` reset all shipped.
- **2026-04-27:** Backend (Dhruv): schema migration and seed applied (25 destinations, 70 flights). Edge Function deployed and ACTIVE. `.env.example` updated with real Supabase values.
- **2026-04-27:** `frontend` branch created. 3-track parallel build structure established.
- **2026-04-27:** Memory Bank added to GitHub repo at `memory-bank/`.
- **2026-04-27:** Team split established: Dhruv owns `supabase/`, frontend team owns `src/pages/` and `src/components/`.

## Previously Recorded Changes

- Migrated product specification, architecture, and business model requirements from source documents into the Memory Bank.
- Decided on React + Vite + TypeScript + Supabase + Anthropic Claude as the prototype stack.
- Decided to use a hardcoded demo user with full-bypass auth, rather than implementing real Supabase Auth flows.

## Key Decisions Already Made

These are settled. Do not relitigate without explicit input.

- **Tech stack:** React + Vite + TypeScript on the frontend, Tailwind CSS for styling, Supabase for the entire backend (Postgres, Edge Functions, Auth). LLM is Anthropic Claude API called from a Supabase Edge Function.
- **Mobile-first web app**, not a native app. Should look and feel like the United mobile app when viewed in a phone-sized viewport. Desktop is a secondary consideration but should not be broken.
- **Hardcoded demo user**, not real auth. A single seeded MileagePlus profile (Premier Gold tier, EWR home airport, sample preferences and travel history) drives all personalization.
- **Cash bookings only**, no miles+cash UI in the prototype (matches PRD §7.2 v1 scope).
- **Seeded fake inventory**, not real flight data. The Supabase `destinations` and `flights` tables hold 25 destinations with believable round-trip fares from EWR.
- **Claude is the entire AI layer.** No fine-tuning, no RAG over external sources. The Edge Function passes the user profile and the relevant slice of seeded inventory directly into the system prompt so Claude returns grounded results.
- **Structured JSON output from Claude**, not free-form text. The Edge Function instructs Claude to return a strict JSON shape (see `systemPatterns.md`) so the frontend can render destination cards reliably.
- **Conversation history is persisted** in Supabase (`conversations`, `messages` tables) so refinement turns work and so the demo can be replayed.
- **Postgres over DynamoDB** for the conversation store. Architecture doc §2 specifies this for richer query support; we keep that decision in the prototype since Supabase is Postgres-native anyway.

## Active Design Considerations

- **How vague-query handling shows up in the UI.** Default to a regular chat bubble with no destination cards unless it looks weak in the prototype.
- **How to surface "ranking criteria" labels (FR-018).** A single small subtitle above the destination cards is sufficient.
- **Side-by-side comparison (FR-026)** — deferred from the prototype.
- **Seat availability alerts (FR-043 through FR-047)** — deferred. Only price drop alerts (FR-038 through FR-042) ship.
- **Voice input (FR-008)** — out of prototype scope.
- **Search abandonment trigger (FR-004)** — omitted.

## Patterns and Preferences Worth Remembering

- **No em dashes** in any user-facing copy or generated text.
- **Round-trip fares always shown as a single number**, not a range.
- **Currency is USD** throughout.
- **Dates in March 2026** for the seeded inventory.
- **Three suggestions per query** is the default (FR-015).
- See `design.md` at the repo root for the full UI design reference.

## Recent Learnings

- **2026-04-27:** Backend seed has 25 destinations and 70 flights — richer than originally planned. Frontend featured destinations on the Home screen can be expanded if desired.
- **2026-04-27:** `noUnusedLocals: true` in tsconfig catches unused vars in stub files — Track B and C should clean up stubs before merging.
