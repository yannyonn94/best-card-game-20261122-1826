// combo.js — trick resolution: who wins a trick, how much damage, resonance & combos.
// One trick: both sides play one card. Higher rank wins; the loser loses HP.
// Same-family cards resonate (+3 bonus damage). A win streak builds a combo
// multiplier (x2 from the 2nd consecutive win) that multiplies trick damage.
export const RESONANCE_BONUS = 3;
export const TIE_DAMAGE = 1;
export const COMBO_AFTER_STREAK = 2;
export const COMBO_MULTIPLIER = 2;

/**
 * Resolve one trick.
 * @returns { winner: 'player'|'opponent'|'tie', damage, base, resonance, combo, text }
 */
export function resolveTrick(playerCard, opponentCard, playerStreak) {
  const resonance = playerCard.suit === opponentCard.suit;
  const combo = playerStreak >= COMBO_AFTER_STREAK - 1 ? COMBO_MULTIPLIER : 1;
  if (playerCard.rank === opponentCard.rank) {
    return {
      winner: 'tie', damage: TIE_DAMAGE, base: 0, resonance, combo: 1,
      text: `Tie at ${playerCard.rank} — both tamers lose ${TIE_DAMAGE} HP.`,
    };
  }
  const playerWins = playerCard.rank > opponentCard.rank;
  const base = Math.abs(playerCard.rank - opponentCard.rank);
  const bonus = resonance ? RESONANCE_BONUS : 0;
  const damage = (base + bonus) * (playerWins ? combo : 1);
  const who = playerWins ? 'player' : 'opponent';
  const parts = [`${playerWins ? 'You win' : 'Rival wins'} the trick ${playerCard.rank} vs ${opponentCard.rank}`];
  if (resonance) parts.push(`+${RESONANCE_BONUS} resonance`);
  if (playerWins && combo > 1) parts.push(`COMBO x${combo}`);
  parts.push(`— ${damage} damage`);
  return { winner: who, damage, base, resonance, combo, text: parts.join(' ') + '.' };
}

/** Combo multiplier shown on the table for the next trick. */
export function nextComboMultiplier(playerStreak) {
  return playerStreak >= COMBO_AFTER_STREAK - 1 ? COMBO_MULTIPLIER : 1;
}

/** Count how many cards of each family are in a hand (pack readout). */
export function familyCounts(hand) {
  const counts = { ember: 0, frost: 0, storm: 0, vine: 0 };
  for (const card of hand) counts[card.suit]++;
  return counts;
}

/** A "pack" is 3+ cards of one family in hand: fused beasts hit harder. */
export function packBonus(hand) {
  const counts = familyCounts(hand);
  let best = null;
  for (const [suit, n] of Object.entries(counts)) {
    if (n >= 3 && (!best || n > best.count)) best = { suit, count: n };
  }
  return best; // null when no pack
}

/**
 * Preview the damage your card would deal if it wins the trick outright
 * (before the rival's card is known): base gap is unknown, so preview the
 * resonance + combo parts only. Shown under a selected card.
 */
export function previewBonus(playerCard, oppCard, playerStreak) {
  if (!oppCard) return null;
  const r = resolveTrick(playerCard, oppCard, playerStreak);
  return r.winner === 'player' ? r.damage : 0;
}
