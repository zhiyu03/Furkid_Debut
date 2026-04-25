import catalog from '@catalog/itemCatalog.json'

function lookup(categoryId, itemId) {
  const list = catalog.items[categoryId]
  const item = list?.find((i) => i.id === itemId)
  return item || { emoji: '❔', label: itemId }
}

export default function SelectedStrip({ selections, onRemove }) {
  if (!selections?.length) {
    return (
      <p className="mt-1 truncate text-center text-[10px] text-gray-400">可选：点右侧分类添加饰品</p>
    )
  }

  return (
    <div className="mt-2 flex max-h-16 flex-nowrap gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {selections.map((s, index) => {
        const meta = lookup(s.categoryId, s.itemId)
        return (
          <button
            key={`${s.categoryId}-${s.itemId}-${index}`}
            type="button"
            aria-label={`移除 ${meta.label}`}
            onClick={() => onRemove(index)}
            className="flex shrink-0 flex-col items-center rounded-lg border border-gray-200 bg-white/90 px-2 py-1 text-xs shadow-sm active:scale-95"
          >
            <span className="text-lg leading-none">{meta.emoji}</span>
            <span className="max-w-[3.5rem] truncate text-[9px] text-gray-500">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
