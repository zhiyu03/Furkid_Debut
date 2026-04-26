export default function CategoryTabs({ categories, activeId, onChange }) {
  const isImageIcon = (value) => /^https?:\/\//.test(value || '')

  return (
    <div
      className="flex shrink-0 gap-1.5 border-b border-gray-200 bg-white px-2 py-2"
      role="tablist"
      aria-label="装饰分类"
    >
      {categories.map((c) => {
        const active = c.id === activeId
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c.id)}
            className={`min-w-0 flex-1 rounded-lg px-1 py-2 text-center text-[11px] font-semibold transition ${
              active
                ? 'bg-orange-50 text-orange-800 ring-2 ring-orange-400'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="mr-0.5 inline-flex h-4 w-4 items-center justify-center align-[-2px]">
              {isImageIcon(c.emoji) ? (
                <img src={c.emoji} alt="" aria-hidden className="h-4 w-4 rounded-sm object-cover" />
              ) : (
                c.emoji
              )}
            </span>
            {c.name}
          </button>
        )
      })}
    </div>
  )
}
