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
  const [shareOpen, setShareOpen] = useState(false)
  const [shareToast, setShareToast] = useState('')

  const shareText = useMemo(() => buildDebutShareCaption(debutOutcome), [debutOutcome])
  const shareTitle = '这就是我家毛孩子的出道定妆'
  const shareSubtitle = '长按保存或一键分享给好友'

  const heroSrc = mode === 'result' ? result : original
  const modeLabel = mode === 'result' ? '出道定妆' : '素人毛孩'

  const imageUrl = useMemo(() => {
    try {
      return new URL(result, window.location.origin).toString()
    } catch {
      return result
    }
  }, [result])

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const showToast = (msg) => {
    setShareToast(msg)
    window.setTimeout(() => setShareToast(''), 1800)
  }

  const handleDownloadImage = async () => {
    try {
      const resp = await fetch(imageUrl)
      if (!resp.ok) throw new Error('download failed')
      const blob = await resp.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `furkid-debut-${Date.now()}.jpg`
      a.click()
      URL.revokeObjectURL(objectUrl)
      showToast('已开始下载到相册')
    } catch {
      showToast('下载失败，请长按图片保存')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl)
      showToast('已复制图片链接')
    } catch {
      showToast('复制失败，请稍后重试')
    }
  }

  const handleCopyShareCaption = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      showToast('已复制分享文案')
    } catch {
      showToast('复制失败，请稍后重试')
    }
  }

  const handleSocialGuide = (platform) => {
    showToast(`已为你准备好内容，请前往${platform}粘贴分享`)
  }

  const shareActions = [
    { key: 'douyin', label: '抖音好友', icon: '♪', bg: 'bg-black', onClick: () => handleSocialGuide('抖音') },
    { key: 'download', label: '下载至相册', icon: '↓', bg: 'bg-zinc-500', onClick: handleDownloadImage },
    { key: 'copy-link', label: '复制链接', icon: '🔗', bg: 'bg-sky-500', onClick: handleCopyLink },
    { key: 'wechat', label: '微信', icon: '微', bg: 'bg-emerald-500', onClick: () => handleSocialGuide('微信') },
    { key: 'moments', label: '朋友圈', icon: '圈', bg: 'bg-lime-500', onClick: () => handleSocialGuide('朋友圈') },
    { key: 'qzone', label: 'QQ空间', icon: 'Q', bg: 'bg-amber-500', onClick: () => handleSocialGuide('QQ空间') },
  ]

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
          <div className="flex w-full items-center justify-center">
            <div className="relative inline-block max-w-full rounded-2xl bg-zinc-100 shadow-inner ring-1 ring-gray-200/80">
              <img
                src={heroSrc}
                alt={mode === 'result' ? '出道定妆照' : '素人毛孩原图'}
                className="block max-h-[min(58vh,540px)] w-auto max-w-full rounded-2xl align-top"
                decoding="async"
              />
              {hasScore && mode === 'result' && (
                <>
                  <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/45 px-2.5 py-1 text-white backdrop-blur-sm">
                    <p className="text-[9px] font-semibold leading-none text-white/90">出道分</p>
                    <p className="mt-0.5 text-base font-black leading-none">{score}</p>
                  </div>
                  <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5">
                    <span className="rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {tierLabel}
                    </span>
                    <span className="rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {role.emoji}
                      {role.title}
                    </span>
                  </div>
                </>
              )}
              <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
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
            <p
              className="rounded-lg bg-violet-50/70 px-2 py-1.5 text-center text-sm font-semibold leading-snug text-violet-900"
              aria-label={`出道潜力指数 ${score} 分，档位 ${tierLabel}，角色 ${role.title}`}
            >
              今日人设：{role.emoji}
              {role.title} · {role.tagline}
            </p>
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
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="rounded-full border-2 border-rose-200 bg-white py-2 text-center text-xs font-bold text-rose-900 shadow-sm active:scale-[0.99]"
              >
                打开分享面板
              </button>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="rounded-full border-2 border-rose-200 bg-white py-2 text-center text-xs font-bold text-rose-900 shadow-sm active:scale-[0.99]"
              >
                {copied ? '已复制到剪贴板' : '一键复制文案'}
              </button>
            </div>
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

      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/45">
          <button
            type="button"
            aria-label="关闭分享面板"
            className="absolute inset-0"
            onClick={() => setShareOpen(false)}
          />
          <div className="relative flex h-full w-full flex-col justify-end p-3">
            <div className="mx-auto flex w-full max-w-[400px] max-h-[70vh] flex-col">
              <div className="mb-1.5 flex justify-center">
                <div className="w-full max-w-[292px] rounded-3xl bg-white p-2.5 shadow-2xl ring-1 ring-black/5">
                  <img
                    src={result}
                    alt="分享卡片预览"
                    className="h-auto max-h-[36vh] w-full rounded-2xl object-cover"
                  />
                  <p className="mt-1.5 text-center text-xs font-extrabold text-zinc-900">{shareTitle}</p>
                  <p className="mt-0.5 text-center text-[10px] text-zinc-500">{shareSubtitle}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-white px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-zinc-900">分享至</p>
                  <button
                    type="button"
                    onClick={() => setShareOpen(false)}
                    className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-500"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-y-2">
                  {shareActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      onClick={action.onClick}
                      className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-zinc-700 active:scale-[0.98]"
                    >
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold text-white ${action.bg}`}
                      >
                        {action.icon}
                      </span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopyShareCaption}
                  className="mt-2 w-full rounded-full border border-rose-200 bg-rose-50 py-1.5 text-[11px] font-bold text-rose-800"
                >
                  复制分享文案
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shareToast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium text-white">
          {shareToast}
        </div>
      )}
    </div>
  )
}
