import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** 每张图是否已点赞（仅可点一次） */
const LS_LIKED_ONCE = 'furkid-debut-gallery-liked-once'
/** 每张图是否已收藏（仅可点一次） */
const LS_SAVED_ONCE = 'furkid-debut-gallery-saved-once'

function readFlags(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const o = JSON.parse(raw)
    return o && typeof o === 'object' ? o : {}
  } catch {
    return {}
  }
}

function writeFlags(key, map) {
  try {
    localStorage.setItem(key, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 点赞：未点为描边，已点为实色（不依赖 disabled 灰化） */
function LikeGlyph({ liked, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden
      fill={liked ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

/** 收藏：未点为描边星，已点为实色星 */
function StarGlyph({ saved, className }) {
  const d =
    'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={saved ? 0 : 1.35}
        strokeLinejoin="round"
        d={d}
      />
    </svg>
  )
}

/**
 * 生成等待时：他人作品「分享卡」样式（MVP 静态数据；点赞/收藏各图仅一次，本地持久化）
 */
export default function WaitGalleryOverlay({ open, items, onClose }) {
  const order = useMemo(() => shuffle(items || []), [items])
  const [index, setIndex] = useState(0)
  const [likedOnce, setLikedOnce] = useState(() => readFlags(LS_LIKED_ONCE))
  const [savedOnce, setSavedOnce] = useState(() => readFlags(LS_SAVED_ONCE))
  const openRef = useRef(open)

  useEffect(() => {
    if (open && !openRef.current) {
      setIndex(0)
      setLikedOnce(readFlags(LS_LIKED_ONCE))
      setSavedOnce(readFlags(LS_SAVED_ONCE))
    }
    openRef.current = open
  }, [open])

  const current = order[index] || null
  const liked = !!(current && likedOnce[current.id])
  const saved = !!(current && savedOnce[current.id])

  const onLike = useCallback(() => {
    if (!current || liked) return
    setLikedOnce((prev) => {
      const next = { ...prev, [current.id]: true }
      writeFlags(LS_LIKED_ONCE, next)
      return next
    })
  }, [current, liked])

  const onSave = useCallback(() => {
    if (!current || saved) return
    setSavedOnce((prev) => {
      const next = { ...prev, [current.id]: true }
      writeFlags(LS_SAVED_ONCE, next)
      return next
    })
  }, [current, saved])

  const nextCard = useCallback(() => {
    if (!order.length) return
    setIndex((i) => (i + 1) % order.length)
  }, [order.length])

  const prevCard = useCallback(() => {
    if (!order.length) return
    setIndex((i) => (i - 1 + order.length) % order.length)
  }, [order.length])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-8 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="别人的萌宠搭配"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="关闭背景"
        onClick={onClose}
      />
      <div className="relative z-[61] w-full max-w-[400px] overflow-hidden rounded-t-[1.25rem] rounded-b-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="max-h-[min(86dvh,640px)] overflow-y-auto">
          {current ? (
            <>
              {/* 分享卡上图：全宽铺满固定比例，object-cover 避免竖图两侧留白 */}
              <div className="relative w-full bg-zinc-100">
                <div className="relative aspect-[3/4] max-h-[min(52vh,480px)] w-full">
                  <img
                    src={current.imageUrl}
                    alt={current.caption || '萌宠搭配'}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-lg leading-none text-white shadow-md backdrop-blur-[2px] active:bg-black/55"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>

              {/* 分享卡下文：与上图分层，操作区无独立「按钮框」 */}
              <div className="border-t border-zinc-100/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                <p className="text-center text-[15px] font-semibold tracking-tight text-zinc-900">
                  {current.caption || '别人的萌宠搭配'}
                </p>
                <p className="mt-0.5 text-center text-[11px] text-zinc-400">萌宠出道 · 看看大家的搭配</p>

                <div className="mt-4 flex items-stretch border-t border-zinc-100 pt-3">
                  <button
                    type="button"
                    onClick={prevCard}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 text-zinc-500 transition active:scale-[0.97] active:text-zinc-700"
                  >
                    <span className="text-[18px] leading-none" aria-hidden>
                      ◀
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-700">上一个</span>
                  </button>

                  <div className="w-px shrink-0 self-stretch bg-zinc-100" aria-hidden />

                  <button
                    type="button"
                    onClick={onLike}
                    aria-pressed={liked}
                    aria-disabled={liked}
                    className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 transition active:scale-[0.97] ${
                      liked ? 'cursor-default text-rose-500' : 'cursor-pointer text-zinc-500 active:text-zinc-700'
                    }`}
                  >
                    <LikeGlyph liked={liked} className="shrink-0" />
                    <span className={`text-[10px] font-semibold ${liked ? 'text-rose-600' : 'text-zinc-700'}`}>
                      {liked ? '已点赞' : '点赞'}
                    </span>
                  </button>

                  <div className="w-px shrink-0 self-stretch bg-zinc-100" aria-hidden />

                  <button
                    type="button"
                    onClick={onSave}
                    aria-pressed={saved}
                    aria-disabled={saved}
                    className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 transition active:scale-[0.97] ${
                      saved ? 'cursor-default text-amber-500' : 'cursor-pointer text-zinc-500 active:text-zinc-700'
                    }`}
                  >
                    <StarGlyph saved={saved} className="shrink-0" />
                    <span className={`text-[10px] font-semibold ${saved ? 'text-amber-700' : 'text-zinc-700'}`}>
                      {saved ? '已收藏' : '收藏'}
                    </span>
                  </button>

                  <div className="w-px shrink-0 self-stretch bg-zinc-100" aria-hidden />

                  <button
                    type="button"
                    onClick={nextCard}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 text-zinc-500 transition active:scale-[0.97] active:text-zinc-700"
                  >
                    <span className="text-[18px] leading-none" aria-hidden>
                      ▶
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-700">下一个</span>
                    <span className="text-[9px] font-medium tabular-nums text-zinc-400">
                      {index + 1}/{order.length}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">暂无展示图</div>
          )}
        </div>
      </div>
    </div>
  )
}
