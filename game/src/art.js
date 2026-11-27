// Gobble Rush — all the art, drawn in code. No image files anywhere.
// Every sprite is a few canvas paths in the autumn palette from config.js.
import { GROUND_Y, PALETTE, VIEW_H } from './config.js';

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// The hero: a plump brown turkey with a fanned tail, red wattle and panicked eyes.
// pose: { runPhase, airborne, sliding, flapping, dashing }
export function drawTurkey(ctx, x, y, pose) {
  const phase = pose.runPhase || 0;
  const bob = pose.airborne ? 0 : Math.sin(phase * 2) * 3;
  const legSwing = pose.airborne ? 0.5 : Math.sin(phase) * 0.6;
  ctx.save();
  ctx.translate(x, y + bob);
  if (pose.sliding) {
    ctx.rotate(-0.35);
    ctx.scale(1.25, 0.62);
  }
  // Fanned tail behind the body.
  ctx.fillStyle = '#6b4423';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-26, -6);
    ctx.rotate(i * 0.42 - 0.5);
    ctx.beginPath();
    ctx.ellipse(0, -26, 9, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c98a3d';
    ctx.beginPath();
    ctx.ellipse(0, -26, 5, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4423';
    ctx.restore();
  }
  // Legs, scrambling.
  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 26);
  ctx.lineTo(-6 + Math.sin(phase) * 10, 44 - Math.abs(Math.cos(phase)) * 6);
  ctx.moveTo(8, 26);
  ctx.lineTo(8 + Math.sin(phase + Math.PI) * 10, 44 - Math.abs(Math.cos(phase + Math.PI)) * 6);
  ctx.stroke();
  // Body.
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 0, 0, 34, 30);
  ctx.fillStyle = '#a9743f';
  ellipse(ctx, 6, 6, 24, 20);
  // Wing, flapping when airborne.
  const wingLift = pose.flapping ? -0.9 : -0.25 + Math.sin(phase * 2) * 0.08;
  ctx.save();
  ctx.translate(-4, -4);
  ctx.rotate(wingLift);
  ctx.fillStyle = '#6b4423';
  ctx.beginPath();
  ctx.ellipse(-14, 0, 20, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Head and neck.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(26, -26, 9, 20, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c9a0';
  circle(ctx, 30, -44, 13);
  // Beak, wattle, eye — the panic is in the eye.
  ctx.fillStyle = '#f2a71b';
  ctx.beginPath();
  ctx.moveTo(40, -46);
  ctx.lineTo(54, -42);
  ctx.lineTo(40, -38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath();
  ctx.ellipse(36, -34, 4, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  circle(ctx, 33, -48, 4.5);
  ctx.fillStyle = '#1d1206';
  circle(ctx, 34, -48, 2.4);
  ctx.restore();
}

// The farmer: straw hat, red shirt, blue overalls, net in hand, always chasing.
export function drawFarmer(ctx, x, y, state, phase) {
  const running = state !== 'tripped';
  const legSwing = running ? Math.sin(phase) * 0.55 : 0;
  const lean = state === 'lunge' ? 0.3 : state === 'tripped' ? -0.5 : 0.18;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  // Legs.
  ctx.strokeStyle = '#3a5a8a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -52);
  ctx.lineTo(-6 + Math.sin(phase) * 14, 0);
  ctx.moveTo(6, -52);
  ctx.lineTo(6 + Math.sin(phase + Math.PI) * 14, 0);
  ctx.stroke();
  // Overalls + shirt.
  ctx.fillStyle = '#3a5a8a';
  ctx.fillRect(-16, -92, 32, 44);
  ctx.fillStyle = '#b4452c';
  ctx.fillRect(-18, -118, 36, 30);
  // Arms: one pumping, one holding the net up.
  ctx.strokeStyle = '#b4452c';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-14, -112);
  ctx.lineTo(-26, -88 + Math.sin(phase) * 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, -112);
  ctx.lineTo(30, -132);
  ctx.stroke();
  // Net: a hoop and mesh on a stick.
  ctx.strokeStyle = '#7a4a26';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(30, -132);
  ctx.lineTo(48, -168);
  ctx.stroke();
  ctx.strokeStyle = '#d8c9a0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(56, -176, 18, 14, 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(42, -182);
  ctx.lineTo(70, -170);
  ctx.moveTo(44, -166);
  ctx.lineTo(68, -184);
  ctx.stroke();
  // Head + straw hat.
  ctx.fillStyle = '#e8c9a0';
  circle(ctx, 0, -132, 14);
  ctx.fillStyle = '#e8c95a';
  ctx.beginPath();
  ctx.ellipse(0, -142, 26, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -148, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes: angry dots, or X eyes when tripped.
  ctx.fillStyle = '#1d1206';
  if (state === 'tripped') {
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('X', -8, -130);
    ctx.fillText('X', 4, -130);
  } else {
    circle(ctx, -5, -134, 2);
    circle(ctx, 5, -134, 2);
  }
  // Moustache.
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-7, -124);
  ctx.quadraticCurveTo(0, -120, 7, -124);
  ctx.stroke();
  ctx.restore();
}

export function drawCorn(ctx, x, y, bob) {
  ctx.save();
  ctx.translate(x, y + Math.sin(bob) * 3);
  ctx.rotate(0.5);
  ctx.fillStyle = '#f2c230';
  ellipse(ctx, 0, 0, 9, 16);
  ctx.fillStyle = '#d9941a';
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(i * 5 - 1, -12, 2, 24);
  }
  ctx.fillStyle = '#4d7a35';
  ctx.beginPath();
  ctx.moveTo(-6, 12);
  ctx.lineTo(0, 24);
  ctx.lineTo(6, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// One obstacle, drawn by type. Each returns nothing; the hitbox lives in farm.js.
export function drawObstacle(ctx, ob, time) {
  const x = ob.x;
  const ground = GROUND_Y;
  ctx.save();
  if (ob.type === 'fence') {
    ctx.fillStyle = '#7a4a26';
    ctx.fillRect(x - 4, ground - 74, 8, 74);
    ctx.fillRect(x + 34, ground - 74, 8, 74);
    ctx.fillStyle = '#a9743f';
    ctx.fillRect(x - 10, ground - 66, 58, 9);
    ctx.fillRect(x - 10, ground - 38, 58, 9);
  } else if (ob.type === 'hay') {
    ctx.fillStyle = '#e8b13c';
    ctx.beginPath();
    ctx.arc(x + 26, ground - 26, 32, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#8a5f14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + 26, ground - 26, 32, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = '#b9832a';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 26 + i * 10, ground - 52);
      ctx.lineTo(x + 26 + i * 12, ground - 8);
      ctx.stroke();
    }
  } else if (ob.type === 'puddle') {
    ctx.fillStyle = '#7fb3d9';
    ellipse(ctx, x + 40, ground - 4, 42, 8);
    ctx.fillStyle = '#a8cfe8';
    ellipse(ctx, x + 30, ground - 6, 18, 4);
  } else if (ob.type === 'pumpkin') {
    const roll = ob.rolling ? time * 6 : 0;
    ctx.save();
    ctx.translate(x + 26, ground - 26);
    ctx.rotate(roll * 0.2);
    ctx.fillStyle = '#e8702a';
    ellipse(ctx, 0, 0, 28, 25);
    ctx.strokeStyle = '#c85a17';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 25, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#4d7a35';
    ctx.fillRect(-3, -32, 6, 10);
    ctx.restore();
  } else if (ob.type === 'lantern') {
    const sway = Math.sin(time * 2 + ob.seed) * 0.12;
    ctx.save();
    ctx.translate(x + 20, ground - 190);
    ctx.rotate(sway);
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 100);
    ctx.stroke();
    ctx.fillStyle = '#f2a71b';
    ctx.beginPath();
    ctx.ellipse(0, 122, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath();
    ctx.ellipse(0, 122, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (ob.type === 'oven') {
    // The oven: a big stove with a door that blasts open on a timer.
    const open = ob.openAmount || 0;
    ctx.fillStyle = '#8a8f96';
    ctx.fillRect(x - 10, ground - 150, 120, 150);
    ctx.fillStyle = '#5a5f66';
    ctx.fillRect(x - 10, ground - 150, 120, 14);
    ctx.fillStyle = '#2c2f33';
    for (let i = 0; i < 4; i++) circle(ctx, x + 14 + i * 28, ground - 138, 7);
    ctx.fillStyle = '#1d1206';
    ctx.fillRect(x + 6, ground - 118, 88, 96);
    ctx.fillStyle = open > 0.5 ? '#ff7a1a' : '#3a1d08';
    ctx.fillRect(x + 12, ground - 112, 76, 84);
    if (open > 0.5) {
      ctx.fillStyle = '#ffd28a';
      ctx.fillRect(x + 20, ground - 100, 60, 10);
      ctx.fillRect(x + 20, ground - 80, 60, 10);
    }
    // Heat glow last, so it spills out past the stove body instead of hiding behind it.
    if (open > 0.05) {
      const glow = ctx.createRadialGradient(x + 50, ground - 60, 4, x + 50, ground - 60, 110 * open);
      glow.addColorStop(0, 'rgba(255,120,20,0.55)');
      glow.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 70, ground - 170, 260, 180);
    }
    // Door swung down as a ramp the turkey must jump.
    ctx.save();
    ctx.translate(x + 6, ground - 22);
    ctx.rotate(-open * 1.1);
    ctx.fillStyle = '#6a6f76';
    ctx.fillRect(0, 0, 88, 10);
    ctx.restore();
  } else if (ob.type === 'knife') {
    // A carving knife swinging from a ceiling beam: slide under it on the beat.
    // The pivot sits high so the hanging blade just clears a sliding turkey.
    const angle = Math.sin(time * 1.9 + ob.seed) * 0.9;
    ctx.save();
    ctx.translate(x + 20, ground - 240);
    ctx.rotate(angle);
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 96);
    ctx.stroke();
    ctx.fillStyle = '#e8edf2';
    ctx.beginPath();
    ctx.moveTo(-11, 96);
    ctx.lineTo(11, 96);
    ctx.lineTo(4, 196);
    ctx.lineTo(-4, 196);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a4a26';
    ctx.fillRect(-8, 82, 16, 18);
    ctx.restore();
  } else if (ob.type === 'pot') {
    ctx.fillStyle = '#4a4f55';
    ctx.beginPath();
    ctx.ellipse(x + 30, ground - 30, 32, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c2f33';
    ctx.beginPath();
    ctx.ellipse(x + 30, ground - 52, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9a86a';
    ctx.beginPath();
    ctx.ellipse(x + 30, ground - 54, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (ob.type === 'slick') {
    ctx.fillStyle = '#c9a86a';
    ellipse(ctx, x + 45, ground - 3, 48, 7);
    ctx.fillStyle = '#e8d9a0';
    ellipse(ctx, x + 32, ground - 5, 20, 3);
  }
  ctx.restore();
}

export function drawGate(ctx, x) {
  ctx.save();
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(x - 8, GROUND_Y - 220, 14, 220);
  ctx.fillRect(x + 92, GROUND_Y - 220, 14, 220);
  ctx.fillStyle = '#4d7a35';
  ctx.fillRect(x - 14, GROUND_Y - 226, 128, 16);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FOREST', x + 50, GROUND_Y - 236);
  ctx.fillStyle = 'rgba(120,200,90,0.35)';
  ctx.fillRect(x, GROUND_Y - 210, 98, 210);
  ctx.restore();
}

// Parallax background per act: sky, sun, hills, then act scenery.
export function drawBackground(ctx, actIndex, distance, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(0.55, PALETTE.skyMid);
  sky.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);
  // Sun.
  ctx.fillStyle = '#fff3c9';
  circle(ctx, 1080, 110, 46);
  ctx.fillStyle = 'rgba(255,243,201,0.4)';
  circle(ctx, 1080, 110, 70);
  // Drifting clouds.
  ctx.fillStyle = 'rgba(255,250,235,0.85)';
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 520 - distance * 8) % 1500 + 1500) % 1500 - 110;
    ellipse(ctx, cx, 80 + i * 42, 70, 20);
    ellipse(ctx, cx + 44, 88 + i * 42, 50, 16);
  }
  // Far hills.
  ctx.fillStyle = actIndex === 2 ? '#c98a5a' : '#d9a441';
  ctx.beginPath();
  ctx.moveTo(0, 470);
  for (let x = 0; x <= 1280; x += 64) {
    ctx.lineTo(x, 450 + Math.sin((x + distance * 30) * 0.006) * 26);
  }
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.closePath();
  ctx.fill();
  if (actIndex === 0) {
    // Farmyard: barn, fence line, pumpkins.
    const barnX = 900 - ((distance * 24) % 1600);
    ctx.fillStyle = PALETTE.barnRed;
    ctx.fillRect(barnX, 300, 220, 170);
    ctx.fillStyle = '#8a2f1d';
    ctx.beginPath();
    ctx.moveTo(barnX - 12, 302);
    ctx.lineTo(barnX + 110, 220);
    ctx.lineTo(barnX + 232, 302);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(barnX + 88, 380, 44, 90);
    ctx.fillStyle = '#fff6e0';
    ctx.fillRect(barnX + 30, 330, 34, 34);
    ctx.fillRect(barnX + 156, 330, 34, 34);
    ctx.fillStyle = '#e8702a';
    circle(ctx, 180, 560, 18);
    circle(ctx, 230, 566, 14);
    circle(ctx, 620, 568, 16);
  } else if (actIndex === 1) {
    // Barn interior: wooden wall, beams, hanging lanterns, hay.
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(0, 180, 1280, 290);
    ctx.fillStyle = '#6b4423';
    for (let x = 0; x < 1280; x += 160) ctx.fillRect(x, 180, 10, 290);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(0, 180, 1280, 18);
    ctx.fillRect(0, 330, 1280, 14);
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(150, 470, 34, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1120, 470, 30, Math.PI, 0);
    ctx.fill();
  } else {
    // Kitchen: tiled wall, window with autumn trees, counter line.
    ctx.fillStyle = '#f7e3c2';
    ctx.fillRect(0, 120, 1280, 350);
    ctx.strokeStyle = '#e0c9a0';
    ctx.lineWidth = 2;
    for (let y = 150; y < 470; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#bfe0f0';
    ctx.fillRect(180, 170, 220, 170);
    ctx.fillStyle = '#4d7a35';
    circle(ctx, 250, 300, 46);
    circle(ctx, 330, 310, 36);
    ctx.fillStyle = '#e8702a';
    circle(ctx, 240, 320, 12);
    circle(ctx, 320, 322, 10);
    ctx.strokeStyle = '#7a4a26';
    ctx.lineWidth = 8;
    ctx.strokeRect(180, 170, 220, 170);
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(0, 470, 1280, 130);
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(0, 470, 1280, 10);
  }
  // Falling leaves, always.
  ctx.fillStyle = 'rgba(217,130,30,0.85)';
  for (let i = 0; i < 14; i++) {
    const lx = ((i * 173 + time * 30) % 1360) - 40;
    const ly = ((i * 97 + time * 55) % 620) + 20;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(time * 0.8 + i);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
  // Ground.
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, 720);
  if (actIndex === 0) {
    groundGrad.addColorStop(0, '#c98a3d');
    groundGrad.addColorStop(1, '#a9743f');
  } else if (actIndex === 1) {
    groundGrad.addColorStop(0, '#a9743f');
    groundGrad.addColorStop(1, '#7a4a26');
  } else {
    groundGrad.addColorStop(0, '#d9c9a8');
    groundGrad.addColorStop(1, '#b8a67e');
  }
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, 1280, 120);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, GROUND_Y, 1280, 6);
}

// A soft shadow under a character at ground level.
export function drawShadow(ctx, x, width) {
  ctx.fillStyle = 'rgba(40,20,5,0.25)';
  ellipse(ctx, x, GROUND_Y + 8, width, 7);
}
