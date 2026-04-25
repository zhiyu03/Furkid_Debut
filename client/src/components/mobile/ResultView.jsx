import { useMemo, useState } from 'react'

const SHARE_FALLBACK =
  '我家毛孩子今天 C 位出道！快来围观～\n#毛孩子出道计划 #萌宠出道 #宠物变装 #抖音萌宠'

/**
 * @param {{ debutScore: number, debutTierLabel: string, debutRole: { title: string, tagline: string, emoji: string } }} o
 */
export function buildDebutShareCaption(o) {
  if (!o || typeof o.debutScore !== 'number' || !o.debutRole?.title) return SHARE_FALLBACK
  const { emoji, title, tagline } = o.debutRole
  return `我家毛孩子出道潜力${o.debutScore}分（${o.debutTierLabel}）——今日人设：${emoji}${title}！${tagline}\n#毛孩子出道计划 #出道潜力分 #萌宠出道 #抖音萌宠`
}

/**
 * @param {{
 *   original: string,
 *   result: string,
 *   debutOutcome: { debutScore: number, debutTierId: string, debutTierLabel: string, debutRole: { title: string, tagline: string, emoji: string } } | null,
 *   onReset: () => void,
 * }} props
 */
export default function ResultView({ original, result, debutOutcome = null, onReset }) {
  const [mode, setMode] = useState('result')
  const [copied, setCopied] = useState(false)

  const shareText = useMemo(() => buildDebutShareCaption(debutOutcome), [debutOutcome])

  const heroSrc = mode === 'result' ? result : original
  const modeLabel = mode === 'result' ? '出道定妆' : '素人毛孩'

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const score = debutOutcome?.debutScore
  const tierLabel = debutOutcome?.debutTierLabel
  const role = debutOutcome?.debutRole
  const hasScore = typeof score === 'number' && role

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* 固定顶栏：压缩留白，主图整体上移 */}
      <div className="shrink-0 border-b border-gray-100 px-1 py-1.5 text-center">
        <h2 className="text-base font-extrabold leading-tight text-brand">出道定妆照已就绪</h2>
        <p className="mt-0.5 text-[11px] leading-tight text-gray-500">准备好上镜了</p>
      </div>

      {/* 单页滚动：大图、Tab、分数卡顺序向下，一起上移，无层叠 */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-3 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex w-full justify-center">
            <div className="relative inline-block max-w-full rounded-2xl bg-zinc-100 shadow-inner ring-1 ring-gray-200/80">
              <img
                src={heroSrc}
                alt={mode === 'result' ? '出道定妆照' : '素人毛孩原图'}
                className="block max-h-[min(58vh,540px)] w-auto max-w-full rounded-2xl align-top"
                decoding="async"
              />
              <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                当前 · {modeLabel}
              </span>
            </div>
          </div>

          <div
            className="relative z-20 flex shrink-0 justify-center gap-2"
            role="tablist"
            aria-label="对比素人毛孩与出道定妆"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'original'}
              onClick={() => setMode('original')}
              className={`rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition ${
                mode === 'original'
                  ? 'bg-gradient-to-br from-violet-100 to-fuchsia-100 text-purple-900 ring-2 ring-purple-400'
                  : 'border-2 border-gray-200 bg-white text-slate-600'
              }`}
            >
              素人毛孩
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'result'}
              onClick={() => setMode('result')}
              className={`rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition ${
                mode === 'result'
                  ? 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-900 ring-2 ring-brand'
                  : 'border-2 border-gray-200 bg-white text-slate-600'
              }`}
            >
              出道定妆
            </button>
          </div>

          {hasScore && (
            <div
              className="relative z-0"
              aria-label={`出道潜力指数 ${score} 分，档位 ${tierLabel}，角色 ${role.title}`}
            >
              <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/80 px-3 py-2.5 shadow-sm">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-800/80">
                      出道潜力指数
                    </p>
                    <p className="text-2xl font-black tabular-nums text-violet-950">{score}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-violet-900 ring-1 ring-violet-200">
                    {tierLabel}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="mt-3 rounded-lg border border-white/60 bg-white/50 px-2.5 py-2">
                  <p className="text-[10px] font-semibold text-gray-500">今日出道人设</p>
                  <p className="mt-0.5 text-sm font-extrabold text-gray-900">
                    <span className="mr-1">{role.emoji}</span>
                    {role.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-gray-600">{role.tagline}</p>
                </div>
                <p className="mt-2 text-[9px] leading-relaxed text-gray-400">
                  娱乐向规则评分，根据你的装扮选择计算，非专业评审或视觉识妆。
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
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
              <div className="aspect-[5/3] w-full overflow-hidden bg-slate-200">
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
              <div className="aspect-[5/3] w-full overflow-hidden bg-rose-100">
                <img src={result} alt="" className="h-full w-full object-cover" />
              </div>
            </button>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-800/90">发抖音 · 复制文案</p>
            <pre className="mt-1 max-h-20 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[11px] leading-relaxed text-gray-800">
              {shareText}
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
          <p className="text-center text-[10px] text-gray-400">
            可长按上方大图尝试保存到相册（视系统与浏览器而定）
          </p>
        </div>
      </div>
    </div>
  )
}
