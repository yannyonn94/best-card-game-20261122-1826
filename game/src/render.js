// render.js — draws the whole table as DOM: cards, hands, HP bars, banners.
// Cards are big, high-contrast DOM tiles: rank number + suit glyph + family
// colour, so they stay legible when the screenshot shrinks to a thumbnail.
import { suitOf } from './deck.js';

export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** One face-up card tile. `faceDown` renders a patterned back instead. */
export function cardElement(card, opts = {}) {
  const suit = suitOf(card.suit);
  const cardEl = el('div', 'card' + (opts.selected ? ' selected' : '') + (opts.playable === false ? ' dim' : ''));
  cardEl.style.setProperty('--suit', suit.color);
  cardEl.style.setProperty('--suit-dark', suit.dark);
  cardEl.style.setProperty('--suit-bg', suit.bg);
  if (opts.faceDown) {
    cardEl.classList.add('back');
    const inner = el('div', 'card-back-inner');
    inner.append(el('div', 'card-back-glyph', '✦'));
    inner.append(el('div', 'card-back-word', 'MENAGERIE'));
    cardEl.append(inner);
    return cardEl;
  }
  const top = el('div', 'card-corner');
  top.append(el('span', 'card-rank', String(card.rank)));
  top.append(el('span', 'card-glyph', suit.glyph));
  const mid = el('div', 'card-mid', suit.glyph);
  const name = el('div', 'card-name', suit.name);
  const bot = el('div', 'card-corner bottom');
  bot.append(el('span', 'card-rank', String(card.rank)));
  bot.append(el('span', 'card-glyph', suit.glyph));
  cardEl.append(top, mid, name, bot);
  if (opts.onClick) cardEl.addEventListener('click', opts.onClick);
  if (opts.index !== undefined) cardEl.dataset.index = String(opts.index);
  return cardEl;
}

/** HP bar (label + track + fill + numeric text). */
export function hpBar(label, hp, max, cls) {
  const wrap = el('div', 'hp-wrap ' + cls);
  wrap.append(el('span', 'hp-label', label));
  const track = el('div', 'hp-track');
  const fill = el('div', 'hp-fill');
  fill.style.width = Math.max(0, (hp / max) * 100) + '%';
  track.append(fill);
  wrap.append(track);
  wrap.append(el('span', 'hp-num', `${Math.max(0, hp)} / ${max} HP`));
  return wrap;
}

/** Confetti burst for the win screen: 60 coloured pieces, CSS-animated. */
export function confetti(container) {
  const colors = ['#ff6b35', '#2f9df0', '#9b5de5', '#2fae5f', '#ffd23f', '#ff4d6d'];
  for (let i = 0; i < 60; i++) {
    const piece = el('div', 'confetti');
    piece.style.left = (Math.random() * 100) + '%';
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = (Math.random() * 0.8) + 's';
    piece.style.animationDuration = (2 + Math.random() * 1.6) + 's';
    piece.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
    container.append(piece);
  }
}

/** Big centre banner text (stage intro, trick result, combo callout). */
export function banner(text, sub) {
  const b = el('div', 'banner');
  b.append(el('div', 'banner-main', text));
  if (sub) b.append(el('div', 'banner-sub', sub));
  return b;
}

/** Small gold score chip used on end screens. */
export function scoreChip(score) {
  return el('div', 'score-tag', `★ SCORE ${score}`);
}
