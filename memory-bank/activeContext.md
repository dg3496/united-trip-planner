# Active Context

## Current Focus

**Backend complete and end-to-end verified. Frontend Tracks A, B, and C merged to `main`.**
All phases 1 through 8 are shipped. Phase 9 (polish and demo prep) remains.

GitHub repo: https://github.com/dg3496/united-trip-planner
Active branch: `main`
Supabase project ref: jexqrbxpgxnmwxgkyinn

---

## Backend Status (Dhruv) — ALL DONE

1. ~~Apply schema migration via MCP~~ **DONE**
2. ~~Seed demo user + destinations + flights~~ **DONE** (25 destinations, 70 flights)
3. ~~Set OPENAI_API_KEY secret~~ **DONE** (set in Supabase Vault)
4. ~~Deploy chat-trip-planner Edge Function~~ **DONE** (v12, ACTIVE, OpenAI gpt-4o-mini)
5. ~~End-to-end smoke test~~ **DONE** (3 cards returned, Best Value labeled, assistantMessage populated)
6. ~~Push backend branch with OpenAI changes~~ **DONE**

---

## Frontend Team Split (3 Parallel Tracks) — ALL COMPLETE

### Track A — Home Screen + Polish + Deploy ✅ MERGED TO `main`
**Assigned to:** Abhinav
**Branch:** `frontend-track-a` (merged into `frontend` and `main`)

Delivered:
- Full United-branded home screen: TopBar, hero, "Not sure where to go?" CTA (FR-001, FR-003), BottomNav (FR-002)
- Resume card when active conversation exists in Zustand store
- Featured destinations section (static, tap starts new trip)
- Fixed `src/index.css` (Vite default conflicts removed)
- `design.md` — full UI design reference for Tracks B and C

---

### Track B — Chat UI Core ✅ MERGED TO `main`
**Files:** `src/pages/Chat.tsx`, `src/components/chat/MessageList.tsx`, `src/components/chat/ChatInput.tsx`, `src/components/chat/ExamplePrompts.tsx`, `src/components/chat/LoadingIndicator.tsx`

Delivered:
- `Chat.tsx` — TopBar + MessageList + ChatInput + BottomNav layout, full-height on mobile
- `MessageList.tsx` — welcome state with ExamplePrompts when empty (FR-005), auto-scroll, LoadingIndicator while isLoading
- `ChatInput.tsx` — Enter to send, Shift+Enter for newline, disabled while loading, iOS keyboard offset handling
- `ExamplePrompts.tsx` — 3 to 4 tap-to-send example prompts as pill chips (FR-005)
- `LoadingIndicator.tsx` — animated indicator with contextual copy (FR-021)

---

### Track C — Destination Cards + Booking + Price Alerts ✅ MERGED TO `main`
**Files:** `src/components/chat/DestinationCard.tsx`, `src/components/chat/ExpandedFlightDetail.tsx`, `src/pages/Booking.tsx`

Delivered:
- `DestinationCard.tsx` — city, country, fare, dates, duration, stops, "Why this matches" (FR-023), Best Value badge (FR-025), trade-off line (FR-024), "Notify Me if Price Drops" (FR-038)
- `ExpandedFlightDetail.tsx` — departure/return times, stops, aircraft type, fare class, "Book This Trip" → `/booking/:flightId` (FR-019)
- `Booking.tsx` — fare class selector, Confirm Booking fake success + toast, "Back to your trip planner" link (FR-034 to FR-037)
- Price alerts: inserts `price_alerts` with `expires_at` +90 days, `toast.success` confirmation (FR-038 to FR-040)

---

## Remaining: Phase 9 — Polish and Demo Prep

- [ ] End-to-end test on real phone (iPhone 14 viewport, 390px)
- [ ] Warm Edge Function before demo (avoids cold start on first message)
- [ ] Demo script: 4 to 5 talking points mapped to specific clicks
- [ ] Deploy to public Vercel URL (set VITE_* env vars in Vercel project settings)
- [ ] Record short video tour (assignment deliverable)

---

## Recent Changes

- **2026-04-27:** Frontend premium quality pass on `main`: improved visual hierarchy across TopBar, BottomNav, MessageList, MessageBubble, DestinationCard, ExpandedFlightDetail, and Booking surfaces.
- **2026-04-27:** Added `/alerts` page and route so BottomNav "Alerts" no longer routes to a missing page.
- **2026-04-27:** Updated example prompt copy to remove em dash usage in UI strings.
- **2026-04-27:** Track C merged to `main` from `frontend-track-c` (booking route, expanded detail, price alerts).
- **2026-04-27:** Frontend Track B merged into `main`. Chat core mobile UX shipped.
- **2026-04-27:** Track A complete and merged to `main`. Home screen, `design.md`, `index.css` reset shipped.
- **2026-04-27:** Switched LLM from Gemini Flash to OpenAI gpt-4o-mini (Gemini quota=0). OPENAI_API_KEY set in Supabase Vault. Edge Function redeployed as v12. End-to-end smoke test passed.
- **2026-04-27:** Backend (Dhruv): schema migration and seed applied (25 destinations, 70 flights). Edge Function deployed and ACTIVE. `.env.example` updated with real Supabase values.
- **2026-04-27:** Memory Bank added to GitHub repo at `memory-bank/`.
- **2026-04-27:** Team split established: Dhruv owns `supabase/`, frontend team owns `src/pages/` and `src/components/`.

## Previously Recorded Changes

- Migrated product specification, architecture, and business model requirements from source documents into the Memory Bank.
- Decided on React + Vite + TypeScript + Supabase + Anthropic Claude as the prototype stack.
- Decided to use a hardcoded demo user with full-bypass auth, rather than implementing real Supabase Auth flows.

## Key Decisions Already Made

These are settled. Do not relitigate without explicit input.

- **Tech stack:** React + Vite + TypeScript on the frontend, Tailwind CSS for styling, Supabase for the entire backend (Postgres, Edge Functions, Auth). LLM is OpenAI gpt-4o-mini called from a Supabase Edge Function.
- **Mobile-first web app**, not a native app. Should look and feel like the United mobile app when viewed in a phone-sized viewport. Desktop is a secondary consideration but should not be broken.
- **Hardcoded demo user**, not real auth. A single seeded MileagePlus profile (Premier Gold tier, EWR home airport, sample preferences and travel history) drives all personalization.
- **Cash bookings only**, no miles+cash UI in the prototype (matches PRD §7.2 v1 scope).
- **Seeded fake inventory**, not real flight data. The Supabase `destinations` and `flights` tables hold 25 destinations with believable round-trip fares from EWR.
- **OpenAI gpt-4o-mini is the AI layer.** No fine-tuning, no RAG over external sources. The Edge Function passes the user profile and the relevant slice of seeded inventory directly into the system prompt so the model returns grounded results.
- **Structured JSON output**, not free-form text. The Edge Function instructs the model to return a strict JSON shape (see `systemPatterns.md`) so the frontend can render destination cards reliably.
- **Conversation history is persisted** in Supabase (`conversations`, `messages` tables) so refinement turns work and so the demo can be replayed.
- **Postgres over DynamoDB** for the conversation store.

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
