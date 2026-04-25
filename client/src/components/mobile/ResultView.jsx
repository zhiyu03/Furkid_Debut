import { useState } from 'react'

/** 发抖音等场景一键复制的文案（方案 4） */
export const DEBUT_SHARE_CAPTION =
  '我家毛孩子今天 C 位出道！快来围观～\n#毛孩子出道计划 #萌宠出道 #宠物变装 #抖音萌宠'

export default function ResultView({ original, result, onReset }) {
  const [mode, setMode] = useState('result')
  const [copied, setCopied] = useState(false)

  const heroSrc = mode === 'result' ? result : original
  const modeLabel = mode === 'result' ? '出道定妆' : '素人毛孩'

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(DEBUT_SHARE_CAPTION)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 py-2 text-center">
        <h2 className="text-lg font-extrabold text-brand">出道定妆照已就绪</h2>
        <p className="mt-0.5 text-[11px] text-gray-500">准备好上镜了</p>
      </div>

      <div
        className="flex shrink-0 justify-center gap-2 px-3 pt-3"
        role="tablist"
        aria-label="对比素人毛孩与出道定妆"
      >
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
          素人毛孩
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
          出道定妆
        </button>
      </div>

      <div className="relative mx-3 mt-2 flex min-h-0 flex-1 basis-0 overflow-hidden rounded-2xl bg-zinc-100 shadow-inner ring-1 ring-gray-200/80">
        <img
          src={heroSrc}
          alt={mode === 'result' ? '出道定妆照' : '素人毛孩原图'}
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
          <span className="block bg-slate-50 py-1 text-center text-[10px] font-semibold text-slate-600">
            素人毛孩
          </span>
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
          <span className="block bg-rose-50 py-1 text-center text-[10px] font-semibold text-rose-800">
            出道定妆
          </span>
          <div className="aspect-[4/3] w-full overflow-hidden bg-rose-100">
            <img src={result} alt="" className="h-full w-full object-cover" />
          </div>
        </button>
      </div>

      <div className="shrink-0 space-y-2 px-3 pt-1">
        <div className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-800/90">发抖音 · 复制文案</p>
          <pre className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[11px] leading-relaxed text-gray-800">
            {DEBUT_SHARE_CAPTION}
          </pre>
          <button
            type="button"
            onClick={handleCopyCaption}
            className="mt-2 w-full rounded-full border-2 border-rose-200 bg-white py-2 text-center text-xs font-bold text-rose-900 shadow-sm active:scale-[0.99]"
          >
            {copied ? '已复制到剪贴板' : '一键复制文案 + 话题'}
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-full bg-brand py-3.5 text-center text-sm font-bold text-white shadow-md active:scale-[0.99]"
        >
          再拍一条出道片
        </button>
        <p className="pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-[10px] text-gray-400">
          可长按上方大图尝试保存到相册（视系统与浏览器而定）
        </p>
      </div>
    </div>
  )
}
