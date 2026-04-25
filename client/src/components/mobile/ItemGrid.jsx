export default function ItemGrid({ categoryLabel, items, isSelected, onToggle }) {
  return (
    <div className="max-h-[26vh] min-h-0 shrink-0 overflow-y-auto overflow-x-hidden bg-amber-50/95 px-2 pb-2 pt-1">
      {categoryLabel && (
        <p className="mb-1.5 text-[10px] font-medium text-amber-900/85">{categoryLabel} · 点选添加或取消</p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => {
          const on = isSelected(item.id)
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-pressed={on}
              onClick={() => onToggle(item.id)}
              className={`flex min-h-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2 transition active:scale-[0.98] ${
                on
                  ? 'bg-amber-400 ring-2 ring-orange-500 ring-offset-1'
                  : 'bg-yellow-300 hover:bg-yellow-200'
              }`}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {item.emoji}
              </span>
              <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-amber-950">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
