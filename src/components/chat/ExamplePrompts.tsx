// FR-005 — welcome prompts shown when no messages exist yet

interface Props {
  onSelect: (prompt: string) => void
  prompts?: string[]
  heading?: string
}

const DEFAULT_PROMPTS = [
  'Beach trip under $500 in May',
  'Somewhere warm, 5 to 7 days, nonstop only',
  'Europe for under $800 in June',
  'Surprise me, I just need a getaway',
]

export function ExamplePrompts({ onSelect, prompts, heading }: Props) {
  const list = prompts ?? DEFAULT_PROMPTS
  return (
    <div className="flex flex-col gap-2.5">
      {heading && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">{heading}</p>
      )}
      <div className="flex flex-col gap-2">
        {list.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className="text-left text-[13px] text-[#003087] border border-[#003087]/25 rounded-2xl px-4 py-3 bg-white shadow-sm font-medium active:bg-[#003087]/5 active:scale-[0.98] transition-all"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
