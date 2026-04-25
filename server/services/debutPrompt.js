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
      ? `Apply the selected styling as one cohesive idol-debut concept look (premium grooming + stylist-level accessories, not random costume stacking):\n${lines.join('\n')}`
      : 'Enhance the pet photo with subtle idol-debut polish: premium grooming, cinematic key light, soft stage depth, and high-detail fur texture.'

  return [
    'Critical rule: keep the exact same pet identity, facial features, body proportions, and original background composition from the input photo.',
    'Do not replace the scene, do not change species, do not create cartoon rendering, and do not add any text, logos, or watermarks.',
    'Photorealistic editorial quality: clean lighting layers, realistic fur fibers, natural color grading, refined contrast, and premium texture fidelity.',
    'Creative direction: idol debut teaser visual for short-form platforms, with confident stage-ready aura, polished but believable styling.',
    stylingBlock,
    'Output should feel like a real debut portrait shot by a professional pet fashion team: tasteful, trendy, and camera-ready.',
    'Vertical composition for mobile screens with clean framing and balanced negative space.',
  ].join(' ')
}

export function getCatalog() {
  return catalog
}
