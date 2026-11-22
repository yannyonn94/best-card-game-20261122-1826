// shots.js — deterministic screenshot states (?shot=title|play|win|loss).
// Each shot seeds the RNG and stages a fixed, busy table so the screenshots
// are reproducible renders of the game's own code, never composites.
import { buildDeck, shuffleDeck, makeRng, drawCards } from './deck.js';
import { STAGES } from './opponent.js';

/** Build a fixed mid-action play state: full hands, a trick on the table, combo live. */
export function shotPlayState() {
  const rng = makeRng(20261122);
  const deck = shuffleDeck(buildDeck(), rng);
  const playerHand = drawCards(deck, 5);
  const oppHand = drawCards(deck, 5);
  // Force a lively trick on the table: Ember 9 vs Frost 7, resonance off, combo x2.
  const playerCard = { id: 'ember-9', suit: 'ember', rank: 9, name: 'Ember Fox' };
  const oppCard = { id: 'frost-7', suit: 'frost', rank: 7, name: 'Frost Owl' };
  return {
    screen: 'play', stage: STAGES[2], stageIndex: 2,
    playerHp: 22, oppHp: 17, playerMaxHp: 30, oppMaxHp: 28,
    playerHand, oppHand, deck,
    playerCard, oppCard, trickResult: null,
    playerStreak: 2, score: 148, tricksWon: 4, tricksPlayed: 6,
    log: ['You win the trick 9 vs 7 — COMBO x2 — 4 damage.', 'Gale favours Storm — watch for it.', 'Pack! 3 Ember Foxes in hand.'],
    lastPlayed: playerCard, selected: 1, message: 'Your turn — play a card! (keys 1-5)',
  };
}

/** Fixed win screen state: stage 5 boss beaten, champion score shown. */
export function shotWinState() {
  const s = shotPlayState();
  s.screen = 'win';
  s.stageIndex = 4;
  s.stage = STAGES[4];
  s.oppHp = 0;
  s.playerHp = 14;
  s.score = 312;
  s.message = 'CHAMPION OF THE MENAGERIE!';
  return s;
}

/** Fixed loss screen state: beaten by the Frost Duchess at stage 4. */
export function shotLossState() {
  const s = shotPlayState();
  s.screen = 'loss';
  s.stageIndex = 3;
  s.stage = STAGES[3];
  s.playerHp = 0;
  s.oppHp = 19;
  s.score = 187;
  s.message = 'Mistral freezes your menagerie…';
  return s;
}

/** Which shot mode the URL asks for, if any. */
export function shotMode() {
  const q = new URLSearchParams(window.location.search).get('shot');
  return ['title', 'play', 'win', 'loss'].includes(q) ? q : null;
}

/** All four shot modes, in cover order: play first, then title, win, loss. */
export const SHOT_MODES = ['play', 'title', 'win', 'loss'];
