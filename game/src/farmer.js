// Gobble Rush — the farmer: he chases, trips, lunges, and corners the turkey.
// The "gap" is the game's hidden health bar: 1 = far behind, 0 = on top of you.
import { clamp, lerp } from './config.js';

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = 0.55;
    this.state = 'chase';
    this.stateTimer = 0;
    this.phase = 0;
    this.lungeWarned = false;
    this.cornered = false;
    // Screen x of the farmer, from the gap: close gap = close behind the turkey.
    this.x = 120;
  }

  get screenX() {
    // Gap 1 -> 90 px behind the turkey; gap 0 -> right on his tail feathers.
    return lerp(238, 96, this.gap);
  }

  // Events the main loop feeds in: { cleared, corn, stumbled, dashed, smashed }.
  // Returns one of: null | 'lungeWarn' | 'tripped' | 'caught'.
  update(dt, turkey, events, speed) {
    this.phase += dt * speed * 0.03;
    this.stateTimer -= dt;
    let result = null;

    if (this.state === 'trip') {
      if (this.stateTimer <= 0) {
        this.state = 'chase';
        this.gap = Math.max(this.gap, 0.5);
      }
      return null;
    }

    if (this.state === 'lunge') {
      // Wind-up: the turkey has 0.45 s to jump or dash away.
      if (!this.lungeWarned) {
        this.lungeWarned = true;
        result = 'lungeWarn';
      }
      if (this.stateTimer <= 0) {
        if (!turkey.onGround || turkey.dashing) {
          // He grabs at air, face-plants, and loses the trail.
          this.state = 'trip';
          this.stateTimer = 1.1;
          this.gap = 0.6;
          result = 'tripped';
        } else {
          // He catches the turkey — but a catch costs a feather, not the run.
          // He stumbles after the grab, so the same lunge never fires twice.
          this.state = 'trip';
          this.stateTimer = 1.0;
          this.gap = 0.6;
          result = 'caught';
        }
      }
      return result;
    }

    if (this.state === 'corner') {
      // At the kitchen door he sprints ahead to block the exit; the pinch is
      // resolved by farm.js (the oven + knife), he just holds his ground here.
      if (this.stateTimer <= 0) this.state = 'chase';
      return null;
    }

    // Chase: the gap breathes with how the run is going.
    if (events.cleared) this.gap = clamp(this.gap + 0.07, 0, 1);
    if (events.corn) this.gap = clamp(this.gap + 0.02, 0, 1);
    if (events.stumbled) this.gap = clamp(this.gap - 0.28, 0, 1);
    if (events.dashed) {
      this.gap = clamp(this.gap + 0.22, 0, 1);
      if (this.gap > 0.62 && Math.random() < 0.5) {
        this.state = 'trip';
        this.stateTimer = 0.9;
        return 'tripped';
      }
    }
    if (events.smashed) this.gap = clamp(this.gap + 0.1, 0, 1);
    // Slowly drifts back toward the middle so a clean run is never free.
    this.gap = clamp(this.gap + (0.5 - this.gap) * dt * 0.05, 0, 1);

    if (this.gap <= 0.12) {
      this.state = 'lunge';
      this.stateTimer = 0.45;
      this.lungeWarned = false;
    }
    return result;
  }

  startCorner() {
    if (this.state === 'chase') {
      this.state = 'corner';
      this.stateTimer = 2.2;
      this.cornered = true;
    }
  }

  trip() {
    this.state = 'trip';
    this.stateTimer = 1.0;
    this.gap = Math.max(this.gap, 0.55);
  }
}
