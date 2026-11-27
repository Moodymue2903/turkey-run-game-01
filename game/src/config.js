// Gobble Rush — shared constants: one place for every number the game tunes by.
// The palette is autumn throughout: gold farmyard, brown barn, hot-orange kitchen.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 600;
export const TURKEY_X = 300;
export const GATE_DISTANCE = 1000;
export const PX_PER_METRE = 24;
export const GRAVITY = 2600;
export const JUMP_VELOCITY = -980;
export const FLAP_VELOCITY = -720;
export const COYOTE_MS = 120;
export const BUFFER_MS = 140;
export const BASE_SPEED = 430;

export const PALETTE = {
  skyTop: '#ffe9b0',
  skyMid: '#ffd28a',
  skyBottom: '#ffb36b',
  barnRed: '#b4452c',
  barnBrown: '#7a4a26',
  kitchenCream: '#f7e3c2',
  kitchenOrange: '#e8702a',
  leafGreen: '#4d7a35',
  gold: '#f2a71b',
  cream: '#fff6e0',
  darkBrown: '#4a2c14',
  feather: '#8a5a2b',
};

// One act = one stage of the escape. Speed and gap tighten as the acts go on;
// the kitchen is the only act with the oven and the swinging carving knife.
export const ACTS = [
  {
    name: 'Farmyard',
    from: 0,
    to: 300,
    speed: 430,
    gapMin: 0.95,
    gapMax: 1.45,
    types: ['fence', 'hay', 'puddle'],
  },
  {
    name: 'Barn',
    from: 300,
    to: 650,
    speed: 490,
    gapMin: 0.9,
    gapMax: 1.25,
    types: ['fence', 'pumpkin', 'lantern', 'hay', 'puddle'],
  },
  {
    name: 'Kitchen',
    from: 650,
    to: 1000,
    speed: 550,
    gapMin: 0.9,
    gapMax: 1.1,
    types: ['oven', 'knife', 'pot', 'slick', 'pumpkin', 'fence'],
  },
];

// Small deterministic RNG so a seeded run plays the same way twice.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value, low, high) {
  return value < low ? low : value > high ? high : value;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
