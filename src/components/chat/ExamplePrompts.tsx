// FR-005 — welcome prompts shown when no messages exist yet

interface Props {
  onSelect: (prompt: string) => void
}

const PROMPTS = [
  'Beach trip under $500 in March',
  'Somewhere warm, 5 to 7 days, nonstop only',
  'Europe for under $800 in spring',
  'Surprise me, I just need a getaway',
]

export function ExamplePrompts({ onSelect }: Props) {
  return (
    <div className="py-2 flex flex-wrap gap-2">
      {PROMPTS.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className="text-left text-sm text-[#003087] border border-[#003087]/30 rounded-full px-4 py-2 bg-white hover:bg-[#003087]/5 active:bg-[#003087]/10 transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  )
}
