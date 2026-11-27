// Gobble Rush — the entrypoint. It hands the game in: copies game/ and
// screenshots/ from this repository into the output directory and writes
// /output/dossier.json with buildDossier from vendor/makefun-game.ts.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
// Standard library only; run with Node 22: MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = new URL('.', import.meta.url).pathname;
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// The caps the bounty scores by: the dossier text cap, at most 4 screenshots
// of at most 256 KiB each, and the game/ size caps from the kit rules.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

function copyTree(name) {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) throw new Error(`missing ${name}/ in the repository`);
  cpSync(from, to, { recursive: true, dereference: false });
}

// The grader mounts the output directory, so the directory itself must
// stay put. Empty it by deleting what is inside it, one entry at a time.
if (existsSync(outputDir)) {
  for (const entry of readdirSync(outputDir)) {
    rmSync(join(outputDir, entry), { recursive: true, force: true });
  }
}
mkdirSync(outputDir, { recursive: true });
copyTree('game');
copyTree('screenshots');

const dossier = buildDossier(outputDir, caps);
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`wrote ${outputDir}/dossier.json (${dossier.length} bytes)`);
