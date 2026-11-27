// Gobble Rush — the farm: three acts, obstacle spawning, corn, and the forest gate.
// Distances are in metres; the world scrolls left past a turkey fixed at TURKEY_X.
import {
  ACTS, GATE_DISTANCE, GROUND_Y, PX_PER_METRE, TURKEY_X,
  mulberry32, clamp,
} from './config.js';

// What the turkey must do about each obstacle, and how big its hitbox is.
export const OBSTACLE_DEFS = {
  fence: { kind: 'jump', w: 58, h: 74 },
  hay: { kind: 'jump', w: 56, h: 56 },
  puddle: { kind: 'jump', w: 84, h: 12 },
  pumpkin: { kind: 'jump', w: 56, h: 52, rolling: true },
  lantern: { kind: 'slide', w: 36, h: 96 },
  oven: { kind: 'jump', w: 110, h: 150 },
  knife: { kind: 'slide', w: 40, h: 190 },
  pot: { kind: 'jump', w: 64, h: 60 },
  slick: { kind: 'slide', w: 92, h: 10 },
};

export class Farm {
  constructor(seed) {
    this.rng = mulberry32(seed || 1);
    this.reset();
  }

  reset() {
    this.distance = 0;
    this.speed = ACTS[0].speed;
    this.actIndex = 0;
    this.obstacles = [];
    this.corns = [];
    this.nextSpawnAt = 1300;
    this.gateX = null;
    this.cornerDone = false;
    this.time = 0;
    this.crossLog = [];
  }

  act() {
    return ACTS[this.actIndex];
  }

  actName() {
    return this.act().name;
  }

  update(dt, turkey) {
    this.time += dt;
    const prevAct = this.actIndex;
    this.actIndex = this.distance >= 650 ? 2 : this.distance >= 300 ? 1 : 0;
    const act = this.act();
    this.speed = act.speed;
    const px = this.speed * dt;
    this.distance += px / PX_PER_METRE;

    // Spawn obstacles ahead of the screen, with act-scaled gaps.
    this.nextSpawnAt -= px;
    if (this.nextSpawnAt <= 0 && this.distance < GATE_DISTANCE - 30) {
      this.spawnObstacle();
      const gapSeconds = act.gapMin + this.rng() * (act.gapMax - act.gapMin);
      this.nextSpawnAt = gapSeconds * this.speed;
    }

    for (const ob of this.obstacles) {
      ob.x -= px;
      if (ob.type === 'pumpkin' && ob.rolling) ob.x -= px * 0.35;
      if (ob.type === 'oven') {
        // The oven door cycles: shut, then blasting open with a heat glow.
        ob.cycle = (ob.cycle + dt) % 2.6;
        ob.openAmount = ob.cycle > 1.6 ? clamp((ob.cycle - 1.6) / 0.4, 0, 1) : 0;
      }
    }
    this.obstacles = this.obstacles.filter((ob) => ob.x > -220);

    for (const corn of this.corns) corn.x -= px;
    this.corns = this.corns.filter((corn) => corn.x > -40 && !corn.eaten);

    if (this.distance >= GATE_DISTANCE - 40 && this.gateX === null) {
      this.gateX = 1400;
    }
    if (this.gateX !== null) this.gateX -= px;

    return { actChanged: this.actIndex !== prevAct };
  }

  spawnObstacle() {
    const act = this.act();
    const type = act.types[Math.floor(this.rng() * act.types.length)];
    const def = OBSTACLE_DEFS[type];
    const ob = {
      type,
      x: 1340,
      seed: this.rng() * 10,
      passed: false,
      cycle: this.rng() * 2.6,
      openAmount: 0,
      rolling: !!def.rolling,
    };
    this.obstacles.push(ob);
    // Corn trails reward the jump or the slide the obstacle asks for.
    if (this.rng() < 0.6) {
      const high = def.kind === 'jump';
      const n = 3;
      for (let i = 0; i < n; i++) {
        this.corns.push({
          x: 1300 + i * 46,
          y: high ? GROUND_Y - 150 : GROUND_Y - 34,
          eaten: false,
        });
      }
    }
  }

  // Hitbox of an obstacle, shrunk a little so near-misses feel fair.
  obstacleBox(ob) {
    const def = OBSTACLE_DEFS[ob.type];
    if (ob.type === 'lantern') {
      return { x: ob.x + 6, y: GROUND_Y - 190, w: 26, h: 144 };
    }
    if (ob.type === 'knife') {
      // The blade is a pendulum: its tip is the danger, and it swings.
      // Swung out, the tip rises above the turkey; hanging straight, it
      // reaches low enough to catch a standing turkey but not a sliding one.
      const angle = Math.sin(this.time * 1.9 + ob.seed);
      const tipX = ob.x + 20 + Math.sin(angle) * 196;
      const tipY = GROUND_Y - 240 + Math.cos(angle) * 196;
      return { x: tipX - 11, y: tipY - 11, w: 22, h: 22 };
    }
    if (ob.type === 'oven') {
      return { x: ob.x + 2, y: GROUND_Y - 118, w: 92, h: 118 };
    }
    if (ob.type === 'puddle' || ob.type === 'slick') {
      return { x: ob.x, y: GROUND_Y - 10, w: def.w, h: 10 };
    }
    return { x: ob.x, y: GROUND_Y - def.h, w: def.w, h: def.h };
  }

  static boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Checks the turkey against everything. Returns the events of this frame.
  checkCollisions(turkey) {
    const events = { hit: null, cleared: false, corn: false, smashed: false, nearMiss: false };
    const tb = turkey.hitbox();
    for (const ob of this.obstacles) {
      const box = this.obstacleBox(ob);
      if (!box) continue;
      if (!ob.passed && ob.x + OBSTACLE_DEFS[ob.type].w < turkey.x - 30) {
        ob.passed = true;
        if (!ob.hit) {
          events.cleared = true;
          this.crossLog.push({ at: Math.floor(this.distance), type: ob.type, outcome: 'cleared', y: Math.round(turkey.y), ground: turkey.onGround });
        }
        // Cleared it closely: a near-miss bonus.
        if (Math.abs(tb.y + tb.h - (GROUND_Y - OBSTACLE_DEFS[ob.type].h)) < 60) {
          events.nearMiss = true;
        }
      }
      if (turkey.invulnTimer > 0) continue;
      if (Farm.boxesOverlap(tb, box)) {
        if (ob.type === 'hay' && turkey.sliding) {
          // Sliding through a hay bale smashes it and speeds the turkey up.
          ob.passed = true;
          ob.smashed = true;
          events.smashed = true;
          continue;
        }
        if (ob.type === 'pumpkin' && turkey.dashing) {
          ob.passed = true;
          ob.smashed = true;
          events.smashed = true;
          continue;
        }
        events.hit = ob.type;
        ob.hit = true;
        break;
      }
    }
    this.obstacles = this.obstacles.filter((ob) => !ob.smashed);
    for (const corn of this.corns) {
      if (corn.eaten) continue;
      const dx = corn.x - turkey.x;
      const dy = corn.y - (turkey.y - 40);
      if (Math.abs(dx) < 34 && Math.abs(dy) < 44) {
        corn.eaten = true;
        events.corn = true;
      }
    }
    return events;
  }

  reachedGate() {
    return this.gateX !== null && this.gateX < TURKEY_X + 40;
  }

  // The kitchen-door pinch: the farmer sprints ahead once, at ~660 m.
  cornerMoment() {
    if (!this.cornerDone && this.distance >= 660 && this.distance < 700) {
      this.cornerDone = true;
      return true;
    }
    return false;
  }
}
