import { useEffect, useMemo, useState } from 'react'

const SHARE_TAGS = '#毛孩子出道计划 #出道潜力分 #萌宠出道 #抖音萌宠'

const SHARE_FALLBACK = `我家毛孩子今天先出道为敬，围观请自带小鱼干～\n${SHARE_TAGS}`

const ARTIST_NAME_SUGGESTIONS = ['奶糖', '旺财', '雪饼', '波波', '可乐', '糯米', '麦麦', 'Lucky']

/**
 * @param {{ debutScore: number, debutTierId?: string, debutTierLabel: string, debutRole: { title: string, tagline: string, emoji: string } }} o
 * @param {string} petName
 */
export function buildDebutShareCaption(o, petName = '') {
  if (!o || typeof o.debutScore !== 'number' || !o.debutRole?.title) return SHARE_FALLBACK
  const score = Math.round(o.debutScore)
  const tierLabel = o.debutTierLabel || '神秘段位'
  const tierKey = o.debutTierId || ''
  const { emoji, title, tagline } = o.debutRole
  const who = petName.trim() ? `「${petName.trim()}」` : '毛孩子'

  const pick = (arr, salt = 0) => arr[(score + salt + title.length) % arr.length]

  const mains = [
    `救命，${who}潜力${score}分「${tierLabel}」这也太会了：${emoji}${title}，${tagline}`,
    `我家${who}潜力${score}（${tierLabel}）——${emoji}${title}现场直拍：${tagline}`,
    `抽查抖音潜力股：${who}${score}分，段位${tierLabel}。${emoji}${title}：${tagline}`,
    `不是滤镜，是硬可爱：${who}潜力${score}「${tierLabel}」${emoji}${title}，${tagline}`,
    `先报分数再报梗：${who}${score}分（${tierLabel}）${emoji}${title}，${tagline}`,
    `潜力${score}分「${tierLabel}」已写脸上，${who}${emoji}${title}：${tagline}`,
  ]

  const zingers = [
    '看完别装路人，下一个爆款预定就是我家的。',
    '评论区留给各位「影帝影后」的毛孩子，我先笑为敬。',
    '声明：本条含猫/狗量超标，刷到算你赚到。',
    '饭可以加，C 位也可以让，可爱这块我家先锁了。',
    '热搜有没有我不知道，反正村口大喇叭已经在我脑子里响了。',
    '建议立刻点赞收藏，不然算法以为你不爱看可爱的（那多可惜）。',
    '发完这条我去给主子加鸡腿：孩子半场开香槟，我先开为敬。',
    '别问怎么养的，问就是天生吃这碗饭，别的不会就会萌。',
  ]

  const tierZing = {
    trainee: ['练习生籍籍无名但戏很足，先混个脸熟。', '还在实习期，主打一个「明天一定努力」。'],
    backup: ['预备役也是役，认真起来我自己都怕。', '离 C 位还差一口气（和三条小鱼干）。'],
    rising: ['上升期新人，主打一个潜力股「先上车再补票」。', '热搜词条我都想好了，就差本人点头。'],
    center: ['准 C 位，九宫格中间帮我留个坑谢谢。', '直拍万转那种，滤镜麻烦先开最大。'],
    diva: ['本番出道，闪光灯自便，我先闪了（物理）。', '顶流体验券已核销，请各位让让镜头。'],
  }
  const tierLines = tierZing[tierKey] || tierZing.trainee
  const tierLine = pick(tierLines, tierKey.length)

  const main = pick(mains, hashStr(tierKey))
  const zing = pick(zingers, hashStr(title))

  return `${main}\n${tierLine}\n${zing}\n\n${SHARE_TAGS}`
}

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 33 + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * @param {{
 *   original: string,
 *   result: string,
 *   debutOutcome: { debutScore: number, debutScoreRaw?: number, debutTierId: string, debutTierLabel: string, debutRole: { title: string, tagline: string, emoji: string } } | null,
 *   petName?: string,
 *   onPetNameChange?: (name: string) => void,
 *   onReset: () => void,
 * }} props
 */
export default function ResultView({
  original,
  result,
  debutOutcome = null,
  petName = '',
  onPetNameChange,
  onReset,
}) {
  const [mode, setMode] = useState('result')
  const [shareOpen, setShareOpen] = useState(false)
  const [rankOpen, setRankOpen] = useState(false)
  const [shareToast, setShareToast] = useState('')
  const [stampIn, setStampIn] = useState(false)
  const [nameDraft, setNameDraft] = useState(petName || '')

  const displayPetName = nameDraft.trim() ? `「${nameDraft.trim()}」` : '毛孩子'
  const shareText = useMemo(
    () => buildDebutShareCaption(debutOutcome, nameDraft),
    [debutOutcome, nameDraft]
  )
  const shareTitle = `这就是我家${displayPetName}的出道定妆`
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
  const leaderboardRows = useMemo(() => {
    const rows = [
      { name: '「奶糖」', score: 96, tier: '本番出道' },
      { name: '「旺财」', score: 94, tier: '准 C 位' },
      { name: '「Mochi」', score: 92, tier: '准 C 位' },
      { name: '「可乐」', score: 90, tier: '上升期新人' },
    ]
    if (hasScore) {
      rows.push({
        name: displayPetName,
        score: Math.round(score),
        tier: tierLabel || '上升期新人',
      })
    }
    return rows.sort((a, b) => b.score - a.score).slice(0, 5)
  }, [displayPetName, hasScore, score, tierLabel])

  useEffect(() => {
    if (!(hasScore && mode === 'result')) return undefined
    setStampIn(false)
    const raf = window.requestAnimationFrame(() => setStampIn(true))
    return () => window.cancelAnimationFrame(raf)
  }, [hasScore, mode, result])

  useEffect(() => {
    setNameDraft(petName || '')
  }, [petName])

  useEffect(() => {
    onPetNameChange?.(nameDraft.trim())
  }, [nameDraft, onPetNameChange])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* 固定顶栏：压缩留白，主图整体上移 */}
      <div className="shrink-0 border-b border-gray-100 px-1 py-1.5 text-center">
        <h2 className="text-base font-extrabold leading-tight text-brand">{displayPetName}出道定妆照已就绪</h2>
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
                  <div className="pointer-events-none absolute left-2 top-2">
                    <span className="tag-art inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md ring-1 ring-white/40">
                      {tierLabel}
                    </span>
                  </div>
                  <div className="pointer-events-none absolute right-2 top-2 flex max-w-[58%] flex-col items-end gap-1">
                    <span className="tag-art inline-flex max-w-full items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-bold leading-tight text-white shadow-md ring-1 ring-white/40">
                      <span className="shrink-0 text-[13px] leading-none" aria-hidden>
                        {role.emoji}
                      </span>
                      <span className="min-w-0 truncate">{role.title}</span>
                    </span>
                  </div>
                  <div
                    className={`pointer-events-none absolute bottom-2 right-2 rounded-full border-[3px] border-rose-100 bg-rose-600/92 px-3 py-2 text-center text-white shadow-xl transition-all duration-500 ${
                      stampIn
                        ? 'translate-y-0 rotate-[-10deg] scale-100 opacity-100'
                        : 'translate-y-2 rotate-[-18deg] scale-150 opacity-0'
                    }`}
                  >
                    <p className="text-[8px] font-bold tracking-[0.12em] text-rose-100">出道认证</p>
                    <p className="mt-0.5 text-lg font-black tabular-nums leading-none">{score}</p>
                  </div>
                </>
              )}
              <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-full border border-white/25 bg-zinc-900/55 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur-sm">
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
              <div className="relative flex h-[min(34vh,240px)] w-full items-center justify-center overflow-hidden bg-slate-200">
                <img src={original} alt="" className="max-h-full max-w-full object-contain" />
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
              <div className="relative flex h-[min(34vh,240px)] w-full items-center justify-center overflow-hidden bg-rose-100">
                <img src={result} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            </button>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-800/90">发抖音 · 复制文案</p>
            <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-[11px] leading-relaxed text-gray-800">
              {shareText}
            </pre>
          </div>

          <div className="rounded-xl border border-rose-100 bg-white px-3 py-2.5">
            <p className="text-[11px] font-semibold text-rose-900">给毛孩子取个艺名（可选）</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">起名后可参与热门榜展示，也会带入分享文案。</p>
            <div className="mt-1.5 flex gap-1.5">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value.slice(0, 12))}
                placeholder="例如：奶糖 / 旺财 / Mochi"
                className="min-w-0 flex-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-rose-300"
              />
              <button
                type="button"
                onClick={() =>
                  setNameDraft(
                    ARTIST_NAME_SUGGESTIONS[Math.floor(Math.random() * ARTIST_NAME_SUGGESTIONS.length)]
                  )
                }
                className="shrink-0 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 active:scale-[0.98]"
              >
                随机艺名
              </button>
            </div>
          </div>

          <div className="mt-0.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="rounded-full border-2 border-rose-200 bg-white py-2 text-center text-xs font-bold text-rose-900 shadow-sm active:scale-[0.99]"
              >
                打开分享面板
              </button>
              <button
                type="button"
                onClick={() => setRankOpen(true)}
                className="rounded-full border-2 border-rose-200 bg-white py-2 text-center text-xs font-bold text-rose-900 shadow-sm active:scale-[0.99]"
              >
                查看热门榜
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

      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/45">
          <button
            type="button"
            aria-label="关闭分享面板"
            className="absolute inset-0"
            onClick={() => setShareOpen(false)}
          />
          <div className="relative flex h-full w-full flex-col justify-end p-3">
            <div className="mx-auto flex w-full max-w-[400px] max-h-[84vh] flex-col overflow-y-auto">
              <div className="mb-1.5 flex justify-center">
                <div className="w-full max-w-[292px] rounded-3xl bg-white p-2.5 shadow-2xl ring-1 ring-black/5">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900/80">
                    <img
                      src={result}
                      alt="分享卡片预览"
                      className="h-full w-full object-contain"
                    />
                    {hasScore && (
                      <>
                        <span className="tag-art pointer-events-none absolute left-2 top-2 inline-flex items-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-1 text-[9px] font-extrabold text-white shadow-md ring-1 ring-white/40">
                          {tierLabel}
                        </span>
                        <span className="tag-art pointer-events-none absolute right-2 top-2 inline-flex max-w-[58%] items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2 py-1 text-[9px] font-bold text-white shadow-md ring-1 ring-white/40">
                          <span className="shrink-0 text-[11px] leading-none" aria-hidden>
                            {role.emoji}
                          </span>
                          <span className="min-w-0 truncate">{role.title}</span>
                        </span>
                        <span className="pointer-events-none absolute bottom-2 right-2 rounded-full border-2 border-rose-100 bg-rose-600/92 px-2.5 py-1.5 text-center text-white shadow-lg">
                          <span className="block text-[7px] font-bold tracking-[0.12em] text-rose-100">
                            出道认证
                          </span>
                          <span className="mt-0.5 block text-[16px] font-black tabular-nums leading-none">
                            {score}
                          </span>
                        </span>
                      </>
                    )}
                    <span className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-white/25 bg-zinc-900/55 px-2 py-0.5 text-[9px] font-bold text-white shadow-md backdrop-blur-sm">
                      当前 · 出道定妆
                    </span>
                  </div>
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
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-600 shadow-sm active:bg-zinc-200"
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

      {rankOpen && (
        <div className="fixed inset-0 z-50 bg-black/45">
          <button
            type="button"
            aria-label="关闭热门榜"
            className="absolute inset-0"
            onClick={() => setRankOpen(false)}
          />
          <div className="relative flex h-full w-full items-end justify-center p-3 sm:items-center">
            <div className="w-full max-w-[380px] rounded-3xl bg-white p-4 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-base font-black text-rose-900">本周热门榜</p>
                <button
                  type="button"
                  onClick={() => setRankOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-600"
                >
                  ×
                </button>
              </div>
              <p className="mb-2 text-[11px] text-zinc-500">榜单会根据出道分、人气互动综合更新。</p>
              <div className="space-y-1.5">
                {leaderboardRows.map((row, idx) => (
                  <div
                    key={`${row.name}-${row.score}-${idx}`}
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${
                      idx === 0 ? 'bg-amber-50' : 'bg-zinc-50'
                    }`}
                  >
                    <span className="w-5 text-center text-sm font-black text-zinc-500">{idx + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">{row.name}</span>
                    <span className="text-[11px] font-bold text-zinc-500">{row.tier}</span>
                    <span className="w-10 text-right text-sm font-black text-rose-700">{row.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
