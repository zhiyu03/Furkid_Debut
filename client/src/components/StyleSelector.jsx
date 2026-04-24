const STYLES = [
  { id: 'cny',     name: '过年氛围',   emoji: '🧧', desc: '红红火火，吉祥如意' },
  { id: 'cool',    name: '酷炫拽',     emoji: '😎', desc: '墨镜皮衣，街头霸王' },
  { id: 'makeup',  name: '妆容造型',   emoji: '💄', desc: '毛发染色，精致眼影' },
  { id: 'intern',  name: '实习生装扮', emoji: '💼', desc: '工牌耳机，打工人本色' },
]

export default function StyleSelector({ selected, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {STYLES.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s)}
          className={`
            p-4 rounded-xl border-2 transition-all text-left
            ${selected?.id === s.id
              ? 'border-brand bg-brand/10 shadow-md scale-105'
              : 'border-gray-200 bg-white/70 hover:border-accent'}
          `}
        >
          <span className="text-2xl">{s.emoji}</span>
          <p className="font-bold mt-1">{s.name}</p>
          <p className="text-xs text-gray-400">{s.desc}</p>
        </button>
      ))}
    </div>
  )
}
