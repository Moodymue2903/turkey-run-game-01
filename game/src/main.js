// Gobble Rush — game loop, state machine, input, staging, and the autoplay tester.
// States: title -> play -> end (escaped / caught), plus paused.
// URL params: ?shot=start|play|kitchen|end stages a screenshot state, ?seed=N fixes
// the obstacle order, ?autoplay=1 plays the game with a simple built-in driver
// so headless runs can prove the game is winnable end to end.
import { VIEW_W, VIEW_H, GROUND_Y, GATE_DISTANCE, TURKEY_X } from './config.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { Farm } from './farm.js';
import { SoundBank } from './audio.js';
import {
  drawBackground, drawCorn, drawFarmer, drawGate, drawObstacle, drawShadow, drawTurkey,
} from './art.js';
import { drawEnd, drawHUD, drawPaused, drawTitle } from './screens.js';

const params = new URLSearchParams(window.location.search);
const SEED = parseInt(params.get('seed') || '7', 10) || 7;
const SHOT = params.get('shot') || '';
const AUTOPLAY = params.get('autoplay') === '1';

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.sounds = new SoundBank();
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.farm = new Farm(SEED);
    this.state = 'title';
    this.escaped = false;
    this.score = 0;
    this.cornCount = 0;
    this.nearMissCount = 0;
    this.best = 0;
    this.banner = '';
    this.bannerTimer = 0;
    this.shake = 0;
    this.time = 0;
    this.frozen = false;
    this.errors = [];
    this.hitLog = [];
    this.driveLog = [];
    this.lastTimestamp = 0;
    this.keys = {};
    try {
      this.best = parseInt(window.localStorage.getItem('gobbleRushBest') || '0', 10) || 0;
    } catch (e) {
      this.best = 0;
    }
    window.addEventListener('error', (event) => {
      this.errors.push(String(event.message || event.error || 'error'));
      this.reportDebug();
    });
    this.bindInput();
    this.stageShot();
    this.reportDebug();
  }

  bindInput() {
    window.addEventListener('keydown', (event) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
      if (event.repeat) return;
      this.keys[event.code] = true;
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        this.pressJump();
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        if (this.state === 'play' && this.turkey.requestSlide()) this.sounds.slide();
      }
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.code === 'KeyX') {
        this.pressDash();
      }
      if (event.code === 'Enter') {
        if (this.state === 'title' || this.state === 'end') this.startRun();
      }
      if (event.code === 'KeyR') {
        if (this.state === 'end' || this.state === 'play') this.startRun();
      }
      if (event.code === 'KeyP') {
        if (this.state === 'play') this.state = 'paused';
        else if (this.state === 'paused') this.state = 'play';
      }
      if (event.code === 'KeyM') {
        this.sounds.setMuted(!this.sounds.muted);
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });
    this.canvas.addEventListener('pointerdown', () => {
      if (this.state === 'title' || this.state === 'end') this.startRun();
      else this.pressJump();
    });
  }

  pressJump() {
    if (this.state !== 'play') return;
    this.turkey.requestJump();
  }

  pressDash() {
    if (this.state !== 'play') return;
    if (this.turkey.requestDash()) {
      this.sounds.dash();
      this.farmerEvent = { dashed: true };
    }
  }

  startRun() {
    this.turkey.reset();
    this.farmer.reset();
    this.farm.reset();
    this.state = 'play';
    this.escaped = false;
    this.score = 0;
    this.cornCount = 0;
    this.nearMissCount = 0;
    this.banner = '';
    this.shake = 0;
    this.sounds.gobble();
    this.reportDebug();
  }

  endRun(escaped) {
    this.escaped = escaped;
    this.state = 'end';
    const distance = Math.floor(this.farm.distance);
    if (distance > this.best) {
      this.best = distance;
      try {
        window.localStorage.setItem('gobbleRushBest', String(distance));
      } catch (e) {
        // Private mode: best score just does not persist.
      }
    }
    if (escaped) this.sounds.escapeJingle();
    else this.sounds.caughtSting();
    this.reportDebug();
  }

  showBanner(text, seconds) {
    this.banner = text;
    this.bannerTimer = seconds;
  }

  // Staging for screenshots: put the game into a chosen state and freeze it.
  stageShot() {
    if (!SHOT) return;
    this.frozen = true;
    if (SHOT === 'start') {
      this.state = 'title';
    } else if (SHOT === 'play') {
      this.state = 'play';
      this.farm.distance = 214;
      this.farm.actIndex = 0;
      this.seedStagedRun(214, 3, 0.45);
    } else if (SHOT === 'kitchen') {
      this.state = 'play';
      this.farm.distance = 782;
      this.farm.actIndex = 2;
      this.farm.speed = 550;
      this.turkey.feathers = 1;
      this.turkey.dashMeter = 0.08;
      this.farmer.gap = 0.28;
      this.farmer.state = 'lunge';
      this.farmer.stateTimer = 0.3;
      this.seedStagedRun(782, 1, 0.28);
      // The money shot, staged precisely: the turkey slides under the swinging
      // knife just ahead, the open oven glows behind it, the farmer lunges.
      this.farm.obstacles = [
        { type: 'oven', x: 560, seed: 0.4, passed: false, cycle: 2.0, openAmount: 1, rolling: false },
        { type: 'knife', x: 350, seed: 0.9, passed: false, cycle: 0, openAmount: 0, rolling: false },
        { type: 'pot', x: 940, seed: 1.3, passed: false, cycle: 0, openAmount: 0, rolling: false },
        { type: 'slick', x: 1150, seed: 2.1, passed: false, cycle: 0, openAmount: 0, rolling: false },
      ];
      this.turkey.sliding = true;
      this.turkey.slideTimer = 0.5;
      this.turkey.y = GROUND_Y;
      this.turkey.vy = 0;
      this.turkey.onGround = true;
      this.score = 7820;
      this.cornCount = 11;
    } else if (SHOT === 'end') {
      this.state = 'end';
      this.escaped = true;
      this.farm.distance = 1000;
      this.score = 12480;
      this.cornCount = 14;
      this.nearMissCount = 9;
      this.best = 1000;
    }
  }

  // Lay out a believable mid-run scene: a few obstacles and corn on screen,
  // the turkey mid-jump, the farmer close behind.
  seedStagedRun(distance, feathers, gap) {
    this.turkey.feathers = feathers;
    this.farmer.gap = gap;
    this.farm.obstacles = [];
    this.farm.corns = [];
    const act = this.farm.act();
    const types = act.types;
    let x = 430;
    for (let i = 0; i < 4; i++) {
      const type = types[i % types.length];
      this.farm.obstacles.push({ type, x, seed: i * 1.7, passed: false, cycle: 0.4, openAmount: type === 'oven' ? 1 : 0, rolling: type === 'pumpkin' });
      x += 260;
    }
    for (let i = 0; i < 3; i++) {
      this.farm.corns.push({ x: 700 + i * 46, y: GROUND_Y - 150, eaten: false });
    }
    this.turkey.y = GROUND_Y - 130;
    this.turkey.vy = -260;
    this.turkey.onGround = false;
    this.score = Math.floor(distance) * 10;
  }

  // The built-in driver: jump for jump-obstacles, slide for slide-obstacles,
  // dodge a lunge, flap if a second obstacle follows a jump. Used by
  // ?autoplay=1 headless runs.
  autoplayDrive() {
    if (this.state !== 'play') return;
    const turkey = this.turkey;
    // A lunging farmer is dodged by jumping, not by running on.
    if (this.farmer.state === 'lunge' && turkey.onGround) {
      turkey.requestJump();
      return;
    }
    const ahead = this.farm.obstacles
      .filter((ob) => ob.x > TURKEY_X - 40 && ob.x < TURKEY_X + 320)
      .sort((a, b) => a.x - b.x)[0];
    if (ahead) {
      const def = { fence: 'jump', hay: 'jump', puddle: 'jump', pumpkin: 'jump', pot: 'jump', oven: 'jump', lantern: 'slide', knife: 'slide', slick: 'slide' }[ahead.type];
      const near = ahead.x - TURKEY_X;
      if (def === 'jump') {
        // Rolling pumpkins close faster, so the jump starts earlier for them.
        const jumpAt = ahead.type === 'pumpkin' ? 300 : 210;
        if (near < jumpAt && turkey.onGround) {
          turkey.requestJump();
          this.driveLog.push({ at: Math.floor(this.farm.distance), action: 'jump', ob: ahead.type, near: Math.round(near) });
        } else if (near < 240 && !turkey.onGround && !turkey.flapped && turkey.vy > 0) {
          // Flap only on the way down: flapping on the rise would steal the jump.
          turkey.requestJump();
          this.driveLog.push({ at: Math.floor(this.farm.distance), action: 'flap', ob: ahead.type, near: Math.round(near) });
        }
      }
      if (def === 'slide') {
        // The knife only lets the turkey under when it has swung away.
        if (ahead.type === 'knife') {
          const angle = Math.sin(this.farm.time * 1.9 + ahead.seed);
          if (near < 260 && Math.abs(angle) > 0.5 && turkey.onGround) {
            turkey.requestSlide();
            this.driveLog.push({ at: Math.floor(this.farm.distance), action: 'slide', ob: ahead.type, near: Math.round(near) });
          }
        } else if (near < 200 && turkey.onGround) {
          turkey.requestSlide();
          this.driveLog.push({ at: Math.floor(this.farm.distance), action: 'slide', ob: ahead.type, near: Math.round(near) });
        }
      }
    }
    if (this.farmer.gap < 0.22 && turkey.dashMeter > 0.99) this.pressDash();
  }

  update(dt) {
    if (this.state !== 'play') return;
    this.time += dt;
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner = '';
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 30);
    if (AUTOPLAY) this.autoplayDrive();

    const jumpResult = this.turkey.update(dt, this.farm.speed);
    if (jumpResult === 'jump') this.sounds.jump();
    if (jumpResult === 'flap') this.sounds.flap();
    if (jumpResult === 'land') this.sounds.thud();

    const actInfo = this.farm.update(dt, this.turkey);
    if (actInfo.actChanged) {
      const names = ['the Barn', 'the Kitchen — watch the oven!'];
      this.showBanner('Act ' + (this.farm.actIndex + 1) + ' — ' + names[this.farm.actIndex - 1], 2.2);
      this.sounds.alertSting();
    }
    if (this.farm.cornerMoment()) {
      this.farmer.startCorner();
      this.showBanner('He is cornering you at the kitchen door!', 2.4);
      this.sounds.farmerYell();
    }

    const events = this.farm.checkCollisions(this.turkey);
    if (events.corn) {
      this.cornCount += 1;
      this.turkey.dashMeter = Math.min(1, this.turkey.dashMeter + 0.12);
      this.sounds.corn();
    }
    if (events.nearMiss) {
      this.nearMissCount += 1;
      this.score += 25;
    }
    if (events.smashed) {
      this.sounds.thud();
      this.showBanner('Smashed it!', 1);
    }
    if (events.hit) {
      if (events.hit === 'oven') this.sounds.ovenWhoosh();
      else if (events.hit === 'knife') this.sounds.knifeSwoosh();
      else this.sounds.thud();
      this.shake = 12;
      this.hitLog.push({ at: Math.floor(this.farm.distance), type: events.hit, feathers: this.turkey.feathers, gap: +this.farmer.gap.toFixed(2) });
      if (this.turkey.takeHit()) {
        this.showBanner('Ouch! A feather lost!', 1.4);
        this.sounds.farmerYell();
      }
      events.stumbled = true;
    }

    const farmerEvents = {
      cleared: events.cleared,
      corn: events.corn,
      stumbled: !!events.stumbled,
      dashed: !!(this.farmerEvent && this.farmerEvent.dashed),
      smashed: events.smashed,
    };
    this.farmerEvent = null;
    const farmerResult = this.farmer.update(dt, this.turkey, farmerEvents, this.farm.speed);
    if (farmerResult === 'lungeWarn') this.sounds.alertSting();
    if (farmerResult === 'tripped') {
      this.showBanner('He tripped! Run!', 1.2);
      this.sounds.gobble();
    }
    if (farmerResult === 'caught') {
      // The grab connects: a feather lost, a shake, and the farmer stumbles
      // off — the run only ends when the feathers run out.
      this.shake = 12;
      this.hitLog.push({ at: Math.floor(this.farm.distance), type: 'farmer-grab', feathers: this.turkey.feathers, gap: +this.farmer.gap.toFixed(2) });
      if (this.turkey.takeHit()) {
        this.showBanner('He grabbed you! A feather lost!', 1.4);
        this.sounds.farmerYell();
      }
    }

    this.score = Math.floor(this.farm.distance) * 10 + this.cornCount * 50 + this.nearMissCount * 25;

    if (this.turkey.feathers <= 0) {
      this.endRun(false);
      return;
    }
    if (this.farm.reachedGate()) {
      this.endRun(true);
    }
    this.reportDebug();
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    drawBackground(ctx, this.farm.actIndex, this.farm.distance, this.time);
    if (this.farm.gateX !== null) drawGate(ctx, this.farm.gateX);
    for (const corn of this.farm.corns) {
      if (!corn.eaten) drawCorn(ctx, corn.x, corn.y, this.time * 3 + corn.x);
    }
    for (const ob of this.farm.obstacles) drawObstacle(ctx, ob, this.time);
    // The play-field sprites only belong to a run in progress; the title and
    // end screens draw their own turkey and farmer, so never draw both.
    if (this.state === 'play' || this.state === 'paused') {
      drawShadow(ctx, this.farmer.screenX, 46);
      drawFarmer(ctx, this.farmer.screenX, GROUND_Y, this.farmer.state, this.farmer.phase);
    }
    if (this.state === 'play' || this.state === 'paused') {
      const blink = this.turkey.invulnTimer > 0 && Math.floor(this.time * 12) % 2 === 0;
      if (!blink) {
        drawShadow(ctx, this.turkey.x, 40);
        drawTurkey(ctx, this.turkey.x, this.turkey.y, {
          runPhase: this.turkey.runPhase,
          airborne: !this.turkey.onGround,
          sliding: this.turkey.sliding,
          flapping: this.turkey.flapAnim > 0,
          dashing: this.turkey.dashing,
        });
      }
    }
    if (this.state === 'play' || this.state === 'paused') drawHUD(ctx, this);
    if (this.state === 'title') drawTitle(ctx, this.best, this.time);
    if (this.state === 'end') drawEnd(ctx, this, this.time);
    if (this.state === 'paused') drawPaused(ctx);
    ctx.restore();
  }

  reportDebug() {
    // Headless runs read this element to prove the game ran and how far it got.
    const el = document.getElementById('debug');
    if (!el) return;
    const state = {
      state: this.state,
      distance: Math.floor(this.farm.distance),
      feathers: this.turkey.feathers,
      score: this.score,
      escaped: this.escaped,
      errors: this.errors,
      hitLog: this.hitLog,
      crossLog: this.farm.crossLog.slice(-12),
      driveLog: this.driveLog.slice(-16),
    };
    el.textContent = JSON.stringify(state);
    window.__turkeyRun = state;
  }

  frame(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000 || 0.016);
    this.lastTimestamp = timestamp;
    if (!this.frozen) {
      if (this.state === 'title' || this.state === 'end') this.time += dt;
      this.update(dt);
    } else {
      this.time += 0.016;
    }
    this.render();
    window.requestAnimationFrame((t) => this.frame(t));
  }

  start() {
    window.requestAnimationFrame((t) => {
      this.lastTimestamp = t;
      this.frame(t);
    });
  }
}

const game = new Game();
window.__game = game;
if (AUTOPLAY) {
  // Autoplay starts the run on its own so a headless load plays end to end.
  game.startRun();
}
game.start();
