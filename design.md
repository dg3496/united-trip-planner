# United AI Trip Planner — Design Reference

> Living document. Update after every UI change. Last updated: 2026-04-27 (Track A complete).

---

## 1. Brand & Color

| Token | Hex | Usage |
|---|---|---|
| **United Navy** | `#003087` | Primary — TopBar, CTA cards, user bubbles, nav active, buttons |
| **United Navy Dark** | `#002070` | Active/pressed state of navy buttons |
| **United Navy Dim** | `#0056B8` | Gradient end in destination card header |
| **Gold** | `#FFD700` | Premier Gold member badge text |
| **Best Value Gold** | `#C8960C` | "Best Value" badge background on destination cards |
| **White** | `#FFFFFF` | All card surfaces, assistant bubbles, bottom nav |
| **Page Background** | `#F9FAFB` (`gray-50`) | Screen background behind cards |
| **Shell Background** | `#E5E7EB` (`gray-200`) | MobileShell outer chrome (desktop only) |
| **Border** | `#F3F4F6` (`gray-100`) | Card borders, top border of BottomNav |
| **Body Text** | `#1F2937` (`gray-800`) / `#111827` (`gray-900`) | Primary text on white surfaces |
| **Secondary Text** | `#9CA3AF` (`gray-400`) | Subtitles, metadata, labels |
| **Amber Warning** | `#B45309` (`amber-700`) on `#FFFBEB` (`amber-50`) | Trade-off text, conflict hints |
| **Green Success** | `#15803D` (`green-700`) on `#F0FDF4` (`green-50`) | "Alert set" button state |

**Destination category accent colors** (used for icon bg and tag pill — apply at 15–20% opacity for bg):

| Category | Hex |
|---|---|
| Beach | `#0ea5e9` (sky-500) |
| Culture | `#8b5cf6` (violet-500) |
| Tropical | `#10b981` (emerald-500) |
| Adventure | `#f59e0b` (amber-400) |

---

## 2. Typography

All type is `system-ui, 'Segoe UI', Roboto, sans-serif` — no custom font loaded.

| Role | Size | Weight | Notes |
|---|---|---|---|
| TopBar wordmark "United" | `text-xl` (20px) | `font-bold` | `tracking-wide` |
| TopBar page title | `text-base` (16px) | `font-semibold` | |
| Hero headline | `text-2xl` (24px) | `font-bold` | `leading-tight` |
| Section heading | `text-sm` (14px) | `font-semibold` | e.g. "Popular from New York" |
| Card city name | `text-lg` (18px) | `font-bold` | on image overlay |
| Card price | `text-xl` (20px) | `font-bold` | on image overlay |
| Card body text | `text-sm` (14px) | regular | `leading-relaxed` |
| Meta / subtitles | `text-xs` (12px) | `font-medium` | gray-400 |
| Badge / label text | `text-[10px]`–`text-[11px]` | `font-medium`–`font-semibold` | uppercase + tracking for status labels |
| Bottom nav labels | `text-[10px]` | `font-medium` | |

**Copy rules:**
- No em dashes anywhere. Use commas, periods, or reword.
- Currency always in USD, shown as `$XXX` (whole number, no cents).
- Dates as `Mar 14 - Mar 21` (short month, no year unless ambiguous).
- Stops: "Nonstop" (not "0 stops"), "1 stop", "2 stops".

---

## 3. Spacing & Layout

**Mobile frame:** `max-w-[430px]`, `h-[844px]` on desktop (iPhone 14 Pro simulation). Full-width on real phones.

**Screen structure (all pages):**
```
┌──────────────────────┐  ← TopBar h-14 (56px), bg-navy, flex-shrink-0
│                      │
│   Main content       │  ← flex-1, overflow-y-auto
│                      │
└──────────────────────┘  ← BottomNav, flex-shrink-0, pb-safe
```

**Page padding:** `px-4` (16px) horizontal on all content areas.
**Card gap:** `gap-4` (16px) between stacked cards.
**Inner card padding:** `p-4` (16px) standard, `p-5` (20px) for prominent CTA cards.
**Section gap:** `gap-3` (12px) between items within a section.

**Floating card pattern (Home):**
The hero header extends lower (`pb-8`) and the card container uses `-mt-4` to overlap, creating a "floating" effect. Always pair `pb-8` on the hero with `-mt-4` on the card container.

---

## 4. Component Patterns

### TopBar
```
bg-[#003087] | h-14 | px-4 | text-white | flex items-center | pt-safe
```
- No title + no back → shows "United" wordmark (`font-bold tracking-wide`)
- With title → shows title text (`font-semibold text-base`)
- With showBack → shows `ArrowLeft` icon button, then title

### BottomNav
```
bg-white | border-t border-gray-100 | pb-safe
3 equal tabs: Home (/), Plan a Trip (/chat), Alerts (/alerts)
Active: text-[#003087], strokeWidth 2.5
Inactive: text-gray-400, strokeWidth 1.8
```

### Card (surface)
```
bg-white | rounded-2xl | shadow-sm | border border-gray-100
```
Standard card radius is `rounded-2xl` (16px). Never use `rounded-lg` or `rounded-xl` for full cards.

### Primary Button (on dark bg)
```
bg-white text-[#003087] | font-semibold text-sm | px-5 py-3 | rounded-xl | w-fit
active:opacity-80 transition-opacity
```

### Primary Button (on white bg)
```
bg-[#003087] text-white | font-semibold | py-4 | rounded-2xl | w-full
active:bg-[#002070] transition-colors
```

### Outline Button
```
border border-[#003087] text-[#003087] | font-semibold text-sm | py-3.5 | rounded-2xl | w-full
active:bg-[#003087]/5 transition-colors
```

### Icon Button (small action)
```
border border-gray-200 text-gray-600 | text-xs font-medium | px-3 py-2.5 | rounded-xl
hover:border-[#003087]/30 hover:text-[#003087] | active:bg-gray-50
```

### Status / Category Pill (tag badge)
```
text-[11px] font-medium | px-2.5 py-1 | rounded-full
bg: accentColor + '15' (15% opacity hex)
color: accentColor (full)
```

### Status Label (small caps label above content)
```
text-[10px] text-gray-400 uppercase tracking-wide font-medium
```

### Icon Avatar (destination card on Home)
```
w-10 h-10 | rounded-xl | flex items-center justify-center
bg: accentColor + '20' (20% opacity hex)
icon color: accentColor (full), size 18
```

### "Best Value" Badge
```
bg-[#C8960C] text-white | text-xs font-semibold | px-2.5 py-1 | rounded-full
includes Star icon (size 10, fill white) + "Best Value" text
position: absolute top-3 left-3 on card image
```

### Chat Bubble — User
```
bg-[#003087] text-white | max-w-[80%] | px-4 py-3 | rounded-2xl rounded-tr-sm | text-sm leading-relaxed
align: items-end
```

### Chat Bubble — Assistant
```
bg-white border border-gray-100 text-gray-800 | shadow-sm
max-w-[80%] | px-4 py-3 | rounded-2xl rounded-tl-sm | text-sm leading-relaxed
align: items-start
```

### Trade-off / Warning Inline
```
text-xs text-amber-700 | bg-amber-50 | rounded-lg px-3 py-2
```

### Conflict / No-results Hint (in chat)
```
text-xs | bg-amber-50 text-amber-700 (conflict) | bg-gray-50 text-gray-500 (no results)
rounded-xl px-3 py-2 | max-w-[90%]
```

---

## 5. Destination Card (DestinationCard.tsx)

Full-width card rendered in the chat for each flight suggestion.

```
┌─────────────────────────────────┐  ← rounded-2xl overflow-hidden
│  Image (h-32, gradient fallback)│  ← gradient: #003087 → #0056B8
│  [Best Value badge] top-left    │
│  City + Country   |   $Price    │  ← absolute bottom-3
└─────────────────────────────────┘
│ Nonstop · 5h 30m · Mar 14-21   │  ← text-xs text-gray-500
│ "Why this matches..." text      │  ← text-sm text-gray-700
│ [Trade-off amber box]           │  ← only if tradeOff present
│ ▼ Show flight details           │  ← expand toggle
│ [Expanded detail section]       │  ← only when expanded
│ [🔔 Notify me if price drops]   │  ← becomes "Alert set" (green) after tap
└─────────────────────────────────┘
```

---

## 6. Screen Map

| Route | Component | Status | Track |
|---|---|---|---|
| `/` | `Home.tsx` | ✅ Complete | A |
| `/chat` | `Chat.tsx` | 🔲 Stub | B |
| `/booking/*` | `Booking.tsx` | 🔲 Stub | C |

**Sub-components status:**

| Component | Status | Track |
|---|---|---|
| `TopBar` | ✅ Done | — |
| `BottomNav` | ✅ Done | — |
| `MobileShell` | ✅ Done | — |
| `MessageBubble` | ✅ Done | B (review) |
| `MessageList` | 🔲 Stub | B |
| `ChatInput` | 🔲 Stub | B |
| `ExamplePrompts` | 🔲 Stub | B |
| `LoadingIndicator` | 🔲 Stub | B |
| `DestinationCard` | ✅ Done | C (review) |
| `ExpandedFlightDetail` | 🔲 Stub | C |

---

## 7. Interaction & Motion

- **Tap feedback:** All interactive elements use `active:opacity-80` or `active:bg-*` — never scale transforms (feels wrong on mobile).
- **Transitions:** `transition-colors` or `transition-opacity` — duration default (150ms). No custom durations.
- **Scroll:** All scrollable content uses `overflow-y-auto`. No custom scrollbars.
- **Auto-scroll in chat:** `scrollIntoView({ behavior: 'smooth' })` on new messages.
- **No page transition animations** in the prototype — React Router navigates instantly.

---

## 8. Safe Area (iPhone notch / home bar)

TopBar uses `pt-safe` (`padding-top: env(safe-area-inset-top)`).
BottomNav uses `pb-safe` (`padding-bottom: env(safe-area-inset-bottom)`).
These classes are defined in `src/index.css`. Do not remove them.

---

## 9. Icons

All icons from `lucide-react`. Standard sizes:

| Context | Size | strokeWidth |
|---|---|---|
| Bottom nav (active) | 22 | 2.5 |
| Bottom nav (inactive) | 22 | 1.8 |
| TopBar back button | 22 | default |
| Card meta icons | 12 | default |
| Action button icons | 13 | default |
| Expand toggle | 14 | default |
| Featured destination avatar | 18 | default |
| AI CTA sparkles | 20 | default |

---

## 10. Things NOT to do

- No em dashes (`—`) anywhere in UI copy or AI-generated text.
- No `rounded-lg` or `rounded-xl` for full card surfaces — always `rounded-2xl`.
- No miles+cash UI — cash only in the prototype.
- No dark mode — the app does not support it (no `dark:` Tailwind classes).
- No inline styles except for dynamic accent colors (`style={{ backgroundColor: color + '15' }}`).
- Do not change `TripPlannerResponse` or `Suggestion` types in `src/lib/types.ts` without coordinating with the backend team.
