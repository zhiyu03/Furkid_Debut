export default function CategoryPanel({ category, onPick, onClose }) {
  if (!category) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-12 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`选择${category.name}`}
    >
      <div className="max-h-[70vh] w-full max-w-[430px] overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="text-lg font-bold">
            {category.emoji} {category.name}
          </span>
          <button
            type="button"
            className="rounded-full px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 overflow-y-auto p-3 sm:grid-cols-5">
          {category.items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => onPick(category.id, item.id)}
              className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-2 transition active:scale-95"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="line-clamp-2 text-center text-[10px] text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
