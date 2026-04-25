export default function CategoryRail({ categories, onOpen }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-2 overflow-y-auto py-1">
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-label={`打开${c.name}选项`}
          onClick={() => onOpen(c.id)}
          className="flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border-2 border-gray-200 bg-white/80 px-1 py-2 text-center shadow-sm transition hover:border-brand active:scale-[0.98]"
        >
          <span className="text-xl">{c.emoji}</span>
          <span className="text-[11px] font-semibold leading-tight text-gray-800">{c.name}</span>
        </button>
      ))}
    </div>
  )
}
