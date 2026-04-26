export default function ItemGrid({ categoryLabel, items, isSelected, onToggle }) {
  const isImageIcon = (value) => /^https?:\/\//.test(value || '')

  return (
    <div className="min-h-0 shrink-0 bg-amber-50/95 px-2 pb-2 pt-1">
      {categoryLabel && (
        <p className="mb-1 text-[10px] font-medium text-amber-900/85">{categoryLabel} · 左右滑动点选</p>
      )}
      <div className="max-h-[18vh] min-h-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max flex-nowrap gap-2 py-0.5">
          {items.map((item) => {
            const on = isSelected(item.id)
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-pressed={on}
                onClick={() => onToggle(item.id)}
                className={`flex h-[4.25rem] w-[4.75rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2 transition active:scale-[0.98] ${
                  on
                    ? 'bg-amber-400 ring-2 ring-orange-500 ring-offset-1'
                    : 'bg-yellow-300 hover:bg-yellow-200'
                }`}
              >
                {isImageIcon(item.emoji) ? (
                  <img
                    src={item.emoji}
                    alt=""
                    aria-hidden
                    className="h-7 w-7 rounded-md object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-2xl leading-none" aria-hidden>
                    {item.emoji}
                  </span>
                )}
                <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-amber-950">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
