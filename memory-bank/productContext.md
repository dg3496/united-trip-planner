# Product Context

## Why the Project Exists

There is an industry-wide gap: no major airline today helps users figure out *where* to go. Existing tools (Google Flights, Skyscanner, Kayak) require knowing your destination first. Travel blogs and social media inspire but lack pricing and live availability. Travel agents are slow and expensive. Destination-flexible travelers either spend hours stitching together fragmented research across multiple tools, or default to familiar destinations and miss better-fit alternatives.

By providing an AI conversational planner, United becomes a first-mover in capturing travelers during the high-intent inspiration phase, before they go to a third-party aggregator.

## Target Audience

**Primary user:** Destination-flexible leisure travelers aged 25 to 40, constrained by budget and time. They know they want to travel but do not have a specific city in mind. They cannot fill out a standard search form because they do not yet know the answers (where, exactly when, which airport).

Core user job: *"I want to take a trip, but I don't know where. Help me find a good option quickly."*

**Secondary users** (not the v1 design target but expected to benefit):
- Frequent business travelers adding a personal leg to a work trip.
- MileagePlus members exploring where their points hold the most value.

## Why a Conversational Interface

Form-based search is for users who know what they want. This feature is for users who need help figuring it out. A chat lets users express intent loosely and get progressively more specific as the AI narrows options. The conversational format is itself a hypothesis being tested in production (see Business Model §4, Experiment 1: chat vs. form-based discovery).

## Why United Is the Right Company to Solve This

The product vision rests on three structural advantages United has over third-party tools:

1. **Inventory certainty.** Every suggestion is bookable at the displayed price. No bait-and-switch at click-through.
2. **Loyalty integration.** United knows MileagePlus tier, balance, earning velocity, and travel history. No aggregator has this.
3. **Context persistence.** The system can learn preferences across repeat bookings and improve over time. Aggregators treat every session as a blank slate.

The prototype should make these advantages legible in the demo: pricing matches the seeded inventory exactly, and the demo user has a MileagePlus profile that visibly influences suggestions.

## Problems Solved

- **Decision Paralysis:** Users are overwhelmed by options. We solve this by limiting suggestions to 3 per query, explaining trade-offs, and tagging one as Best Value (FR-024, FR-025).
- **Gap Between Inspiration and Transaction:** Converting discovery directly into bookings by keeping the user in United's flow rather than sending them to an aggregator.
- **Context Loss:** Aggregators treat every session as a blank slate. We use United's persistent loyalty data (MileagePlus) to personalize suggestions instantly.

## UX Goals

The 30-second target experience: from "I want to travel" to seeing 3 concrete, bookable trips tailored to budget, preferences, and loyalty status.

Specific principles the prototype must demonstrate:

- **Speed feels native.** Mobile-first, no jarring page transitions, results render within ~5 seconds (NFR-01).
- **Match explanations build trust.** Every destination card includes a "Why this matches" line tied to user-stated preferences (FR-023). This is the core trust-building mechanism and is not optional.
- **Decision support reduces paralysis.** One pick is labeled "Best Value" (FR-025), and trade-offs are surfaced explicitly (FR-024).
- **Refinement is fluid.** Follow-up messages ("nonstop only", "make it cheaper") update results without resetting the conversation (FR-011, FR-012).
- **Booking handoff is frictionless.** Tap a card to expand flight details (FR-019), then "Book This Trip" pre-fills a checkout (FR-034, FR-035).
- **Re-engagement is built in.** "Notify Me if Price Drops" sets an alert with a confirmation toast (FR-038).
- **No hallucinated flights.** Every suggestion is grounded in the seeded inventory (FR-022).

## What Success Looks Like for the Demo

The CEO (the professor) should walk away with three things clearly:

1. **A real, unmet user need** that competitors haven't addressed.
2. **A working flow** that turns vague intent into a bookable trip in under 60 seconds on stage.
3. **A defensible business case**: incremental revenue from net-new bookings and re-engagement, with clear measurement methodology (matched control holdback for cannibalization, per Business Model §5.3).

The prototype is the proof point. Everything in it should reinforce that the experience is plausibly shippable, not a mockup.

## Tone and Brand

The UI should feel like United: navy and white palette, clean typography, restrained use of color. The chat experience should feel calm and confident, not chatty or overly enthusiastic. The AI's voice is helpful and concise, similar to a knowledgeable travel concierge, not a sales agent.
