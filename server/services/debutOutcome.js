import { scoreSelections } from './debutScore.js'
import { pickRole } from './debutRolePick.js'

/**
 * @param {{ categoryId: string, itemId: string }[]} selections
 * @returns {{
 *   debutScore: number,
 *   debutTierId: string,
 *   debutTierLabel: string,
 *   primaryLookId: string|null,
 *   debutRole: { title: string, tagline: string, emoji: string }
 * }}
 */
export function computeDebutOutcome(selections) {
  const { score, tierId, tierLabel, primaryLookId } = scoreSelections(selections)
  const debutRole = pickRole(tierId, selections, primaryLookId)
  return {
    debutScore: score,
    debutTierId: tierId,
    debutTierLabel: tierLabel,
    primaryLookId,
    debutRole,
  }
}
