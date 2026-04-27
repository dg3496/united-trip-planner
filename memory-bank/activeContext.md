# Active Context

## Current Focus

**Backend complete and end-to-end verified.** Frontend team can now connect and start building UI. The immediate goal is to get the frontend pages and components implemented so the app is demo-ready.

GitHub repo: https://github.com/dg3496/united-trip-planner
Supabase project ref: jexqrbxpgxnmwxgkyinn

Next actions (in order):
1. ~~Apply schema migration via MCP~~ DONE
2. ~~Seed demo user + destinations + flights~~ DONE (25 destinations, 70 flights)
3. ~~Set OPENAI_API_KEY secret~~ DONE
4. ~~Deploy chat-trip-planner Edge Function~~ DONE (v12, ACTIVE, OpenAI gpt-4o-mini)
5. ~~End-to-end smoke test~~ DONE (3 cards returned, Best Value labeled, assistantMessage populated)
6. ~~Push backend branch with OpenAI changes~~ DONE
7. Frontend team: copy .env.example to .env.local and run npm run dev
8. Implement Home screen (Phase 4)
9. Implement Chat UI (Phase 5)
10. Wire chat to Edge Function and confirm full round trip
11. Build expanded card view + booking confirmation (Phases 6-7)
12. Add price alerts (Phase 8)
13. Polish and deploy to Vercel (Phase 9)

## Recent Changes

- **2026-04-27:** Full project scaffolded and pushed to GitHub (see progress.md for full list).
- **2026-04-27:** Supabase MCP server connected and authenticated (project ref: jexqrbxpgxnmwxgkyinn).
- **2026-04-27:** Memory Bank added to GitHub repo at memory-bank/ and will be updated after every significant change.
- **2026-04-27:** Team split established: Dhruv owns supabase/, frontend team owns src/pages/ and src/components/.
- **2026-04-27:** Switched LLM from Gemini Flash to OpenAI gpt-4o-mini (Gemini had quota=0 on free tier). OPENAI_API_KEY set in Supabase Vault. Edge Function redeployed as v12.
- **2026-04-27:** End-to-end smoke test passed. "Beach trip under $500 in March" returned 3 valid cards (SJU $279 Best Value, MBJ $419, PHX $299). assistantMessage non-empty, grounding validated, Best Value normalized.

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
