import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rolesPath = path.join(__dirname, '../../catalog/debutRoles.json')

let cached = null

function loadRolesDoc() {
  if (cached) return cached
  cached = JSON.parse(fs.readFileSync(rolesPath, 'utf8'))
  return cached
}

// Map primary look to preferred role keywords for better style matching
const LOOK_ROLE_HINTS = {
  sweet:               ['甜妹', '软萌', '甜系', '可爱', '公主', '仙'],
  'daily-energy':      ['元气', '活力', '阳光', '少年', '日常', '清新'],
  'street-sweet-cool': ['甜酷', '酷盖', 'Rapper', '街头', '拽', '潮'],
  'gentle-lazy':       ['慵懒', '温柔', '氛围', '松弛', '治愈', '佛系'],
  luxury:              ['贵气', '女王', '主唱', '清冷', '优雅', '高定'],
  boss:                ['霸总', '酷盖', 'CEO', '大佬', '冷', '帅'],
}

function stableSelectionKey(selections) {
  const list = Array.isArray(selections) ? selections : []
  const sorted = [...list].sort((a, b) => {
    const c = String(a.categoryId).localeCompare(String(b.categoryId))
    if (c !== 0) return c
    return String(a.itemId).localeCompare(String(b.itemId))
  })
  return sorted.map((s) => `${s.categoryId}:${s.itemId}`).join('|')
}

function hashString(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i)
  }
  return h >>> 0
}

/**
 * @param {string} tierId
 * @param {{ categoryId: string, itemId: string }[]} selections
 * @param {string|null} primaryLookId
 * @returns {{ title: string, tagline: string, emoji: string }}
 */
export function pickRole(tierId, selections, primaryLookId = null) {
  const doc = loadRolesDoc()
  const tier = doc.tiers?.find((t) => t.id === tierId)
  const roles = tier?.roles?.length ? tier.roles : doc.tiers[0].roles
  const key = stableSelectionKey(selections) + `|tier:${tierId}`

  // If we know the primary look, try to pick a role that matches its vibe
  if (primaryLookId) {
    const hints = LOOK_ROLE_HINTS[primaryLookId]
    if (hints && hints.length > 0) {
      // Find roles whose title matches any hint keyword
      const matched = roles.filter((r) =>
        hints.some((kw) => r.title.includes(kw) || r.tagline.includes(kw))
      )
      if (matched.length > 0) {
        const idx = hashString(key + `|look:${primaryLookId}`) % matched.length
        return matched[idx]
      }
    }
  }

  // Fallback: original hash-based selection
  const idx = roles.length ? hashString(key) % roles.length : 0
  return roles[idx]
}
