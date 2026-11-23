// Test frame: scenario "Besuch in 18 Minuten", step 2 of 5, dicing an onion at the counter.
import { PAL, setClock, shape, ink, ellipse, rrect, rect, text, paperFinish, plane, star, sparkle, arrow } from './engine/toon.js';
import { drawCook, drawHand, reach, reachRelaxed, gripError } from './engine/chars.js';
import { pot, steam, board, onionCut, dice, timer } from './props.js';

export function draw(ctx, t) {
  setClock(0.25);
  const W = 1920, H = 1080, top = 640;
  // one ground colour: a teal-free wall (the presenter wears teal), a darker counter
  plane(ctx, rect(0, 0, W, H), PAL.blueL);
  // a few atomic ornaments on the wall instead of a drawn room
  [[1580, 140, 26], [1700, 230, 16], [260, 380, 18]].forEach(([x, y, r], i) => sparkle(ctx, x, y, r, { fill: PAL.white, alpha: 0.9, rot: i * 0.3 }));
  ink(ctx, [[0, 470], [600, 470]], 3, { seed: 3, breaks: 0.5, color: PAL.blueD });
  ink(ctx, [[1300, 470], [1920, 470]], 3, { seed: 4, breaks: 0.5, color: PAL.blueD });
  // timer on the wall: the scenario clock
  timer(ctx, 1290, 250, 84, 18);
  text(ctx, 'Besuch in', 1410, 228, { font: '700 44px Oleo', fill: PAL.ink, plate: PAL.white });
  text(ctx, '18 Min.', 1410, 292, { font: '64px Slab', fill: PAL.ink, plate: PAL.coral });
  // layout first: the board and onion sit in front of the cook's belly, at counter height;
  // the cook faces the camera like a presenter behind a counter (how people really stand to cut)
  const CX = 960, boardTop = top - 30, S = 1.5;
  const pose = { x: CX, y: top + 215 * S, s: S, view: 'front', face: 'neutral', look: [4, 10], armsFront: true,
    handB: 'grip', propB: { kind: 'knifeDown', len: 48, blade: Math.PI / 2 + 0.06 }, handF: 'grip' };
  const L2S = (lx, ly) => [CX + lx * S, pose.y + ly * S];
  // onion half, dome up, a little right of the belly (his left hand side)
  const onion = L2S(36, -235);
  // guide hand: claw on top of the onion, fingertips curled down toward the board
  const guide = L2S(38, -262);
  reachRelaxed(pose, 'F', guide[0], guide[1], Math.PI / 2 + 0.25, 14, 1.3);
  // knife hand: fist just above the onion's left edge, blade straight down beside it
  const fist = L2S(-8, -290);
  reachRelaxed(pose, 'B', fist[0], fist[1], 0.2, 22, Math.PI - 1.3);
  // check: hands on their objects (6 px), poses relaxed (reachRelaxed throws otherwise)
  const errs = [gripError(pose, 'F', ...guide, 14), gripError(pose, 'B', ...fist)];
  if (errs.some(e => e > 6)) throw new Error('hand off its object: ' + errs.map(e => e.toFixed(1)).join(', '));
  window.HAND_ERR = errs; window.FORE = [pose.foreB, pose.foreF];
  drawCook(ctx, { ...pose, propB: null }, t);
  // counter
  shape(ctx, rect(-20, top, W + 40, H - top + 20), { fill: PAL.kraftL, line: 0, seed: 10, grain: 0.35, off: [0, 0] });
  shape(ctx, rect(-20, top, W + 40, 26), { fill: PAL.white, line: 4, seed: 11, grain: 0.2, breaks: 0.25 });
  [[300, 780], [900, 760], [1500, 790]].forEach(([x, y], i) => ink(ctx, [[x - 120, y], [x + 120, y]], 3, { seed: 12 + i, breaks: 0.5, color: PAL.kraftD }));
  board(ctx, CX, top + 4, 1.3);
  dice(ctx, CX - 110, boardTop, 1.0, 12);
  onionCut(ctx, onion[0], onion[1], 0.75);
  // arms again on top of the board, cut off at the counter edge so they read in front
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, top + 6); ctx.clip();
  drawCook(ctx, { ...pose, shadow: false, armsOnly: true }, t);
  ctx.restore();
  // pot on the hob, steaming
  pot(ctx, 1700, top + 10, 0.8);
  steam(ctx, 1700, top - 160, 1, t);
  // step header (top left)
  shape(ctx, ellipse(120, 110, 52, 52, 40), { fill: PAL.ink, line: 0, seed: 30, grain: 0.1, off: [0, 0] });
  text(ctx, '2', 120, 136, { font: '72px Slab', fill: PAL.paper, align: 'center' });
  text(ctx, 'SCHRITT 2 VON 5', 196, 92, { font: '600 24px Jost', fill: PAL.inkSoft, track: 6 });
  text(ctx, 'Zwiebel fein würfeln', 196, 150, { font: '58px Slab', fill: PAL.ink, plate: PAL.white });
  // call-out: the claw grip, drawn at native scale in a circle
  const cx = 1440, cy = 850, R = 130, OXc = 1011;
  ink(ctx, [[cx - R * 0.7, cy - R * 0.7], [OXc + 30, top - 40]], 4, { seed: 40, breaks: 0.3 });
  shape(ctx, ellipse(cx, cy, R, R, 48), { fill: PAL.paper, line: 5, seed: 41, grain: 0.2 });
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 6, 0, Math.PI * 2); ctx.clip();
  board(ctx, cx, cy + 92, 1.6);
  // whole onion half seen from the side, fingertips curled on top, the blade flat against the knuckles
  shape(ctx, ellipse(cx - 20, cy + 50, 92, 74, 40, Math.PI, Math.PI * 2), { fill: PAL.plum, line: 4.5, seed: 42, grain: 0.3 });
  ink(ctx, [[cx - 112, cy + 50], [cx + 72, cy + 50]], 4.5, { seed: 43, taper: false });
  drawHand(ctx, cx - 50, cy - 18, 0.25, 'grip', 1, 2.3);
  shape(ctx, [[cx + 40, cy - 70], [cx + 64, cy - 70], [cx + 64, cy + 60], [cx + 40, cy + 40]], { fill: PAL.chrome, line: 4, seed: 44, grain: 0.05,
    shade: [{ pts: [[cx + 54, cy - 80], [cx + 70, cy - 80], [cx + 70, cy + 70], [cx + 54, cy + 70]], color: PAL.chromeD, alpha: 0.6 }] });
  ctx.restore();
  // the tip card
  shape(ctx, rrect(120, 880, 760, 120, 22), { fill: PAL.paper, line: 4, seed: 50, grain: 0.2 });
  star(ctx, 168, 940, 22, { fill: PAL.mustard, line: 2.5 });
  text(ctx, 'Finger einkrallen, Messer am Knöchel führen', 206, 952, { font: '500 34px Jost', fill: PAL.ink, maxW: 650 });
  paperFinish(ctx, W, H, 0.8);
}
