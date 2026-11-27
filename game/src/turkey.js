// Gobble Rush — the turkey: run, jump, flap, slide, dash, and losing feathers.
import {
  GRAVITY, GROUND_Y, JUMP_VELOCITY, FLAP_VELOCITY,
  COYOTE_MS, BUFFER_MS, TURKEY_X, clamp,
} from './config.js';

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = TURKEY_X;
    this.y = GROUND_Y;
    this.vy = 0;
    this.onGround = true;
    this.sliding = false;
    this.slideTimer = 0;
    this.flapped = false;
    this.coyoteTimer = 0;
    this.bufferTimer = 0;
    this.dashTimer = 0;
    this.dashMeter = 1;
    this.dashCooldown = 0;
    this.feathers = 3;
    this.invulnTimer = 0;
    this.runPhase = 0;
    this.flapAnim = 0;
    this.slowTimer = 0;
  }

  get dashing() {
    return this.dashTimer > 0;
  }

  get height() {
    return this.sliding ? 44 : 78;
  }

  // The hitbox is smaller than the sprite on purpose: near-misses feel fair.
  hitbox() {
    const w = this.sliding ? 62 : 44;
    return { x: this.x - w / 2, y: this.y - this.height + 8, w, h: this.height - 12 };
  }

  requestJump() {
    this.bufferTimer = BUFFER_MS / 1000;
  }

  requestSlide() {
    if (this.onGround && !this.sliding) {
      this.sliding = true;
      this.slideTimer = 0.55;
      return true;
    }
    return false;
  }

  requestDash() {
    if (this.dashMeter >= 0.99 && this.dashCooldown <= 0) {
      this.dashTimer = 0.32;
      this.dashMeter = 0;
      this.dashCooldown = 0.5;
      return true;
    }
    return false;
  }

  // Returns 'jump' | 'flap' | null so the caller can play the right sound.
  update(dt, speed) {
    const dtMs = dt * 1000;
    this.coyoteTimer -= dt;
    this.bufferTimer -= dt;
    this.invulnTimer -= dt;
    this.dashCooldown -= dt;
    this.slowTimer -= dt;
    this.flapAnim -= dt;
    let jumped = null;

    // Buffered jump: pressed slightly before landing still jumps.
    if (this.bufferTimer > 0) {
      if (this.onGround || this.coyoteTimer > 0) {
        this.vy = JUMP_VELOCITY;
        this.onGround = false;
        this.coyoteTimer = 0;
        this.bufferTimer = 0;
        this.sliding = false;
        jumped = 'jump';
      } else if (!this.flapped && this.vy > -100) {
        // One wing-flap in the air, at or after the jump's apex: a second,
        // smaller jump. Gated on the rise ending, so an early second press
        // never steals the first jump's height.
        this.vy = FLAP_VELOCITY;
        this.flapped = true;
        this.flapAnim = 0.3;
        this.bufferTimer = 0;
        jumped = 'flap';
      }
    }

    if (this.sliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.sliding = false;
    }

    if (this.dashTimer > 0) this.dashTimer -= dt;
    // The dash meter refills over about 6 seconds of running.
    if (this.dashMeter < 1) this.dashMeter = clamp(this.dashMeter + dt / 6, 0, 1);

    this.vy += GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND_Y) {
      if (!this.onGround && this.vy > 500) jumped = jumped || 'land';
      this.y = GROUND_Y;
      this.vy = 0;
      this.onGround = true;
      this.flapped = false;
      this.coyoteTimer = COYOTE_MS / 1000;
    } else if (this.onGround) {
      this.onGround = false;
      this.coyoteTimer = COYOTE_MS / 1000;
    }

    const runSpeed = this.slowTimer > 0 ? 0.55 : 1;
    this.runPhase += dt * speed * 0.028 * runSpeed;
    return jumped;
  }

  // A hit costs a feather and briefly slows the turkey so the farmer gains.
  takeHit() {
    if (this.invulnTimer > 0) return false;
    this.feathers -= 1;
    this.invulnTimer = 1.4;
    this.slowTimer = 0.7;
    return true;
  }
}
