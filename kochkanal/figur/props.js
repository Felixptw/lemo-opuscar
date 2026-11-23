// Kitchen props in the Mid-century style. (x, y) = where the object stands on the counter.
import { PAL, shape, ink, ellipse, rrect, rect, spline } from './engine/toon.js';
export function pot(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // handles, body, rim, a darker inside
  [-1, 1].forEach((d, i) => shape(ctx, rrect(d > 0 ? 120 : -160, -150, 40, 18, 8), { fill: PAL.ink, line: 0, seed: 200 + i, off: [0, 0], grain: 0 }));
  shape(ctx, spline([[-125, -170], [125, -170], [118, -18], [100, 0], [-100, 0], [-118, -18]], true, 4), { fill: o.color || PAL.coral, line: 4.5, seed: 202, grain: 0.3,
    shade: [{ pts: [[50, -180], [140, -180], [140, 10], [64, 10]], color: PAL.coralD, alpha: 0.6 }] });
  shape(ctx, ellipse(0, -170, 125, 24, 40), { fill: PAL.coralD, line: 4.5, seed: 203, grain: 0.2 });
  shape(ctx, ellipse(0, -166, 108, 16, 40), { fill: o.inside || PAL.mustardL, line: 0, seed: 204, grain: 0.3 });
  ink(ctx, [[-100, -60], [100, -60]], 3, { seed: 205, breaks: 0.4, color: PAL.coralD });
  ctx.restore();
}
export function steam(ctx, x, y, s, t) {
  for (let i = 0; i < 3; i++) {
    const ph = Math.floor(t * 12) / 12 + i * 0.37, dx = (i - 1) * 50 * s;
    const pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20; pts.push([x + dx + Math.sin(u * 6 + ph * 3) * 14 * s, y - u * 150 * s]); }
    ink(ctx, pts, 6 * s, { seed: 210 + i, color: PAL.white, taper: true, wob: 0.3 });
  }
}
export function board(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shape(ctx, rrect(-190, -26, 380, 26, 10), { fill: PAL.kraft, line: 4, seed: 220, grain: 0.35,
    shade: [{ pts: rect(-200, -10, 400, 20), color: PAL.kraftD, alpha: 0.7 }] });
  shape(ctx, ellipse(160, -13, 8, 8, 12), { fill: PAL.kraftD, line: 2.5, seed: 221, grain: 0 });
  ctx.restore();
}
// half onion lying cut side up + a little heap of dice
export function onionCut(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  shape(ctx, spline([[-60, 0], [-56, -36], [-20, -62], [30, -60], [58, -30], [60, 0]], true, 6), { fill: PAL.plum, line: 4, seed: 230, grain: 0.3 });
  shape(ctx, ellipse(0, -2, 58, 14, 30), { fill: PAL.white, line: 3.5, seed: 231, grain: 0.1 });
  for (let r = 1; r <= 3; r++) ink(ctx, ellipse(0, -2, 14 * r, 3.5 * r, 24), 2, { closed: true, seed: 232 + r, color: PAL.pinkD, breaks: 0.3 });
  ctx.restore();
}
export function dice(ctx, x, y, s = 1, n = 14) {
  for (let i = 0; i < n; i++) {
    const dx = ((i * 37) % 90 - 45) * s, dy = -((i * 13) % 3) * 9 * s;
    shape(ctx, rrect(x + dx - 7 * s, y + dy - 12 * s, 14 * s, 12 * s, 3 * s), { fill: PAL.white, line: 2.4, seed: 240 + i, grain: 0.05, breaks: 0.1 });
  }
}
export function timer(ctx, x, y, r, mins) {
  shape(ctx, ellipse(x, y, r, r, 40), { fill: PAL.white, line: 5, seed: 250, grain: 0.2 });
  shape(ctx, rrect(x - 14, y - r - 22, 28, 22, 6), { fill: PAL.ink, line: 0, seed: 251, off: [0, 0], grain: 0 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ink(ctx, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]], 3, { seed: 252 + i, taper: false }); }
  // remaining time as a coral wedge
  const a0 = -Math.PI / 2, a1 = a0 + mins / 60 * Math.PI * 2, pts = [[x, y]];
  for (let k = 0; k <= 30; k++) { const a = a0 + (a1 - a0) * k / 30; pts.push([x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7]); }
  shape(ctx, pts, { fill: PAL.coral, line: 2.5, seed: 265, grain: 0.2 });
}
