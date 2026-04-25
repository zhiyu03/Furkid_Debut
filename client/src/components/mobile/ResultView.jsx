import { useState } from 'react'

export default function ResultView({ original, result, onReset }) {
  const [mode, setMode] = useState('result')

  const heroSrc = mode === 'result' ? result : original
  const modeLabel = mode === 'result' ? '效果' : '原图'

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 py-2 text-center">
        <h2 className="text-lg font-extrabold text-brand">变装完成</h2>
      </div>

      <div className="flex shrink-0 justify-center gap-2 px-3 pt-3" role="tablist" aria-label="对比原图与效果">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'original'}
          onClick={() => setMode('original')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            mode === 'original'
              ? 'bg-gradient-to-br from-violet-100 to-fuchsia-100 text-purple-900 ring-2 ring-purple-400'
              : 'border-2 border-gray-200 bg-slate-50 text-slate-600'
          }`}
        >
          原图
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'result'}
          onClick={() => setMode('result')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            mode === 'result'
              ? 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-900 ring-2 ring-brand'
              : 'border-2 border-gray-200 bg-slate-50 text-slate-600'
          }`}
        >
          效果
        </button>
      </div>

      <div className="relative mx-3 mt-2 flex min-h-0 flex-1 basis-0 overflow-hidden rounded-2xl bg-zinc-100 shadow-inner ring-1 ring-gray-200/80">
        <img
          src={heroSrc}
          alt={mode === 'result' ? '变装后' : '原图'}
          className="h-full w-full object-contain"
        />
        <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          当前 · {modeLabel}
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setMode('original')}
          className={`overflow-hidden rounded-xl border-2 text-left transition ${
            mode === 'original' ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'
          }`}
        >
          <span className="block bg-slate-50 py-1 text-center text-[10px] font-semibold text-slate-600">原图</span>
          <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
            <img src={original} alt="" className="h-full w-full object-cover" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode('result')}
          className={`overflow-hidden rounded-xl border-2 text-left transition ${
            mode === 'result' ? 'border-brand ring-2 ring-rose-200' : 'border-gray-200'
          }`}
        >
          <span className="block bg-rose-50 py-1 text-center text-[10px] font-semibold text-rose-800">效果</span>
          <div className="aspect-[4/3] w-full overflow-hidden bg-rose-100">
            <img src={result} alt="" className="h-full w-full object-cover" />
          </div>
        </button>
      </div>

      <div className="shrink-0 space-y-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-full bg-brand py-3.5 text-center text-sm font-bold text-white shadow-md active:scale-[0.99]"
        >
          再来一次
        </button>
        <p className="text-center text-[10px] text-gray-400">可长按上方大图尝试保存到相册（视系统与浏览器而定）</p>
      </div>
    </div>
  )
}
