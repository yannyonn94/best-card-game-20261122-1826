Runebound Menagerie — summon 12 beast-cards a stage in trick duels where 3-card same-family packs fuse into chimeras worth double damage, and beat the Mirror Warden boss who copies your last played card's value exactly on its next turn. 48 cards · 4 beast families (Ember Fox, Frost Owl, Storm Serpent, Vine Badger) · 5 stages · 1 mirror boss · 30 HP duels · combo multiplier ×2 · resonance bonus +3 · 7 synthesised sounds · keyboard 1-5 + mouse.

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/yannyonn94/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/yannyonn94/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

# Runebound Menagerie

An original trick-duel card game that runs offline in desktop Chrome from static files — no network, no build step, no libraries. Open `game/index.html` (or `node serve.ts` and visit http://localhost:8080).

## How to play

- **You are a Tamer.** Each stage you duel a rival tamer in a trick duel. Both sides have HP (you 30, rivals 24–34).
- **Each trick, play one card** — click it or press **1–5**. The rival plays one too. Higher rank wins the trick; the loser loses HP equal to the rank gap.
- **Resonance:** both cards of the same beast family? The winner deals **+3 bonus damage**.
- **Combos:** win a trick and your next win deals **×2 damage**. The COMBO ×2 badge shows on the table.
- **Packs:** 3+ cards of one family in your hand is a fused pack — play them to press the advantage.
- **Read the rival:** stages 1–4 favour one family (shown as a tell on the table) and play it more often. Stage 5 is the **Mirror Warden boss**: it copies the value of the card *you* played last trick — the copied value is shown before you choose, so play low after a high card to starve the mirror.
- **Win a stage** by dropping the rival to 0 HP. **Lose** if your HP hits 0. Clear all 5 stages to become Champion of the Menagerie.
- **Keys:** 1–5 play a card · Enter start/continue · R restart · M mute.

## Files

- `game/index.html` — the page (loads `style.css` + `src/main.js`)
- `game/style.css` — felt table, cards, animations, confetti
- `game/src/deck.js` — 48-card deck, 4 families, seeded shuffle
- `game/src/combo.js` — trick resolution, resonance, combo multiplier, packs
- `game/src/opponent.js` — 5 rival tamers + Mirror Warden AI
- `game/src/render.js` — DOM cards, HP bars, banners, confetti
- `game/src/audio.js` — WebAudio-synthesised sounds (no audio files)
- `game/src/shots.js` — deterministic screenshot states (`?shot=title|play|win|loss`)
- `game/src/main.js` — game flow, input, screens, scoring
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to the output dir and writes `dossier.json`

## Screenshots

`1-cover-play.jpg` is the cover: a mid-action table at stage 3 with a COMBO ×2 trick resolving. `2-title.jpg`, `3-win.jpg`, `4-loss.jpg` show the title, champion win, and defeat screens. All are real renders of this game's own code in headless Chromium (`?shot=play|title|win|loss`).

## License

SPDX-License-Identifier: MIT — see LICENSE.
