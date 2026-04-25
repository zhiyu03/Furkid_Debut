export default function ResultView({ original, result, onReset }) {
  return (
    <div className="flex flex-1 flex-col gap-4 px-1">
      <h2 className="text-center text-xl font-bold text-gray-800">变装完成</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-center text-xs text-gray-500">原图</span>
          <img src={original} alt="原图" className="aspect-[3/4] w-full rounded-xl object-cover shadow" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-center text-xs text-gray-500">效果</span>
          <img src={result} alt="变装后" className="aspect-[3/4] w-full rounded-xl object-cover shadow" />
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-full bg-brand py-3 text-center font-bold text-white shadow-md active:scale-[0.99]"
      >
        再来一次
      </button>
    </div>
  )
}
