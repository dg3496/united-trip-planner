# Project Brief: United Airlines AI Trip Planner

## Overall Scope and Goals

Build a working prototype of a conversational AI trip planning experience for United Airlines. The application allows travelers to discover destinations, explore flight options, and book trips using natural language instead of standard structured search forms.

This is a Columbia Business School Product Management final project. The prototype is a mobile-first web app that looks and feels like a native airline app. It must demonstrate the full discovery-to-booking flow end-to-end in a 5-minute live demo to the course CEO (the professor).

## Target Experience

Within 30 seconds, a user goes from "I want to travel" to seeing three concrete, bookable trips tailored to their budget, preferences, and loyalty balance.

## Core Requirements for the Prototype

The build is scoped to what's needed for a credible 5-minute demo. Not a production system.

1. **Conversational chat interface** within a United-branded mobile shell. Welcome message, example prompts, natural language input, threaded message history.
2. **Real AI, fake inventory.** Conversational intelligence is real (OpenAI `gpt-4o-mini` via Supabase Edge Function). Flight data is seeded but realistic (20 to 30 destinations, 3 to 5 flights each, March 2026 dates from EWR).
3. **Structured destination cards** with city, country, round-trip fare, dates, flight duration, a "Why this matches" explanation tied to the user's stated preferences, and a Best Value label on the top pick.
4. **Refinement turns** that update results within the same conversation ("nonstop only", "make it cheaper") without resetting context.
5. **Expanded flight detail view** with departure / return times, stops, aircraft type, fare class.
6. **Booking handoff** to a pre-filled fake booking confirmation screen.
7. **Price drop alert** with a confirmation toast and persistence to the database.
8. **Hardcoded demo user** with Gold MileagePlus tier and EWR home airport so personalization is visibly at work without real auth.
9. **Mobile-first design** that looks and feels like the United app on a phone-sized viewport.
10. **Public deployment** at a stable URL for the demo and short recorded video tour.

## Value Proposition

Solve the "Where should I travel?" problem for destination-flexible leisure travelers. Drive incremental flight bookings, increase ancillary revenue uplift, and re-engage users through price drop alerts. United is uniquely positioned because it has three structural advantages no aggregator can match: inventory certainty (every suggestion is bookable at the displayed price), loyalty integration (MileagePlus tier, balance, and travel history inform suggestions), and context persistence across repeat bookings.

## Technical Foundation

- **Frontend:** React + Vite + TypeScript Single Page Application, mobile-first, Tailwind CSS.
- **Backend:** Supabase (PostgreSQL, Edge Functions, Auth) acting as the orchestration layer between the UI, OpenAI, and the seeded flight inventory.
- **LLM:** OpenAI `gpt-4o-mini` via Chat Completions, called only from the Edge Function.

## Non-Goals

- **Real authentication.** Hardcoded demo user only.
- **Real payment processing.** Booking confirmation is faked.
- **Real flight inventory.** All seeded.
- **Voice input** (PRD FR-008, deferred from prototype).
- **Post-booking itinerary planning** (hotels, restaurants, activities).
- **Group trip coordination.**
- **Non-United inventory.**
- **Miles + cash redemption flows** (cash bookings only, per PRD §7.2).
- **Side-by-side comparison view** (PRD FR-026, deferred from prototype).
- **Seat availability alerts** (PRD FR-043 through FR-047, deferred from prototype).
- **Production-grade fallback paths** (NFR-07 specifies a curated fallback when the LLM is unavailable; the prototype shows a retry toast instead).

## Source Documents

This brief summarizes and supersedes nothing. The detailed specifications live in:

- **PRD** (Week 2 sprint deliverable): full functional and non-functional requirements, user stories, scope boundaries, success metrics. Contains the FR-001 through FR-047 requirement IDs that other Memory Bank files reference for traceability.
- **Architecture and Engineering Considerations** (Week 3 sprint deliverable): client/server architecture, third-party API and tool list, capacity estimation, testing strategy.
- **Business Model, GTM Fit, Measurement** (Week 3 sprint deliverable): revenue streams, distribution channels, cost structure, experimentation strategy, leading and lagging indicators, cannibalization measurement methodology.

These documents reflect a much larger production system than the prototype builds. The prototype is a focused subset designed to make the core value proposition tangible in a live demo.

## Definition of Done

The prototype is shipped when a user can, on a real phone over a real network:

1. Open the deployed URL and land on a United-branded home screen with a "Not sure where to go?" banner.
2. Tap into the chat, type a vague trip query, and see 3 destination cards within 5 seconds.
3. See one card labeled Best Value and a sensible "Why this matches" line on every card.
4. Send a refinement message and have the results update in the same conversation.
5. Tap a card, see the expanded flight detail, tap "Book This Trip," and land on a pre-filled booking confirmation screen.
6. Tap "Notify Me if Price Drops" and see a confirmation toast.
7. Get through the full flow with no user-visible errors.

Everything else is polish.
