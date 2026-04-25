import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const catalogPath = path.join(__dirname, '../../catalog/itemCatalog.json')
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

/** @typedef {{ categoryId: string, itemId: string }} Selection */

function findItem(categoryId, itemId) {
  const list = catalog.items[categoryId]
  if (!list) return null
  return list.find((i) => i.id === itemId) || null
}

/**
 * @param {Selection[]} selections
 * @returns {string}
 */
export function buildDebutPrompt(selections) {
  const byCat = { headwear: [], makeup: [], styling: [], clothing: [] }
  for (const s of selections || []) {
    const item = findItem(s.categoryId, s.itemId)
    if (item?.prompt) byCat[s.categoryId].push(item.prompt)
  }

  const lines = []
  if (byCat.headwear.length) lines.push(`Headwear: ${byCat.headwear.join(', ')}.`)
  if (byCat.makeup.length) lines.push(`Makeup / face accents: ${byCat.makeup.join(', ')}.`)
  if (byCat.styling.length) lines.push(`Fur styling: ${byCat.styling.join(', ')}.`)
  if (byCat.clothing.length) lines.push(`Clothing / accessories: ${byCat.clothing.join(', ')}.`)

  const stylingBlock =
    lines.length > 0
      ? `Apply the following as one cohesive debut-ready pet look (spotlight polish for a reveal moment, not a generic beauty filter):\n${lines.join('\n')}`
      : 'Enhance the pet photo with subtle debut-poster polish: studio key light, depth, and fur detail (no drastic identity change).'

  return [
    'Keep the same pet species, identity, and overall pose from the input photo.',
    'Photorealistic lighting, soft shadows, high detail fur texture.',
    'Creative direction: vertical short-form cover or K-pop-style debut teaser still—gentle spotlight and rim light, stage-ready portrait mood; stay photorealistic, avoid full cartoon or illustration.',
    stylingBlock,
    'Vertical composition for mobile screens, with a modest clean band of negative space (top or bottom) suitable for optional captions later—do not render any text, letters, logos, or watermarks in the image.',
  ].join(' ')
}

export function getCatalog() {
  return catalog
}
