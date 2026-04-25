/**
 * 出道潜力分（双轨）
 * - rawScore：规则原始分，用于内部区分度与映射区间
 * - displayScore（API 字段 debutScore）：映射到 80–100，满足「最低 80」展示需求
 * 档位与角色池仍用 tierId，现按 displayScore 分档（与对外分数一致）
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const catalogPath = path.join(__dirname, '../../catalog/itemCatalog.json')

const CATEGORY_BASE = {
  makeup: 12,
  headwear: 10,
  styling: 10,
  clothing: 14,
}

const ALL_CATEGORIES = ['headwear', 'makeup', 'styling', 'clothing']

/** 对外展示分区间 */
const DISPLAY_MIN = 80
const DISPLAY_MAX = 100

/** 按展示分（80–100）分档，tier id 与 debutRoles.json 对齐 */
const TIER_BANDS_DISPLAY = [
  { max: 82, id: 'trainee', label: '练习生' },
  { max: 86, id: 'backup', label: '预备役' },
  { max: 90, id: 'rising', label: '上升期新人' },
  { max: 94, id: 'center', label: '准 C 位' },
  { max: 100, id: 'diva', label: '本番出道' },
]

const DEFAULT_ITEM_SCORE = 8

function loadCatalogLimits() {
  const raw = fs.readFileSync(catalogPath, 'utf8')
  const doc = JSON.parse(raw)
  const maxPer = doc.maxPerCategory || {}
  const limits = {}
  for (const c of ALL_CATEGORIES) {
    limits[c] = Math.max(0, Number(maxPer[c]) || 0)
  }
  return limits
}

/**
 * 在给定每类件数上限下，规则能达到的理论 raw 区间（用于展示分映射）
 */
export function computeRawScoreRange() {
  const limits = loadCatalogLimits()
  let rawMax = 0

  for (const c of ALL_CATEGORIES) {
    const n = limits[c]
    const base = CATEGORY_BASE[c]
    if (base !== undefined && n > 0) rawMax += base * n
  }
  const maxMakeup = limits.makeup
  const allFourReachable = ALL_CATEGORIES.every((c) => limits[c] >= 1)
  if (allFourReachable) rawMax += 10
  if (maxMakeup >= 2) rawMax += 5
  if (maxMakeup >= 3) rawMax += 3

  /**
   * 展示分映射下沿固定为 15：与 `scoreSelections` 中空选择的兜底 raw 对齐，
   * 使「未选」稳定落在展示分 80，任意有效加分从 80 起单调上升。
   */
  const rawMin = 15

  return { rawMin, rawMax, limits }
}

/**
 * @param {{ categoryId: string, itemId: string }[]} selections
 * @returns {{ rawScore: number, score: number, tierId: string, tierLabel: string }}
 * `score` 为对外展示分（80–100），与历史字段名一致供 computeDebutOutcome 使用
 */
export function scoreSelections(selections) {
  const list = Array.isArray(selections) ? selections : []
  const limits = loadCatalogLimits()

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

  let rawScore = Math.round(raw)
  if (list.length === 0) {
    rawScore = Math.max(rawScore, 15)
  }
  rawScore = Math.max(0, Math.min(1000, rawScore))

  const { rawMin, rawMax } = computeRawScoreRange()
  const lo = rawMin
  const hi = Math.max(lo, rawMax)
  let displayScore = DISPLAY_MIN
  if (rawScore <= lo) {
    displayScore = DISPLAY_MIN
  } else {
    const denom = hi - lo
    if (denom > 0) {
      const t = (rawScore - lo) / denom
      displayScore = DISPLAY_MIN + Math.round(t * (DISPLAY_MAX - DISPLAY_MIN))
    } else {
      displayScore = DISPLAY_MAX
    }
  }
  displayScore = Math.max(DISPLAY_MIN, Math.min(DISPLAY_MAX, displayScore))

  const { id: tierId, label: tierLabel } = tierFromDisplayScore(displayScore)
  return { rawScore, score: displayScore, tierId, tierLabel }
}

/**
 * @param {number} displayScore 80–100
 */
export function tierFromDisplayScore(displayScore) {
  for (const band of TIER_BANDS_DISPLAY) {
    if (displayScore <= band.max) {
      return { id: band.id, label: band.label }
    }
  }
  return {
    id: TIER_BANDS_DISPLAY[TIER_BANDS_DISPLAY.length - 1].id,
    label: TIER_BANDS_DISPLAY[TIER_BANDS_DISPLAY.length - 1].label,
  }
}

/** @deprecated 旧接口按 0–100 raw 分档；保留导出避免外部误用时可查 */
export function tierFromScore(score) {
  return tierFromDisplayScore(Math.max(DISPLAY_MIN, Math.min(DISPLAY_MAX, score)))
}
