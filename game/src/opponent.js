// opponent.js — the rival tamers: five stages, escalating brains, one boss.
// Stages 1-4 are rival tamers with a readable "tell": each favours one family
// and plays it more often, so the player can read and counter them.
// Stage 5 is the Mirror Warden: it copies the value of the card YOU played
// last trick, and the table shows the copied value before you choose.
export const STAGES = [
  { n: 1, name: 'Pip the Cub', title: 'Rookie Tamer', hp: 24, skill: 0.15, favours: 'ember', taunt: 'My foxes bite first!' },
  { n: 2, name: 'Bramble', title: 'Vine Warden', hp: 26, skill: 0.35, favours: 'vine', taunt: 'The thicket remembers.' },
  { n: 3, name: 'Gale', title: 'Storm Caller', hp: 28, skill: 0.55, favours: 'storm', taunt: 'Hear the sky crack.' },
  { n: 4, name: 'Mistral', title: 'Frost Duchess', hp: 30, skill: 0.75, favours: 'frost', taunt: 'Winter takes its due.' },
  { n: 5, name: 'Mirror Warden', title: 'BOSS — The Menagerie Keeper', hp: 34, skill: 0.9, favours: null, taunt: 'I am every card you played.' },
];

export const PLAYER_HP = 30;

/**
 * Pick the opponent's card from its hand.
 * - The boss mirrors: its card value equals the player's last played rank.
 * - Other rivals: with probability `skill` they play their best card against
 *   the player's visible lead; otherwise they favour their family or play random.
 * Returns the chosen card object.
 */
export function chooseOpponentCard(hand, rng, stage, playerLastCard, playerLeadCard) {
  if (stage.n === 5 && playerLastCard) {
    // Mirror Warden: copy the player's last rank, preferring its own matching card.
    const same = hand.find((c) => c.rank === playerLastCard.rank);
    if (same) return same;
    let closest = hand[0];
    for (const c of hand) {
      if (Math.abs(c.rank - playerLastCard.rank) < Math.abs(closest.rank - playerLastCard.rank)) closest = c;
    }
    return closest;
  }
  const roll = rng();
  if (playerLeadCard && roll < stage.skill) {
    // Smart play: smallest card that still beats the player's lead, else the lowest card.
    const beating = hand.filter((c) => c.rank > playerLeadCard.rank).sort((a, b) => a.rank - b.rank);
    if (beating.length) return beating[0];
    return hand.slice().sort((a, b) => a.rank - b.rank)[0];
  }
  if (stage.favours && roll < 0.6) {
    const favoured = hand.filter((c) => c.suit === stage.favours);
    if (favoured.length) return favoured[Math.floor(rng() * favoured.length)];
  }
  return hand[Math.floor(rng() * hand.length)];
}

/** Human-readable hint about what the rival is likely to do (shown on the table). */
export function opponentTell(stage) {
  if (stage.n === 5) return 'MIRROR: copies your last card!';
  return `Favours ${stage.favours} — watch for it.`;
}

/** One-line stage intro used on the table and the stage-clear screen. */
export function stageIntro(stage) {
  return `Stage ${stage.n} of 5 — ${stage.name}, ${stage.title}. Rival HP ${stage.hp}. ${stage.taunt}`;
}
