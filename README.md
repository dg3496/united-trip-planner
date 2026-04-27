# United Airlines AI Trip Planner

> Columbia Business School Product Management Final Project

A mobile-first conversational AI trip planning prototype for United Airlines. Users describe where they want to go in natural language and receive personalized flight suggestions — no destination required upfront.

## Live demo

_URL added after Vercel deployment._

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand |
| Routing | React Router 6 |
| Backend | Supabase (Postgres + Edge Functions) |
| AI | OpenAI `gpt-4o-mini` |
| Deploy | Vercel (frontend) + Supabase (backend) |

## Getting started

See [CLAUDE.md](./CLAUDE.md) for full setup, team ownership map, and architecture notes.

```bash
nvm use 20
cp .env.example .env.local   # fill in Supabase URL, anon key, demo user id
npm install
npm run dev                  # http://localhost:5173
```

## Project structure

```
src/
├── pages/           Home.tsx, Chat.tsx, Booking.tsx, Alerts.tsx
├── components/
│   ├── chat/        MessageList, MessageBubble, DestinationCard,
│   │                ExpandedFlightDetail, ChatInput, LoadingIndicator,
│   │                ExamplePrompts
│   ├── layout/      MobileShell, TopBar, BottomNav
│   └── ui/          Toast (sonner wrapper)
├── lib/             supabase.ts, api.ts, types.ts
├── store/           chatStore.ts (Zustand)
└── styles/          tailwind.css

supabase/
├── functions/
│   └── chat-trip-planner/   index.ts  (Edge Function — backend owner: Dhruv)
├── migrations/              001_schema.sql
└── seed/                    002_seed.sql
```

## Team ownership

| Area | Owner |
|---|---|
| Edge Function + DB schema + seed | Dhruv |
| Pages, components, styling | Frontend team |
| Shared types (`src/lib/types.ts`) | Coordinate before changing |

## Key design decisions

- Hardcoded demo user (EWR, Gold tier) — no real auth
- OpenAI `gpt-4o-mini` called server-side only, never from the browser
- Structured JSON output from the model; frontend renders cards from that shape
- Exactly 3 suggestions per query, exactly 1 labeled Best Value
- No em dashes anywhere in UI copy or model responses
