import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const catalogPath = path.join(__dirname, '../../catalog/itemCatalog.json')

// Style distance matrix: 0 = identical vibe, 1 = completely clashing
// 甜美↔元气 close, 贵气↔慵懒 close, 甜酷 isolated, 霸总 far from all
const STYLE_DIST = {
  sweet:               { sweet: 0,   'daily-energy': 0.2, 'street-sweet-cool': 0.4, 'gentle-lazy': 0.5, luxury: 0.6, boss: 0.9 },
  'daily-energy':      { sweet: 0.2, 'daily-energy': 0,   'street-sweet-cool': 0.3, 'gentle-lazy': 0.4, luxury: 0.7, boss: 0.8 },
  'street-sweet-cool': { sweet: 0.4, 'daily-energy': 0.3, 'street-sweet-cool': 0,   'gentle-lazy': 0.6, luxury: 0.5, boss: 0.7 },
  'gentle-lazy':       { sweet: 0.5, 'daily-energy': 0.4, 'street-sweet-cool': 0.6, 'gentle-lazy': 0,   luxury: 0.2, boss: 0.8 },
  luxury:              { sweet: 0.6, 'daily-energy': 0.7, 'street-sweet-cool': 0.5, 'gentle-lazy': 0.2, luxury: 0,   boss: 0.7 },
  boss:                { sweet: 0.9, 'daily-energy': 0.8, 'street-sweet-cool': 0.7, 'gentle-lazy': 0.8, luxury: 0.7, boss: 0 },
}

const TIER_BANDS = [
  { max: 59, id: 'trainee', label: '练习生' },
  { max: 69, id: 'backup', label: '预备役' },
  { max: 79, id: 'rising', label: '上升期新人' },
  { max: 89, id: 'center', label: '准 C 位' },
  { max: 100, id: 'diva', label: '本番出道' },
]

let cached = null
function loadCatalog() {
  if (cached) return cached
  cached = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
  return cached
}

/**
 * @param {{ categoryId: string, itemId: string }[]} selections
 * @returns {{ score: number, tierId: string, tierLabel: string, primaryLookId: string|null }}
 */
export function scoreSelections(selections) {
  const catalog = loadCatalog()
  const looks = catalog.recommendedLooks || []
  const list = Array.isArray(selections) ? selections : []
  const N = list.length

  if (N === 0) {
    const { id: tierId, label: tierLabel } = tierFromScore(15)
    return { score: 15, tierId, tierLabel, primaryLookId: null }
  }

  // Each item belongs to exactly one look (zero-overlap design)
  const itemToLook = {}
  const lookSizes = {}
  for (const look of looks) {
    lookSizes[look.id] = look.items.length
    for (const item of look.items) {
      itemToLook[`${item.categoryId}:${item.itemId}`] = look.id
    }
  }

  // Count how many user selections fall into each look
  const counts = {}
  for (const s of list) {
    const lookId = itemToLook[`${s.categoryId}:${s.itemId}`]
    if (lookId) counts[lookId] = (counts[lookId] || 0) + 1
  }

  // Primary look = the one with the most matched items
  let primaryLookId = null
  let primaryCount = 0
  for (const [lookId, count] of Object.entries(counts)) {
    if (count > primaryCount) {
      primaryCount = count
      primaryLookId = lookId
    }
  }

  if (!primaryLookId) {
    const { id: tierId, label: tierLabel } = tierFromScore(20)
    return { score: 20, tierId, tierLabel, primaryLookId: null }
  }

  // --- Element Score (0-60) ---
  // completeness: fraction of the primary look's items that user selected
  // purity: fraction of user's total items that belong to the primary look
  // volume: encourage picking more items
  const primarySize = lookSizes[primaryLookId] || 1
  const completeness = primaryCount / primarySize
  const purity = primaryCount / N
  const volume = Math.min(1, N / 4)

  const elementScore = (completeness * 0.4 + purity * 0.3 + volume * 0.3) * 60

  // --- Style Consistency Score (0-40) ---
  let styleScore = 40
  const activeLooks = Object.keys(counts)

  if (activeLooks.length > 1) {
    const distMap = STYLE_DIST[primaryLookId] || {}
    let totalWeightedDist = 0
    let totalWeight = 0

    for (const lookId of activeLooks) {
      if (lookId === primaryLookId) continue
      const w = counts[lookId]
      totalWeightedDist += w * (distMap[lookId] ?? 0.5)
      totalWeight += w
    }

    const avgDist = totalWeight > 0 ? totalWeightedDist / totalWeight : 0
    const scatterRatio = (N - primaryCount) / N
    styleScore = (1 - scatterRatio * avgDist) * 40
  }

  let score = Math.round(elementScore + styleScore)
  score = Math.max(0, Math.min(100, score))

  const { id: tierId, label: tierLabel } = tierFromScore(score)
  return { score, tierId, tierLabel, primaryLookId }
}

export function tierFromScore(score) {
  for (const band of TIER_BANDS) {
    if (score <= band.max) return { id: band.id, label: band.label }
  }
  return { id: TIER_BANDS[TIER_BANDS.length - 1].id, label: TIER_BANDS[TIER_BANDS.length - 1].label }
}
