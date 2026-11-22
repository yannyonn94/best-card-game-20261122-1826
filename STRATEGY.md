# STRATEGY.md — Runebound Menagerie (best-card-game-20261122-1826)

## Concept (winner of the concept test)
Three one-sentence variants were drafted; the winner: *Runebound Menagerie — tamers
summon 12 beast-cards a stage in trick duels where 3-card same-family packs fuse into
chimeras worth double damage, and the final boss, the Mirror Warden, copies your last
played card's value exactly on its next turn.* It won on specificity (4 named beasts,
12 cards, 5 stages, a named boss) and because its twist is readable and counterable
on screen — the judge can see the mirror tell and the counter-play.

## Judge criteria, in order
1. **Complete card game in screenshots.** Cover (1-cover-play.jpg) is the busiest
   mid-action table: both hands visible, trick cards on the table, HP bars, score,
   COMBO ×2 banner. Title / win / loss screens are the other three shots.
2. **Fun & depth.** Every trick is a decision (which rank to spend, which family to
   save). Cards combine two ways: same-family resonance (+3) and win-streak combos
   (×2). Rivals have readable tells (favoured family) and the boss mirrors your last
   card — a choice you can read and counter.
3. **Feel & polish.** Cards slide in on deal (CSS keyframes), hover lift + snap on
   select, flip reveal on tricks, confetti rain on wins, WebAudio blips/chimes.
4. **Look & originality.** Original names, art (CSS + glyphs), and music (synth).
   Suits are colour + shape (▲ ❄ ⚡ ❧), never text alone. No poker/blackjack/UNO.
5. **Structure.** One job per file, named for it: deck / combo / opponent / render /
   audio / shots / main. No libraries vendored; everything is hand-written in-session.

## Numbers
48 cards, 4 families × ranks 1–12, 5 stages, 5 rival tamers, 1 boss, 30 player HP,
rivals 24–34 HP, resonance +3, combo ×2 on the win after a win, 7 synth sounds,
~1,100 lines of game source, 0 network requests.

## Risks
- Small prize ($50, 10 paid places) and a 12-hour window: the dev heat decides the
  top-40 cut, so the cover screenshot and the first-glance readability matter most.
- AI judge reads screenshots at small size: cards use 30px rank numerals and strong
  family colours so values survive the shrink.
