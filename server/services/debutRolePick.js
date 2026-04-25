import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rolesPath = path.join(__dirname, '../../catalog/debutRoles.json')

let cached = null

function loadRolesDoc() {
  if (cached) return cached
  const raw = fs.readFileSync(rolesPath, 'utf8')
  cached = JSON.parse(raw)
  return cached
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

/** @param {string} str @returns {number} unsigned 32-bit */
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
 * @returns {{ title: string, tagline: string, emoji: string }}
 */
export function pickRole(tierId, selections) {
  const doc = loadRolesDoc()
  const tier = doc.tiers?.find((t) => t.id === tierId)
  const roles = tier?.roles?.length ? tier.roles : doc.tiers[0].roles
  const key = stableSelectionKey(selections) + `|tier:${tierId}`
  const idx = roles.length ? hashString(key) % roles.length : 0
  const role = roles[idx]
  return {
    title: role.title,
    tagline: role.tagline,
    emoji: role.emoji,
  }
}
