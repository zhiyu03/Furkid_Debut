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
      ? `Apply the following as one cohesive cute pet makeover:\n${lines.join('\n')}`
      : 'Enhance the pet photo with a subtle polished studio-ready look (no drastic identity change).'

  return [
    'Keep the same pet species, identity, and overall pose from the input photo.',
    'Photorealistic lighting, soft shadows, high detail fur texture.',
    stylingBlock,
    'Vertical composition friendly for mobile screens.',
  ].join(' ')
}

export function getCatalog() {
  return catalog
}
