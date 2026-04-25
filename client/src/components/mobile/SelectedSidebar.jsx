import catalog from '@catalog/itemCatalog.json'

function lookup(categoryId, itemId) {
  const list = catalog.items[categoryId]
  const item = list?.find((i) => i.id === itemId)
  return item || { emoji: '❔', label: itemId }
}

export default function SelectedSidebar({ selections, onRemove }) {
  return (
    <aside className="flex w-[34%] min-w-[100px] max-w-[140px] shrink-0 flex-col gap-1.5 overflow-y-auto rounded-xl bg-zinc-300/90 p-2">
      <h3 className="text-[10px] font-bold text-zinc-600">已选装扮</h3>
      {!selections?.length ? (
        <p className="text-[9px] leading-snug text-zinc-500">在下方黄区点选装饰</p>
      ) : (
        selections.map((s, index) => {
          const meta = lookup(s.categoryId, s.itemId)
          const catName = catalog.categories.find((c) => c.id === s.categoryId)?.name ?? ''
          return (
            <div
              key={`${s.categoryId}-${s.itemId}-${index}`}
              className="relative rounded-lg bg-blue-500 px-2 py-2 text-left text-[9px] leading-tight text-white shadow-sm"
            >
              <button
                type="button"
                aria-label={`移除 ${meta.label}`}
                onClick={() => onRemove(s.categoryId, s.itemId)}
                className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white hover:bg-white/30 active:scale-95"
              >
                ×
              </button>
              <span className="text-base leading-none">{meta.emoji}</span>
              <div className="mt-0.5 pr-4 font-semibold">
                {catName}·{meta.label}
              </div>
            </div>
          )
        })
      )}
    </aside>
  )
}
