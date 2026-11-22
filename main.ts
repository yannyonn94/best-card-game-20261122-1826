// Runebound Menagerie — hand-in program (Node 22, standard library only).
// The game is plain static files under game/ plus 3-4 screenshots under
// screenshots/. This program assembles the entry in the output directory:
// it copies both folders in, then writes dossier.json — the summary the
// judge reads — using make.fun's vendored dossier library.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p /tmp/out-cardgame && MAKEFUN_OUTPUT_DIR=/tmp/out-cardgame node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const gameSource = join(repoRoot, 'game');
const shotsSource = join(repoRoot, 'screenshots');

if (!existsSync(gameSource) || !statSync(gameSource).isDirectory()) {
  throw new Error('hand-in failed: game/ is missing from the repository');
}
if (!existsSync(join(gameSource, 'index.html'))) {
  throw new Error('hand-in failed: game/index.html is missing');
}

// Fresh output: clear any stale files from a previous run so the two
// grader runs write byte-identical bytes.
mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  const target = join(outputDir, entry);
  if (statSync(target).isDirectory()) rmSync(target, { recursive: true, force: true });
  else unlinkSync(target);
}

cpSync(gameSource, join(outputDir, 'game'), { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, join(outputDir, 'screenshots'), { recursive: true });
}

// The gate's own caps: only text_max_bytes shapes the dossier's bytes; the
// rest make this program refuse exactly where the scorer would refuse.
const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
