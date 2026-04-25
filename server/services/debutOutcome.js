import { scoreSelections } from './debutScore.js'
import { pickRole } from './debutRolePick.js'

/**
 * @param {{ categoryId: string, itemId: string }[]} selections
 * @returns {{
 *   debutScore: number,
 *   debutScoreRaw: number,
 *   debutTierId: string,
 *   debutTierLabel: string,
 *   debutRole: { title: string, tagline: string, emoji: string }
 * }}
 */
export function computeDebutOutcome(selections) {
  const { rawScore, score, tierId, tierLabel } = scoreSelections(selections)
  const debutRole = pickRole(tierId, selections)
  return {
    debutScore: score,
    debutScoreRaw: rawScore,
    debutTierId: tierId,
    debutTierLabel: tierLabel,
    debutRole,
  }
}
