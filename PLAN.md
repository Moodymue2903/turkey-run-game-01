# Joint plan — turkey-run-game-01: GOBBLE RUSH

## The three proposals (kept separate, then reconciled)

1. **Haystack Hideout** — top-down stealth, 2 zones (farmyard, kitchen). Verbs: hide in
   haystacks, toss corn decoys, sprint. Farmer AI: patrol / suspicious / chase, vision cone,
   dog patroller, oven heat zone. Risk flagged by its own author: stealth legibility at small
   size (a small turkey on a beige floor turns to mush on the judge's contact sheet).
2. **Gobble & Hide** — top-down stealth, 3 single-screen rooms (farmyard, barn, kitchen).
   Verbs: sneak, gobble decoy, hide. Farmer AI: patrol / suspicious / chase / search / return,
   plus dog, oven heat tiles, 90 s dinner timer. Same risk flagged: legibility + tuning
   (too easy / unfairly hard), and the calm farmyard shot shows no chase happening.
3. **Gobble Rush** — side-scrolling momentum runner, 3 acts in one continuous run
   (farmyard 0–300 m, barn 300–650 m, kitchen 650–1000 m). Verbs: jump/flap, slide,
   Gobble Dash. Farmer runs permanently behind the turkey with a visible "Farmer Gap" bar;
   trips, lunges with a telegraphed "!", and corners the turkey at the kitchen door between
   the open oven and a swinging carving knife. Risk flagged: tuning fairness + busy-kitchen
   legibility.

## Agreements (all three)

- Bright autumn palette, the opposite of the starter's dark #11141b canvas.
- 4 screenshots: title (cover), two play shots, escaped end screen; cover sells the game alone.
- HUD with feathers (lives), score, distance/stage, dash/stamina meter.
- Farmer with readable states, oven + carving knife visible in the kitchen play shot.
- Synthesised WebAudio only, no audio files; file per job, names that say what they do.
- Legibility at judge size is the top risk: verify every screenshot at ~320 px wide.

## Disagreements, settled with evidence

- **Stealth (1 & 2) vs runner (3).** Two of three proposals converge on stealth, which is
  itself a warning: stealth is the obvious answer other entrants will also build. More
  important is the evidence from the kit rules: the judge sees ONLY the contact sheet +
  source outline, and criterion 1 (first and most important) wants "chased by the farmer"
  *shown in the screenshots*. In both stealth proposals the farmyard play shot shows the
  farmer patrolling *away* from a hidden turkey — no chase visible. In the runner the
  farmer is chasing in EVERY play shot, and the kitchen shot shows oven + knife + lunging
  farmer in one frame. The runner also wins on verifiability: an auto-runner can be
  play-tested headlessly (scripted jumps) end to end, while stealth needs real player
  decisions to reach the end screen, and the finalist review (top 3 are played by humans)
  needs a game that is plainly winnable. **Decision: build the runner (3).**
- **Depth (criterion 2).** Stealth's hiding/searching is real depth, but the runner covers
  the criterion's own words — dodging, jumping, outrunning, a farmer who chases and
  corners, dangers/stages growing harder farmyard → kitchen, reason to replay
  (seeded obstacle order, near-miss bonus, best distance). Borrowed from the stealth
  proposals: a scripted corner/pinch moment at the kitchen door (already in 3) and a
  stealth-style rank on the end screen (best distance + near-misses).
- **Scope.** All three agree: build Act 1 + farmer + title/HUD/end first and screenshot it,
  then add Acts 2–3. If time runs short, ship a polished two-act run, never a rushed
  three-act one.

## Chosen mechanism: GOBBLE RUSH — The Great Thanksgiving Breakout

One continuous auto-run, left to right, canvas 2D, 1280×720. The turkey runs on his own;
the player controls timing, not direction.

- **Jump / flap:** Space / Up / W / tap. Tap = hop, hold = higher jump, press again in air =
  one wing-flap. 120 ms coyote time + jump buffering.
- **Slide:** Down / S. Tucks low under fences, beams, swinging knives; sliding through a hay
  bale gives a small speed boost.
- **Gobble Dash:** Shift / X. Short speed burst, knocks the farmer back, smashes one pumpkin.
  Limited meter, refilled by eating corn.
- **P** pause, **R** restart, **M** mute.
- **Win:** reach the forest gate at 1000 m → ESCAPED end screen (score, time, corn,
  near-misses, best distance). **Lose:** 3 feathers; a hit costs 1 feather, feather burst,
  camera shake, turkey slows and the farmer closes in; farmer touch or 0 feathers → CAUGHT
  end screen (net over the turkey, restart).
- **Farmer:** always at the left edge behind the turkey. A "Farmer Gap" bar under the HUD is
  the health bar in disguise: clean jumps and corn widen it, stumbles narrow it. States:
  chasing, tripping (comic stumble after a dash or a pumpkin rolling back — a safe window),
  lunging (telegraphed "!" wind-up when the gap is small; dodgeable, fatal if it connects).
  At the kitchen door (~650 m) he sprints ahead and corners the turkey between the open
  oven and a swinging carving knife — the signature moment, cleared by a timed dash/slide.
- **Acts:** 1 Farmyard 0–300 m (fences, hay bales, puddles; wide gaps, slow farmer, much
  corn — cannot kill a careful player); 2 Barn 300–650 m (rolling pumpkins, hanging
  lanterns, double-jump gaps; faster farmer, more lunges); 3 Kitchen 650–1000 m (oven doors
  blast open with heat glow, swinging carving knives, gravy slicks, pots; fastest speed,
  least corn, farmer lunging at every mistake). Palette gold → brown → hot orange.
- **Score:** distance + corn + near-miss bonus + dash-chain bonus. Best distance/score saved
  in localStorage. Obstacle order seeded per run.

## File plan (one clear job each)

- `game/index.html` — shell + canvas + HUD mount, loads `src/main.js` as a module.
- `game/src/main.js` — game loop + state machine (title / play / paused / end) + `?shot=`
  staging params for screenshots + seed handling.
- `game/src/turkey.js` — turkey movement: run, jump/flap, slide, dash, feathers, hit reaction.
- `game/src/farmer.js` — farmer chase: gap, trip, lunge, corner at the kitchen door.
- `game/src/farm.js` — terrain, obstacle spawning per act, corn, three-act definitions.
- `game/src/art.js` — all canvas drawing of turkey, farmer, obstacles, scenery, backgrounds.
- `game/src/audio.js` — synthesised WebAudio: gobble, flap, thud, farmer yell, oven whoosh,
  knife swoosh, win fanfare, mute.
- `game/src/screens.js` — title screen, HUD, end screens (ESCAPED / CAUGHT), pause overlay.
- `serve.ts` — tiny static server for local play-testing (stdlib only, fresh code).
- `main.ts` — entrypoint: copies game/ + screenshots/ to the output dir, writes
  dossier.json via buildDossier from vendor/makefun-game.ts (fresh code, written here).
- `vendor/makefun-game.ts` — kit copy, unchanged (md5-verified against the kit).
- `shots.json` — screenshot list with `?shot=` staging queries.
- `screenshots/` — 4 real renders, 1280×720 PNG, each ≤ 256 KiB.

## Screenshot plan (4, cover first by name)

1. `01-cover-title.png` — title: huge "GOBBLE RUSH", subtitle "The Great Thanksgiving
   Breakout", turkey centre-frame mid-stride with fanned tail, farmer peeking in from the
   left with net raised, golden farmyard behind, controls in large type, best distance.
2. `02-play-farmyard.png` — Act 1 play: turkey mid-jump over a fence, corn trail ahead,
   farmer close behind at left, HUD strip (score, distance 214 m, 3 feathers, dash meter,
   "Act 1 — Farmyard").
3. `03-play-kitchen.png` — Act 3 play (money shot): turkey sliding under a swinging carving
   knife, oven door open with orange heat glow at right, farmer lunging with net and "!"
   overhead, HUD showing 782 m, 1 feather left, dash meter nearly empty.
4. `04-end-escaped.png` — ESCAPED end screen: huge "ESCAPED!", turkey through the forest
   gate with leaves flying, farmer tangled in his own net behind, stats box, "Press R to run
   again".

## Order of work + a test for each step

1. Skeleton: repo dirs, vendor copy (md5 check), LICENSE, index.html, main.ts, serve.ts,
   shots.json. Test: `MAKEFUN_OUTPUT_DIR=out node main.ts` runs and writes dossier.json.
2. Core loop + turkey + Act 1 + title/HUD/end (no farmer yet). Test: headless Chrome loads
   the page with zero console errors and zero network requests; `?shot=start` renders title.
3. Farmer (gap/trip/lunge) + Acts 2–3 + oven/knife + audio. Test: scripted headless play
   (jump inputs at fixed times) reaches the kitchen and the end screen; no JS errors.
4. Polish: particles, shake, banners, tuning (Act 1 cannot kill; one stumble ≈ 25% of gap).
   Test: clean scripted run keeps the farmer 40–60% back; one stumble never closes the gap.
5. Screenshots: real renders via headless Chrome at 1280×720, then shrink each to ~320 px
   wide and check title / HUD / farmer / turkey / oven / knife are still identifiable.
   Test: each file ≤ 256 KiB, long side ≤ 1280, short side ≥ 480, PNG, opens cleanly.
6. Gate: run main.ts, run the kit check command from RULES.txt, fix any failure. Test:
   check passes; game plays offline; all 5 criteria visibly present in the screenshots.

## Keep vs kill bar

- **Keep** only if: the kit check passes, the game runs offline with no console errors, a
  scripted play reaches the ESCAPED screen, and all four screenshots read at ~320 px wide
  (turkey, farmer, HUD, oven, knife identifiable). The play shots must show the farmer
  chasing — if a play shot ever reads as a calm scene, re-stage it, do not ship it.
- **Kill** if: the runner cannot be tuned fair (farmer catches a careful player in Act 1),
  or the kitchen shot cannot be made legible without removing the oven/knife/farmer — those
  three in one frame are the entry's whole claim over the starter. A polished two-act run
  beats a rushed three-act one; a calm or unreadable screenshot beats nothing.

## Tuning fixes found in play-testing (headless autoplay, 4 seeds)

- **Flap stole the jump (fixed):** the driver's second Space press fired the wing-flap one
  frame after the jump, resetting vy from −980 to −720 and clipping fences. The flap is
  now gated to the jump's apex/fall (`vy > −100` in turkey.js) — an early second press
  can no longer weaken the first jump. Same fix applies to human players mashing Space.
- **Act 3 gaps were physically impossible (fixed):** a jump covers 412 px of travel at
  kitchen speed but the minimum obstacle gap was 374 px, so the turkey could not land
  between two obstacles. Gap floors raised: Barn 0.80 → 0.90 s, Kitchen 0.68 → 0.90 s.
  Rule going forward: minimum gap in px must exceed jump travel at that act's speed.
- **Lunge is a feather, not a death (fixed):** a failed lunge used to zero the feathers
  outright. It now costs one feather and the farmer trips, so the run only ends when
  the feathers run out.
- **Knife/lantern hitboxes now match their art (fixed):** the knife is a pendulum tip-box
  (raised pivot so a slide clears it), the lantern hangs low enough to threaten a
  standing turkey but not a sliding one. Before, the lantern could never hit at all.
- **A hit obstacle no longer counts as "cleared" (fixed):** passing an obstacle during
  post-hit invulnerability used to grant the clear bonus and score.

- All game code written fresh in recorded sessions (this session + its subagents) with file
  tools only — never pasted through chat, never copied from the kit starter (its lines are
  excluded from counted lines anyway). vendor/makefun-game.ts is the ONLY kit copy.
- main.ts written in this session; every file revised in at least 2 separate write/edit
  messages. No imports from outside the repo (no git clone, curl to file, cp from outside).
- No eval / new Function, no cookies, no service worker, no fetch at runtime.
