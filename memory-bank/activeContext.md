# Active Context

## Current Focus

**Frontend implementation underway — parallel 3-track build on the `frontend` branch.**
Backend (Dhruv) is completing Supabase setup in parallel; frontend tracks can be built and previewed with mock data until the Edge Function is live.

GitHub repo: https://github.com/dg3496/united-trip-planner
Active branch: `frontend`
Supabase project ref: jexqrbxpgxnmwxgkyinn

## Frontend Team Split (3 Parallel Tracks)

All three tracks work off the `frontend` branch. Each person should commit to their own sub-branch (`frontend-track-a`, `frontend-track-b`, `frontend-track-c`) and open a PR into `frontend` when done. Merge order: B first (chat core), then A and C can merge in either order, then `frontend` → `main`.

---

### Track A — Home Screen + Polish + Deploy
**Assigned to:** Abhinav
**Branch:** `frontend-track-a`
**Files:** `src/pages/Home.tsx`, `src/index.css`, `src/App.css`
**Phases:** 4 + 9
**Stack:** React + Vite + TypeScript + Tailwind (no Next.js, no Vercel)

Deliverables:
- Full United-branded home screen: TopBar with United wordmark, hero/banner area with "Not sure where to go?" CTA (FR-001, FR-003), BottomNav wired (FR-002)
- "Resume" card shown when an active conversation exists in Zustand store
- Featured destinations section (static, tap navigates to /chat)
- Tapping any CTA calls `useChatStore().resetConversation()` then navigates to `/chat`
- Fix `src/index.css` root styles (Vite default has width: 1126px that conflicts with MobileShell)
- Phase 9 polish: copy review (no em dashes), navy/white color palette consistent throughout, mobile Safari tested on 390px viewport
- Deploy: `npm run build && npm run preview` for local demo. For a public URL use Netlify (drag `dist/` folder) or `npx serve dist`. No Vercel.

---

### Track B — Chat UI Core
**Files:** `src/pages/Chat.tsx`, `src/components/chat/MessageList.tsx`, `src/components/chat/ChatInput.tsx`, `src/components/chat/ExamplePrompts.tsx`, `src/components/chat/LoadingIndicator.tsx`
**Phases:** 5 (main chat flow)

Deliverables:
- `Chat.tsx` — already wired to store; confirm TopBar + MessageList + ChatInput + BottomNav layout is correct and full-height on mobile
- `MessageList.tsx` — welcome state with ExamplePrompts when empty (FR-005), auto-scroll to bottom on new messages, LoadingIndicator at bottom while isLoading
- `ChatInput.tsx` — textarea send on Enter (Shift+Enter for newline), disabled while loading or empty, auto-focus on mount, iOS visual viewport resize handling for keyboard push
- `ExamplePrompts.tsx` — 3 to 4 tap-to-send example prompts styled as pill chips (FR-005)
- `LoadingIndicator.tsx` — animated indicator with contextual copy like "Finding trips for you..." (FR-021)
- `MessageBubble.tsx` — already looks complete; review and confirm conflict/no-results hints render correctly (FR-013, FR-014)

Note: `DestinationCard` rendering inside `MessageBubble` is Track C's responsibility. Track B should render the card area as a placeholder div if Track C is not merged yet.

---

### Track C — Destination Cards + Booking + Price Alerts
**Files:** `src/components/chat/DestinationCard.tsx`, `src/components/chat/ExpandedFlightDetail.tsx`, `src/pages/Booking.tsx`
**Phases:** 6 + 7 + 8

Deliverables:
- `DestinationCard.tsx` — full card: city, country, fare (USD), dates, flight duration, stops, "Why this matches" line (FR-023), Best Value badge (FR-025), trade-off line if present (FR-024), "Notify Me if Price Drops" button (FR-038)
- `ExpandedFlightDetail.tsx` — tap card to expand modal/sheet: departure/return times, stops, aircraft type, fare class, "Book This Trip" CTA that navigates to `/booking` with URL params (FR-019)
- `Booking.tsx` — already has skeleton; fill in: fare class selector, passenger count (fixed at 1 for demo), Confirm Booking fake success state with toast, "Back to your trip planner" link (FR-034 to FR-037)
- Price alerts: "Notify Me if Price Drops" calls `supabase.from('price_alerts').insert(...)` with `expires_at = now + 90 days`, then shows a `toast.success("We'll let you know if the price drops")` (FR-038 to FR-040)

## Recent Changes

- **2026-04-27:** Track C implemented on local branch `frontend-track-c` (branched from `frontend-track-a`): `getCheapestFlightForDestination` + `getDestinationById` in `api.ts`, price alerts use a real `flight_id` when available, `ExpandedFlightDetail` loads DB flight row (aircraft, fare class, leg durations, demo clock times from dates), booking route is `/booking/:flightId` with full handoff UI (fare class selector, fake confirm + toast, back link). Open PR when ready to merge into `frontend` or `main`.
- **2026-04-27:** Track A complete: `src/pages/Home.tsx` fully built (FR-001, FR-002, FR-003). `src/index.css` reset to mobile-first base styles. Visually verified in browser — navy header, Premier Gold badge, AI CTA card, featured destinations, bottom nav all render correctly.
- **2026-04-27:** `frontend` branch created. Frontend build divided into 3 parallel tracks (A: Home+Polish, B: Chat UI core, C: Cards+Booking+Alerts). See track definitions above.
- **2026-04-27:** Full project scaffolded and pushed to GitHub (see progress.md for full list).
- **2026-04-27:** Supabase MCP server connected and authenticated (project ref: jexqrbxpgxnmwxgkyinn).
- **2026-04-27:** Memory Bank added to GitHub repo at memory-bank/ and will be updated after every significant change.
- **2026-04-27:** Team split established: Dhruv owns supabase/, frontend team owns src/pages/ and src/components/.

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
- **Seeded fake inventory**, not real flight data. The Supabase `destinations` and `flights` tables hold ~20 to 30 destinations with believable round-trip fares from EWR for March 2026 dates.
- **Claude is the entire AI layer.** No fine-tuning, no RAG over external sources. The Edge Function passes the user profile and the relevant slice of seeded inventory directly into the system prompt so Claude returns grounded results.
- **Structured JSON output from Claude**, not free-form text. The Edge Function instructs Claude to return a strict JSON shape (see `systemPatterns.md`) so the frontend can render destination cards reliably.
- **Conversation history is persisted** in Supabase (`conversations`, `messages` tables) so refinement turns work and so the demo can be replayed.
- **Postgres over DynamoDB** for the conversation store. Architecture doc §2 specifies this for richer query support; we keep that decision in the prototype since Supabase is Postgres-native anyway.

## Immediate Next Steps (in order)

1. **Bootstrap the Vite + React + TS project** with Tailwind configured. Set up the basic mobile-first shell and routing.
2. **Stand up the Supabase project**, define the schema (see `techContext.md` for tables), and seed the demo user, destinations, and flights tables.
3. **Build the Edge Function** that takes `{ userMessage, conversationId }`, fetches conversation history and user profile, calls Claude with the structured system prompt, validates the JSON response, persists the new turn, and returns the structured payload.
4. **Build the home screen** with United branding, the "Not sure where to go?" banner, and the entry point to the chat (FR-001, FR-003).
5. **Build the chat UI** with the welcome message, example prompts, message bubbles, and destination cards (FR-005, FR-007, FR-016).
6. **Wire chat to the Edge Function** and confirm one full round trip works with a real Claude call.
7. **Build the expanded card view** with flight details (FR-019) and the booking confirmation screen (FR-034, FR-035).
8. **Add the "Notify Me if Price Drops" button** with a confirmation toast (FR-038). Persist alert to DB; no actual notification needed for the demo.
9. **Polish for demo:** loading states (FR-021), graceful handling of vague queries (FR-010), best-value labeling (FR-025), trade-off highlighting (FR-024).
10. **Deploy to a public URL** and record the short video tour (assignment deliverable).

## Active Design Considerations

These are open and should be decided in-flight:

- **How vague-query handling shows up in the UI.** When Claude asks a clarifying follow-up (FR-010), should it render as a regular chat bubble with no destination cards, or should we add a distinct "clarifying question" treatment? Default to a regular chat bubble unless it looks weak in the prototype.
- **How to surface "ranking criteria" labels (FR-018).** PRD requires labeling whether results are sorted by best match vs. lowest price. For the prototype, a single small subtitle above the destination cards ("Sorted by best match for your preferences") is sufficient.
- **Side-by-side comparison (FR-026)** is a "Should Have" in the PRD. **Decision: defer from the prototype** unless time permits. The 5-minute demo doesn't have room for it, and it adds significant UI complexity. Note this clearly in `progress.md`.
- **Seat availability alerts (FR-043 through FR-047)** are full PRD scope but **deferred from the prototype**. Only price drop alerts (FR-038 through FR-042) will ship in the demo.
- **Voice input (FR-008)** is **out of prototype scope** per the original brief.
- **The "abandon search" trigger (FR-004)** is hard to demo without a separate standard search flow. **Decision: omit** and rely on the home screen banner and nav entry points instead.

## Patterns and Preferences Worth Remembering

- **No em dashes** in any user-facing copy or generated text. This is a personal preference of the product owner and should propagate into Claude's system prompt as well as static UI strings.
- **Round-trip fares always shown as a single number**, not a range. The seeded inventory should support this directly.
- **Currency is USD** throughout. No locale switching in the prototype.
- **Dates in March 2026** for the seeded inventory so the demo feels current. (If a fresher window is preferred at demo time, reseed for May to July 2026 instead.)
- **Three suggestions per query is the default** (FR-015). The 3-vs-5 experiment is acknowledged in the PRD but not implemented in the prototype.
- **Hardcoded demo user profile** lives in `techContext.md`. When in doubt about what a user "knows," check there.

## Recent Learnings

None yet. Update this section after each significant build session with anything that changed the plan or surfaced an unexpected constraint (Claude prompt iteration insights, Supabase Edge Function quirks, mobile rendering issues, etc.).
