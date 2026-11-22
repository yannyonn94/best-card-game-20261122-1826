// main.js — Runebound Menagerie: game flow, input, screens, scoring.
// Flow: title -> 5 trick-duel stages (rival tamers, then the Mirror Warden boss)
// -> champion win screen. A stage ends when one side's HP hits 0.
import { buildDeck, shuffleDeck, makeRng, drawCards, sortHand, HAND_SIZE } from './deck.js';
import { resolveTrick, nextComboMultiplier, packBonus } from './combo.js';
import { STAGES, PLAYER_HP, chooseOpponentCard, opponentTell, stageIntro } from './opponent.js';
import { el, cardElement, hpBar, confetti, banner } from './render.js';
import { sfx, setMuted, isMuted } from './audio.js';
import { shotMode, shotPlayState, shotWinState, shotLossState } from './shots.js';

const app = document.getElementById('app');
let state = null;
let rng = makeRng((Date.now() % 100000) + 7);
let busy = false;

function freshState(stageIndex) {
  const stage = STAGES[stageIndex];
  const deck = shuffleDeck(buildDeck(), rng);
  return {
    screen: 'play', stage, stageIndex,
    playerHp: PLAYER_HP, oppHp: stage.hp, playerMaxHp: PLAYER_HP, oppMaxHp: stage.hp,
    playerHand: sortHand(drawCards(deck, HAND_SIZE)),
    oppHand: drawCards(deck, HAND_SIZE),
    deck, playerCard: null, oppCard: null, trickResult: null,
    playerStreak: 0, score: state ? state.score : 0,
    tricksWon: 0, tricksPlayed: 0, log: [],
    lastPlayed: null, selected: -1,
    message: stageIntro(stage),
  };
}

function log(msg) {
  state.log.unshift(msg);
  state.log = state.log.slice(0, 4);
}

function startStage(index) {
  state = freshState(index);
  sfx.stage();
  render();
}

function startGame() {
  rng = makeRng((Date.now() % 100000) + 7);
  state = null;
  startStage(0);
}

function endStage(won) {
  if (won) {
    state.score += 50 + state.playerHp * 2;
    sfx.win();
    if (state.stageIndex >= STAGES.length - 1) {
      state.screen = 'win';
    } else {
      state.screen = 'stage-clear';
    }
  } else {
    sfx.lose();
    state.screen = 'loss';
  }
  render();
}

function playCard(index) {
  if (!state || state.screen !== 'play' || busy || index < 0 || index >= state.playerHand.length) return;
  busy = true;
  const playerCard = state.playerHand.splice(index, 1)[0];
  const prevLast = state.lastPlayed; // the boss mirrors the PREVIOUS trick, not this one
  state.lastPlayed = playerCard;
  state.selected = -1;
  const oppCard = chooseOpponentCard(state.oppHand, rng, state.stage, prevLast, playerCard);
  state.oppHand.splice(state.oppHand.indexOf(oppCard), 1);
  state.playerCard = playerCard;
  state.oppCard = oppCard;
  sfx.flip();
  render();
  setTimeout(() => {
    const result = resolveTrick(playerCard, oppCard, state.playerStreak);
    state.trickResult = result;
    state.tricksPlayed++;
    if (result.winner === 'player') {
      state.oppHp -= result.damage;
      state.playerStreak++;
      state.tricksWon++;
      state.score += result.damage * 10;
      sfx.hit();
      if (result.combo > 1) sfx.combo();
    } else if (result.winner === 'opponent') {
      state.playerHp -= result.damage;
      state.playerStreak = 0;
      sfx.hit();
    } else {
      state.playerHp -= 1;
      state.oppHp -= 1;
      state.playerStreak = 0;
    }
    log(result.text);
    render();
    setTimeout(() => {
      state.playerCard = null;
      state.oppCard = null;
      state.trickResult = null;
      // Refill hands from the deck; reshuffle the discard when the deck runs dry.
      if (state.deck.length < 2) state.deck = shuffleDeck(buildDeck(), rng);
      while (state.playerHand.length < HAND_SIZE && state.deck.length) state.playerHand.push(state.deck.pop());
      while (state.oppHand.length < HAND_SIZE && state.deck.length) state.oppHand.push(state.deck.pop());
      state.playerHand = sortHand(state.playerHand);
      if (state.oppHp <= 0) return endStage(true);
      if (state.playerHp <= 0) return endStage(false);
      busy = false;
      render();
    }, 1100);
  }, 650);
}

// ------------------------------------------------------------ rendering

function renderTitle() {
  app.innerHTML = '';
  const wrap = el('div', 'screen title-screen');
  wrap.append(el('div', 'title-kicker', 'A CARD DUEL OF BEASTS & MIRRORS'));
  wrap.append(el('h1', 'game-title', 'RUNEBound'));
  wrap.append(el('div', 'game-subtitle', 'MENAGERIE'));
  wrap.append(el('p', 'title-tag',
    'Summon 12 beast-cards a stage. Win tricks, chain combos, and face the Mirror Warden — the boss who copies your last card.'));
  const feats = el('div', 'title-feats');
  for (const f of ['48 cards · 4 beast families', '5 stages · 1 mirror boss', 'Combos ×2 · Resonance +3', 'Keyboard 1-5 + mouse']) {
    feats.append(el('span', 'feat', f));
  }
  wrap.append(feats);
  const btn = el('button', 'big-btn', '▶  ENTER THE MENAGERIE');
  btn.addEventListener('click', () => { sfx.click(); startGame(); });
  wrap.append(btn);
  wrap.append(el('p', 'title-hint', 'Click a card or press 1-5 to play it · M mute · R restart'));
  const mini = el('div', 'title-cards');
  for (const c of [
    { id: 'ember-12', suit: 'ember', rank: 12, name: 'Ember Fox' },
    { id: 'frost-11', suit: 'frost', rank: 11, name: 'Frost Owl' },
    { id: 'storm-10', suit: 'storm', rank: 10, name: 'Storm Serpent' },
    { id: 'vine-9', suit: 'vine', rank: 9, name: 'Vine Badger' },
  ]) mini.append(cardElement(c));
  wrap.append(mini);
  app.append(wrap);
}

function renderPlay() {
  app.innerHTML = '';
  const s = state;
  const table = el('div', 'screen table');
  // Top bar: stage, score, mute.
  const top = el('div', 'topbar');
  top.append(el('span', 'stage-tag', `STAGE ${s.stage.n}/5 — ${s.stage.name.toUpperCase()}`));
  top.append(el('span', 'score-tag', `★ SCORE ${s.score}`));
  const muteBtn = el('button', 'mute-btn', isMuted() ? '🔇 MUTED' : '🔊 SOUND');
  muteBtn.addEventListener('click', () => { setMuted(!isMuted()); render(); });
  top.append(muteBtn);
  table.append(top);
  // Opponent row: name, tell, HP, face-down hand.
  const oppRow = el('div', 'opp-row');
  const oppInfo = el('div', 'side-info');
  oppInfo.append(el('div', 'side-name', `⚔ ${s.stage.name} — ${s.stage.title}`));
  oppInfo.append(el('div', 'side-tell', opponentTell(s.stage)));
  oppInfo.append(hpBar('RIVAL', s.oppHp, s.oppMaxHp, 'opp'));
  oppRow.append(oppInfo);
  const oppHand = el('div', 'hand opp-hand');
  for (const c of s.oppHand) oppHand.append(cardElement(c, { faceDown: true }));
  oppRow.append(oppHand);
  table.append(oppRow);
  // Middle: trick arena.
  const arena = el('div', 'arena');
  const playedP = el('div', 'played-slot');
  playedP.append(el('div', 'slot-label', 'YOU'));
  playedP.append(s.playerCard ? cardElement(s.playerCard, { playable: false }) : el('div', 'slot-empty', '—'));
  const mid = el('div', 'arena-mid');
  if (s.trickResult) {
    mid.append(banner(s.trickResult.winner === 'player' ? 'TRICK WON!' : s.trickResult.winner === 'tie' ? 'TIE!' : 'TRICK LOST', s.trickResult.text));
  } else if (nextComboMultiplier(s.playerStreak) > 1) {
    mid.append(banner(`COMBO ×${nextComboMultiplier(s.playerStreak)}`, `Win streak ${s.playerStreak} — next win hits double!`));
  } else {
    mid.append(el('div', 'vs', 'VS'));
    mid.append(el('div', 'arena-hint', s.message));
  }
  const playedO = el('div', 'played-slot');
  playedO.append(el('div', 'slot-label', 'RIVAL'));
  playedO.append(s.oppCard ? cardElement(s.oppCard, { playable: false }) : el('div', 'slot-empty', '—'));
  arena.append(playedP, mid, playedO);
  table.append(arena);
  // Player row: HP, hand, pack + log.
  const pRow = el('div', 'player-row');
  const pInfo = el('div', 'side-info');
  pInfo.append(el('div', 'side-name', '◆ YOU — Tamer'));
  const pack = packBonus(s.playerHand);
  pInfo.append(el('div', 'side-tell', pack ? `PACK! ${pack.count} ${pack.suit} — fused beasts hit +3` : `Tricks ${s.tricksWon}/${s.tricksPlayed} · Streak ${s.playerStreak}`));
  pInfo.append(hpBar('YOU', s.playerHp, s.playerMaxHp, 'you'));
  pRow.append(pInfo);
  const hand = el('div', 'hand player-hand');
  s.playerHand.forEach((c, i) => {
    hand.append(cardElement(c, {
      selected: i === s.selected, index: i,
      onClick: () => { s.selected = i; sfx.select(); render(); setTimeout(() => playCard(i), 120); },
    }));
  });
  pRow.append(hand);
  table.append(pRow);
  const logEl = el('div', 'log');
  for (const line of s.log) logEl.append(el('div', 'log-line', line));
  if (!s.log.length) logEl.append(el('div', 'log-line', 'Play a card to begin the duel — click or press 1-5.'));
  table.append(logEl);
  app.append(table);
}

function renderEnd(win, champion) {
  app.innerHTML = '';
  const wrap = el('div', 'screen end-screen ' + (win ? 'win' : 'loss'));
  if (win) confetti(wrap);
  wrap.append(el('div', 'end-kicker', win ? (champion ? '★ CHAMPION OF THE MENAGERIE ★' : 'STAGE CLEAR!') : 'DEFEAT'));
  wrap.append(el('h1', 'end-title', win ? (champion ? 'THE MIRROR BREAKS!' : `${state.stage.name} FALLS!`) : `${state.stage.name} WINS`));
  wrap.append(el('p', 'end-sub', win
    ? (champion ? 'Five stages, one mirror, zero mercy. Your beasts sing your name.' : 'The menagerie cheers. The next tamer awaits — stronger, stranger.')
    : 'Your beasts scatter into the wild. Dust off, redraw, and duel again.'));
  const stats = el('div', 'end-stats');
  for (const [k, v] of [['SCORE', state.score], ['STAGE', `${state.stage.n} / 5`], ['TRICKS WON', state.tricksWon], ['YOUR HP', Math.max(0, state.playerHp)], ['RIVAL HP', Math.max(0, state.oppHp)]]) {
    const cell = el('div', 'stat');
    cell.append(el('div', 'stat-num', String(v)));
    cell.append(el('div', 'stat-label', k));
    stats.append(cell);
  }
  wrap.append(stats);
  const row = el('div', 'btn-row');
  if (win && !champion) {
    const next = el('button', 'big-btn', `▶  STAGE ${state.stageIndex + 2}: ${STAGES[state.stageIndex + 1].name.toUpperCase()}`);
    next.addEventListener('click', () => { sfx.click(); startStage(state.stageIndex + 1); });
    row.append(next);
  }
  const again = el('button', 'big-btn ghost', win && champion ? '↻  PLAY AGAIN' : '↻  DUEL AGAIN');
  again.addEventListener('click', () => { sfx.click(); startGame(); });
  row.append(again);
  wrap.append(row);
  wrap.append(el('p', 'title-hint', 'R restarts · M mutes'));
  app.append(wrap);
}

function render() {
  if (!state) { renderTitle(); return; }
  if (state.screen === 'play') renderPlay();
  else if (state.screen === 'win') renderEnd(true, true);
  else if (state.screen === 'loss') renderEnd(false, false);
  else if (state.screen === 'stage-clear') renderEnd(true, false);
  else renderTitle();
}

// ------------------------------------------------------------ input & boot

document.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') { setMuted(!isMuted()); render(); return; }
  if (e.key === 'r' || e.key === 'R') { startGame(); return; }
  if (state && state.screen === 'play') {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= state.playerHand.length) playCard(n - 1);
  } else if (!state && (e.key === 'Enter' || e.key === ' ')) {
    startGame();
  } else if (state && (state.screen === 'stage-clear' || state.screen === 'loss' || state.screen === 'win') && e.key === 'Enter') {
    if (state.screen === 'stage-clear') startStage(state.stageIndex + 1);
    else startGame();
  }
});

function boot() {
  const mode = shotMode();
  if (mode === 'play') { state = shotPlayState(); state.trickResult = { winner: 'player', damage: 4, base: 2, resonance: false, combo: 2, text: 'You win the trick 9 vs 7 — COMBO x2 — 4 damage.' }; }
  else if (mode === 'win') state = shotWinState();
  else if (mode === 'loss') state = shotLossState();
  else if (mode === 'title') state = null;
  render();
}

boot();
