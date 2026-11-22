// deck.js — the Menagerie deck: four beast families, seeded shuffle, dealing.
// Suits are told apart by colour AND shape glyph, never by text alone.
export const SUITS = [
  { id: 'ember', name: 'Ember Fox', glyph: '▲', color: '#ff6b35', dark: '#a83208', bg: '#ffe3d6' },
  { id: 'frost', name: 'Frost Owl', glyph: '❄', color: '#2f9df0', dark: '#0b5fa8', bg: '#dcefff' },
  { id: 'storm', name: 'Storm Serpent', glyph: 'ϟ', color: '#9b5de5', dark: '#5e2ea6', bg: '#eadcff' },
  { id: 'vine', name: 'Vine Badger', glyph: '❧', color: '#2fae5f', dark: '#146c34', bg: '#d9f5e3' },
];

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const DECK_SIZE = 48;
export const HAND_SIZE = 5;

/** Deterministic RNG (mulberry32) so screenshot states and replays are stable. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build one fresh 48-card deck: 4 families x ranks 1-12. */
export function buildDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ id: `${suit.id}-${rank}`, suit: suit.id, rank, name: suit.name });
    }
  }
  return cards;
}

/** Fisher-Yates shuffle with an injected RNG; returns a new array. */
export function shuffleDeck(cards, rng) {
  const deck = cards.slice();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Draw n cards from the front of the deck array (mutates the deck). */
export function drawCards(deck, n) {
  return deck.splice(0, n);
}

/** Look up a suit definition by id. */
export function suitOf(suitId) {
  return SUITS.find((s) => s.id === suitId);
}

/** Sort a hand for display: by suit, then by rank. */
export function sortHand(hand) {
  const order = { ember: 0, frost: 1, storm: 2, vine: 3 };
  return hand.slice().sort((a, b) => (order[a.suit] - order[b.suit]) || (a.rank - b.rank));
}

/** Display name for a rank: 1 is a Cub, 12 is an Elder. */
export function rankLabel(rank) {
  if (rank === 1) return 'Cub';
  if (rank === 12) return 'Elder';
  if (rank >= 10) return 'Alpha';
  return `Rank ${rank}`;
}

/** How many cards are left in the deck (shown on the table). */
export function deckCount(deck) {
  return deck.length;
}
