export default function ResultDisplay({ original, result, onScore, onReset }) {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
      <div className="flex gap-4 flex-wrap justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">原图</p>
          <img src={original} alt="original" className="w-52 h-52 object-cover rounded-2xl shadow" />
        </div>
        <div className="text-3xl self-center">→</div>
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">变身结果</p>
          <img src={result} alt="result" className="w-52 h-52 object-cover rounded-2xl shadow-lg ring-2 ring-brand" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onScore}
          className="px-6 py-2 bg-accent text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
        >
          AI 打分
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-gray-200 text-gray-600 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform"
        >
          再来一次
        </button>
      </div>
    </div>
  )
}
