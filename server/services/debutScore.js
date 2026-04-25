/**
 * 阶段 1：按 catalog 选择规则计算出道潜力分与档位（娱乐向，非视觉识妆）。
 */

const CATEGORY_BASE = {
  makeup: 12,
  headwear: 10,
  styling: 10,
  clothing: 14,
}

const ALL_CATEGORIES = ['headwear', 'makeup', 'styling', 'clothing']

const TIER_BANDS = [
  { max: 34, id: 'trainee', label: '练习生' },
  { max: 54, id: 'backup', label: '预备役' },
  { max: 69, id: 'rising', label: '上升期新人' },
  { max: 84, id: 'center', label: '准 C 位' },
  { max: 100, id: 'diva', label: '本番出道' },
]

const DEFAULT_ITEM_SCORE = 8

/**
 * @param {{ categoryId: string, itemId: string }[]} selections
 * @returns {{ score: number, tierId: string, tierLabel: string }}
 */
export function scoreSelections(selections) {
  const list = Array.isArray(selections) ? selections : []
  let raw = 0

  for (const s of list) {
    const cat = s.categoryId
    const base = CATEGORY_BASE[cat]
    if (base === undefined) {
      console.warn(`[debutScore] unknown categoryId: ${cat}, using default ${DEFAULT_ITEM_SCORE}`)
      raw += DEFAULT_ITEM_SCORE
    } else {
      raw += base
    }
  }

  const byCat = {}
  for (const c of ALL_CATEGORIES) {
    byCat[c] = list.filter((s) => s.categoryId === c).length
  }

  const hasAllFour = ALL_CATEGORIES.every((c) => byCat[c] >= 1)
  if (hasAllFour) raw += 10

  const makeupCount = byCat.makeup
  if (makeupCount >= 2) raw += 5
  if (makeupCount >= 3) raw += 3

  let score = Math.round(raw)
  if (list.length === 0) {
    score = Math.max(score, 15)
  }
  score = Math.max(0, Math.min(100, score))

  const { id: tierId, label: tierLabel } = tierFromScore(score)
  return { score, tierId, tierLabel }
}

/**
 * @param {number} score
 * @returns {{ id: string, label: string }}
 */
export function tierFromScore(score) {
  for (const band of TIER_BANDS) {
    if (score <= band.max) {
      return { id: band.id, label: band.label }
    }
  }
  return { id: TIER_BANDS[TIER_BANDS.length - 1].id, label: TIER_BANDS[TIER_BANDS.length - 1].label }
}
