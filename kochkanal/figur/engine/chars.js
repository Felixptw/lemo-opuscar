// The cook: an ambitious beginner in his early twenties, first flat of his own.
// Drawn with the Mid-century engine (toon.js): held body, only arms, hands, eyes and mouth act.
// Look: short dark hair with one cowlick that never lies flat, teal T-shirt, mustard apron with
// one stain that stays in every episode, navy trousers, white sneakers.
import { PAL, shape, ink, ellipse, spline, xform, move, rrect, rect, TAU, reg, path } from './toon.js';

export const NAVY = '#3B4766', NAVYD = '#2A3350';
export const SHIRT = PAL.teal, SHIRTD = PAL.tealD;
export const APRON = PAL.mustard, APROND = PAL.mustardD;

// pose: { x, y, s, dir, view:'q'|'front'|'side'|'back', face, armB:{a1,a2}, armF:{a1,a2}, handB, handF,
//         blink, look:[dx,dy], prop:{kind:'knife'|'spoon'|'taster', hand:'F'|'B'}, propB:{...} }
// units: feet at (0,0); hair top about -575. Angles: 0 = right, pi/2 = down.
const UA = 100, FA = 92;
export function armJoints(pose, which) {
  const view = pose.view || 'q';
  const sh = view === 'front' ? [which === 'F' ? 48 : -48, -384] : (which === 'F' ? [40, -384] : [-36, -386]);
  const rest = view === 'front' ? (which === 'F' ? { a1: 1.36, a2: 1.5 } : { a1: 1.78, a2: 1.64 }) : (which === 'F' ? { a1: 1.3, a2: 1.52 } : { a1: 1.86, a2: 1.7 });
  const arm = pose[which === 'F' ? 'armF' : 'armB'] || rest;
  const el = [sh[0] + Math.cos(arm.a1) * UA, sh[1] + Math.sin(arm.a1) * UA];
  const fore = pose[which === 'F' ? 'foreF' : 'foreB'] ?? 1;   // < 1: forearm points toward the camera (foreshortened)
  const ha = [el[0] + Math.cos(arm.a2) * FA * fore, el[1] + Math.sin(arm.a2) * FA * fore];
  return { sh, el, ha, a1: arm.a1, a2: arm.a2 };
}


// ---------------------------------------------------------------- reach: put a hand ON an object
// Every hand that touches something is placed with this, never with hand-typed angles, so a hand
// can never float away from what it is supposed to hold. (gx, gy) = the grip point on screen,
// ang = the direction the hand points (screen angle, before dir mirroring), grip = distance from
// the wrist to the grip point in local units. Throws if the arm cannot reach: then the cook has to
// stand closer, and the render fails instead of shipping a floating hand.
export function reach(pose, which, gx, gy, ang = 0, grip = 22) {
  const s = pose.s ?? 1, d = pose.dir ?? 1;
  const L = [(gx - pose.x) / (s * d), (gy - pose.y) / s];
  const a = d > 0 ? ang : Math.PI - ang;
  const W = [L[0] - Math.cos(a) * grip, L[1] - Math.sin(a) * grip];
  const base = armJoints({ ...pose, [which === 'F' ? 'armF' : 'armB']: { a1: 0, a2: 0 } }, which).sh;
  const dx = W[0] - base[0], dy = W[1] - base[1], dist = Math.hypot(dx, dy);
  if (dist > UA + FA - 2) throw new Error(`reach: ${which} hand cannot reach (${dist.toFixed(0)} > ${UA + FA}): move the cook closer`);
  const t = Math.atan2(dy, dx), k = Math.acos(Math.max(-1, Math.min(1, (UA * UA + dist * dist - FA * FA) / (2 * UA * dist))));
  // of the two elbow solutions take the lower one (elbows hang, they do not point up)
  const sol = [t + k, t - k].map(a1 => { const el = [base[0] + Math.cos(a1) * UA, base[1] + Math.sin(a1) * UA]; return { a1, a2: Math.atan2(W[1] - el[1], W[0] - el[0]), ey: el[1] }; });
  const best = sol[0].ey > sol[1].ey ? sol[0] : sol[1];
  pose[which === 'F' ? 'armF' : 'armB'] = { a1: best.a1, a2: best.a2 };
  pose[which === 'F' ? 'handAngF' : 'handAngB'] = a;
  return pose;
}

// The natural way to work at a counter: the upper arm hangs relaxed beside the body (a1 close to
// straight down, elbow near the waist), and only the forearm reaches out to the object, toward the
// camera when the object is in front of the body. The forearm's on-screen length follows from where
// the hand must be (foreshortening). Refuses poses nobody would stand in: an upper arm lifted away
// from the body, a forearm longer than it is, or a hand jammed into its own elbow.
export function reachRelaxed(pose, which, gx, gy, ang = 0, grip = 22, a1 = null) {
  const s = pose.s ?? 1, d = pose.dir ?? 1, front = (pose.view || 'q') === 'front';
  const L = [(gx - pose.x) / (s * d), (gy - pose.y) / s];
  const a = d > 0 ? ang : Math.PI - ang;
  const W = [L[0] - Math.cos(a) * grip, L[1] - Math.sin(a) * grip];
  const sh = armJoints({ ...pose, [which === 'F' ? 'armF' : 'armB']: { a1: 0, a2: 0 } }, which).sh;
  // relaxed default: straight down, a touch away from the body in front view
  if (a1 == null) a1 = front ? (sh[0] > 0 ? 1.45 : Math.PI - 1.45) : 1.5;
  const lift = Math.abs(Math.PI / 2 - a1);
  if (lift > 0.45) throw new Error(`reachRelaxed: ${which} upper arm lifted ${lift.toFixed(2)} rad from hanging: not relaxed`);
  const el = [sh[0] + Math.cos(a1) * UA, sh[1] + Math.sin(a1) * UA];
  const fx = W[0] - el[0], fy = W[1] - el[1], fl = Math.hypot(fx, fy), fore = fl / FA;
  if (fore > 1.02) throw new Error(`reachRelaxed: ${which} hand too far from the elbow (${fore.toFixed(2)}): move the object or the cook closer`);
  if (fore < 0.25) throw new Error(`reachRelaxed: ${which} hand jammed against the elbow (${fore.toFixed(2)}): move the object away from the body`);
  if (fy < -FA * 0.6) throw new Error(`reachRelaxed: ${which} forearm points up: the object is too high for working`);
  pose[which === 'F' ? 'armF' : 'armB'] = { a1, a2: Math.atan2(fy, fx) };
  pose[which === 'F' ? 'foreF' : 'foreB'] = fore;
  pose[which === 'F' ? 'handAngF' : 'handAngB'] = a;
  return pose;
}

// distance in px between where a hand's grip point is drawn and where it should be (for checks)
export function gripError(pose, which, gx, gy, grip = 22) {
  const J = armJoints(pose, which), a = pose[which === 'F' ? 'handAngF' : 'handAngB'] ?? J.a2, s = pose.s ?? 1, d = pose.dir ?? 1;
  const lx = J.ha[0] + Math.cos(a) * grip, ly = J.ha[1] + Math.sin(a) * grip;
  return Math.hypot(pose.x + lx * s * d - gx, pose.y + ly * s - gy);
}

// four-finger glove-less cartoon hand (three fingers + thumb), stroked first, filled second
export function drawHand(ctx, x, y, a, kind = 'open', side = 1, k = 1, skin = PAL.skin) {
  const parts = [], seps = [];
  const E = (cx, cy, rx, ry, rot = 0) => parts.push(ellipse(cx, cy, rx, ry, 18, 0, TAU, rot));
  E(12, 0, 15, 13.5);
  if (kind === 'open') {
    [-0.62, 0, 0.62].forEach(r => E(12 + Math.cos(r) * 25, Math.sin(r) * 25, 12, 5, r));
    E(4, -15 * side, 10, 5, -1.35 * side);
  } else if (kind === 'flat') {
    [-10, 0, 10].forEach((dy, i) => E(34 + (i === 1 ? 3 : 0), dy, 13, 4.8));
    E(10, -15 * side, 9, 5, -0.9 * side);
    seps.push([[24, -5], [40, -5]], [[24, 5], [40, 5]]);
  } else if (kind === 'point') {
    E(38, -5 * side, 19, 4.8); E(25, 5 * side, 7, 6); E(20, 11 * side, 6, 5.5); E(8, -14 * side, 8.5, 5, -1.0 * side);
  } else if (kind === 'thumb') {
    E(26, -2, 7, 7); E(27, 8, 6.5, 6.5); E(24, 16, 6, 6); E(12, -20, 5, 13, 0.2);
    seps.push([[20, 3], [30, 3]], [[20, 12], [29, 12]]);
  } else { E(26, -8, 6.5, 6.5); E(28, 1, 6.5, 6.5); E(25, 10, 6, 6); E(12, -14 * side, 9, 5.5, -0.4 * side); seps.push([[22, -3.5], [30, -3.5]], [[22, 5.5], [29, 5.5]]); }
  const P = parts.map(p => xform(p, x, y, a, k));
  ctx.save(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6 * k; ctx.lineJoin = 'round';
  for (const p of P) { path(ctx, p); ctx.stroke(); }
  const o = reg(77, 0.6); ctx.fillStyle = skin;
  for (const p of P) { path(ctx, move(p, o[0] * 0.5, o[1] * 0.5)); ctx.fill(); }
  ctx.lineWidth = 2.4 * k; ctx.lineCap = 'round';
  for (const s2 of seps) { const q = xform(s2, x, y, a, k); ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.stroke(); }
  ctx.restore();
}

// bare forearm with a short T-shirt sleeve at the shoulder
function arm(ctx, J, seed) {
  const up = spline([J.sh, [(J.sh[0] + J.el[0]) / 2, (J.sh[1] + J.el[1]) / 2], J.el], false, 6);
  const fore = spline([J.el, [(J.el[0] + J.ha[0]) / 2, (J.el[1] + J.ha[1]) / 2], J.ha], false, 6);
  const all = [...up, ...fore.slice(1)];
  ink(ctx, all, 24, { seed, taper: false, wob: 0.08 });
  const o = reg(seed, 1);
  ink(ctx, move(all, o[0] * 0.6, o[1] * 0.6), 15, { seed: seed + 1, taper: false, wob: 0.05, color: PAL.skin });
  // short sleeve: a fat ribbon from the shoulder to just above the elbow
  const sl = [J.sh, [J.sh[0] + (J.el[0] - J.sh[0]) * 0.55, J.sh[1] + (J.el[1] - J.sh[1]) * 0.55]];
  ink(ctx, sl, 40, { seed: seed + 2, taper: false, wob: 0.06 });
  ink(ctx, move(sl, o[0] * 0.6, o[1] * 0.6), 31, { seed: seed + 3, taper: false, wob: 0.04, color: SHIRT });
}
function drawArm(ctx, pose, which, seed) {
  const J = armJoints(pose, which);
  const prop = which === 'F' ? pose.prop : pose.propB;
  J.hang = pose[which === 'F' ? 'handAngF' : 'handAngB'] ?? J.a2;
  if (prop && prop.behind) drawProp(ctx, prop, J);
  arm(ctx, J, seed);
  const hk = pose[which === 'F' ? 'handF' : 'handB'] || 'open';
  J.hang = pose[which === 'F' ? 'handAngF' : 'handAngB'] ?? J.a2;
  drawHand(ctx, J.ha[0], J.ha[1], J.hang, hk, which === 'F' ? -1 : 1);
  if (prop && !prop.behind) drawProp(ctx, prop, J);
  return J;
}

export function drawCook(ctx, pose, t = 0) {
  const view = pose.view || 'q', face = pose.face || 'neutral';
  ctx.save(); ctx.translate(pose.x, pose.y); ctx.scale((pose.s ?? 1) * (pose.dir ?? 1), pose.s ?? 1);
  if (pose.shadow !== false) { ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.ellipse(6, 2, 90, 10, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  if (pose.armsOnly) { drawArm(ctx, pose, 'B', 70); drawArm(ctx, pose, 'F', 62); ctx.restore(); return; }
  const front = view === 'front' || view === 'back';
  if (view !== 'back' && !pose.armsFront) drawArm(ctx, pose, 'B', 70);
  // legs: straight navy trousers, white sneakers
  const legs = front ? [[[-46, -286], [-2, -286], [-6, -30], [-38, -30]], [[2, -286], [46, -286], [38, -30], [6, -30]]]
    : [[[-42, -286], [4, -286], [-2, -30], [-34, -30]], [[-2, -286], [46, -286], [38, -30], [8, -30]]];
  legs.forEach((L, i) => {
    const ax = (L[2][0] + L[3][0]) / 2;
    shape(ctx, L, { fill: NAVY, line: 3.8, seed: 42 + i, grain: 0.3, breaks: 0.15, shade: i === 1 && !front ? [{ pts: [[28, -290], [60, -290], [60, 0], [22, 0]], color: NAVYD, alpha: 0.7 }] : null });
    const sn = front ? rrect(ax - 22, -32, 44, 30, 12) : spline([[ax - 22, -30], [ax + 4, -32], [ax + 34, -14], [ax + 32, 0], [ax - 22, 0]], true, 4);
    shape(ctx, sn, { fill: PAL.white, line: 3.6, seed: 46 + i, grain: 0.1, breaks: 0.1 });
    ink(ctx, front ? [[ax - 20, -6], [ax + 20, -6]] : [[ax - 20, -6], [ax + 32, -6]], 5, { seed: 48 + i, taper: false, color: PAL.coral });
  });
  // T-shirt torso
  const torso = spline([[-54, -380], [-42, -402], [42, -402], [54, -380], [48, -318], [50, -282], [-48, -282], [-50, -318]], true, 6);
  shape(ctx, torso, { fill: SHIRT, line: 4.2, seed: 50, grain: 0.35, breaks: 0.2,
    shade: view === 'back' || front ? null : [{ pts: [[24, -404], [72, -404], [72, -270], [28, -270]], color: SHIRTD, alpha: 0.5 }] });
  // crew neck
  if (view !== 'back') ink(ctx, front ? ellipse(0, -402, 22, 9, 20, 0.1, Math.PI - 0.1) : ellipse(10, -402, 20, 8, 20, 0.1, Math.PI - 0.1), 3.4, { seed: 52, taper: true });
  // apron (not from behind: only the bow)
  if (view === 'back') {
    ink(ctx, [[-48, -300], [48, -300]], 8, { seed: 54, taper: false, color: APROND });
    shape(ctx, spline([[0, -300], [-30, -318], [-34, -286], [0, -300], [30, -318], [34, -286]], true, 3), { fill: APRON, line: 3, seed: 55, grain: 0.2 });
  } else {
    const ax = front ? 0 : 12;
    const bib = spline([[ax - 30, -372], [ax + 30, -372], [ax + 36, -300], [ax + 46, -170], [ax - 46, -170], [ax - 36, -300]], true, 3);
    shape(ctx, bib, { fill: APRON, line: 3.8, seed: 56, grain: 0.3, breaks: 0.2,
      shade: front ? null : [{ pts: [[ax + 18, -380], [ax + 70, -380], [ax + 70, -160], [ax + 26, -160]], color: APROND, alpha: 0.45 }] });
    ink(ctx, [[ax - 26, -372], [ax - 18, -404]], 4, { seed: 57, taper: false });
    ink(ctx, [[ax + 26, -372], [ax + 18, -404]], 4, { seed: 58, taper: false });
    shape(ctx, rrect(ax - 22, -262, 44, 34, 6), { fill: PAL.mustardL, line: 2.8, seed: 59, grain: 0.2, breaks: 0.3 });
    // the stain: the same tomato splash in every episode
    shape(ctx, spline([[ax + 10, -342], [ax + 22, -348], [ax + 26, -334], [ax + 18, -326], [ax + 8, -330]], true, 5), { fill: PAL.coral, line: 0, seed: 60, grain: 0.2 });
    shape(ctx, ellipse(ax + 30, -322, 3.5, 3.5, 10), { fill: PAL.coral, line: 0, seed: 61, grain: 0 });
  }
  drawHead(ctx, pose, view, face, t);
  if (view === 'back' || pose.armsFront) drawArm(ctx, pose, 'B', 70);
  drawArm(ctx, pose, 'F', 62);
  ctx.restore();
}

function cowlick(ctx, x, y, seed) {
  // one tuft that never lies flat: the character's silhouette mark
  shape(ctx, spline([[x - 10, y + 6], [x - 4, y - 18], [x + 10, y - 34], [x + 6, y - 12], [x + 14, y + 4]], true, 5), { fill: PAL.hair, line: 0, seed, grain: 0.3 });
  ink(ctx, spline([[x - 8, y + 2], [x - 2, y - 18], [x + 10, y - 32]], false, 5), 3, { seed: seed + 1, color: PAL.ink });
}
function drawHead(ctx, pose, view, face, t) {
  const blink = pose.blink ?? 0, look = pose.look || [0, 0];
  if (view === 'front' || view === 'back') {
    if (view === 'back') {
      shape(ctx, ellipse(0, -480, 56, 66, 36), { fill: PAL.skin, line: 4, seed: 61, grain: 0.15, breaks: 0.25 });
      shape(ctx, spline([[-58, -470], [-62, -520], [-30, -556], [20, -558], [58, -522], [60, -470], [30, -452], [-30, -452]], true, 6), { fill: PAL.hair, line: 0, seed: 62, grain: 0.3 });
      cowlick(ctx, 6, -552, 63); return;
    }
    // ears, then the egg face
    [-1, 1].forEach((sd, i) => shape(ctx, ellipse(sd * 56, -476, 10, 15, 14), { fill: PAL.skin, line: 3.4, seed: 64 + i, grain: 0.1 }));
    shape(ctx, ellipse(0, -478, 54, 64, 36), { fill: PAL.skin, line: 4, seed: 61, grain: 0.15, breaks: 0.25 });
    shape(ctx, spline([[-58, -484], [-58, -528], [-26, -556], [22, -558], [58, -526], [58, -488], [44, -516], [10, -520], [-20, -512], [-44, -510]], true, 6), { fill: PAL.hair, line: 0, seed: 66, grain: 0.3 });
    cowlick(ctx, 6, -552, 67);
    [-21, 21].forEach((x, i) => eye(ctx, x + look[0], -482 + look[1], face, blink, i, 1, i ? -1 : 1));
    ink(ctx, spline([[2, -480], [-7, -456], [5, -453]], false, 4), 3.4, { seed: 68 });
    mouth(ctx, 0, -434, face);
    cheeks(ctx, [[-34, -456], [34, -456]]);
    return;
  }
  // 3/4 and profile, facing +x: one outline from the forehead out to the nose tip and back
  const side = view === 'side';
  const chain = side ? [[48, -490], [46, -512], [30, -540], [-8, -552], [-46, -536], [-60, -496], [-56, -454], [-36, -424], [-4, -410], [24, -412], [40, -424], [44, -442], [50, -458]]
    : [[52, -488], [50, -512], [34, -538], [-6, -552], [-44, -536], [-60, -496], [-56, -454], [-38, -424], [-8, -410], [22, -412], [38, -424], [44, -442], [52, -458]];
  const tip = side ? [94, -470] : [88, -470];
  // ear
  shape(ctx, ellipse(side ? -14 : -24, -474, 10, 15, 14), { fill: PAL.skin, line: 3.4, seed: 69, grain: 0.1 });
  const head = [...spline(chain, false, 6), tip];
  shape(ctx, head, { fill: PAL.skin, line: 4, seed: 70, grain: 0.15, breaks: 0.12 });
  // short hair: back and top, a fringe that stops above the brow, sideburn in front of the ear
  shape(ctx, spline([[-62, -470], [-64, -516], [-42, -552], [0, -566], [40, -556], [58, -528], [54, -514], [30, -526], [2, -528], [-14, -514], [-30, -500], [-32, -470], [-46, -456]], true, 6), { fill: PAL.hair, line: 0, seed: 71, grain: 0.3 });
  cowlick(ctx, 2, -562, 72);
  const E = side ? [[30, -490]] : [[6, -488], [38, -491]];
  E.forEach(([x, y], i) => eye(ctx, x + look[0], y + look[1], face, blink, i, i === 1 ? 0.78 : 1));
  mouth(ctx, side ? 32 : 28, -432, face);
  cheeks(ctx, side ? [[4, -456]] : [[-12, -456]]);
}

function eye(ctx, x, y, face, blink, i, sx = 1, toNose = 1) {
  if (face === 'happy' || blink > 0.5 || (face === 'wink' && i === 0)) {
    const up = face === 'happy' || face === 'wink';
    ink(ctx, up ? [[x - 8 * sx, y + 3], [x, y - 5], [x + 8 * sx, y + 3]] : [[x - 8 * sx, y], [x + 8 * sx, y]], 4, { seed: 80 + i, taper: false });
  } else if (face === 'focus') {
    // narrowed eyes: a lower half-pupil under a flat lid line
    shape(ctx, ellipse(x + 1, y + 1, 5.6 * sx, 8, 16, -0.35, Math.PI + 0.35), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
    shape(ctx, ellipse(x + 2.5, y + 1, 1.8, 2, 8), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] });
    ink(ctx, [[x - 8 * sx, y - 2], [x + 8 * sx, y - 2]], 3.2, { seed: 85 + i, taper: false });
  } else {
    const r = face === 'wow' || face === 'panic' ? 8.5 : 6.8;
    shape(ctx, ellipse(x, y, r * 0.8 * sx, r * 1.3, 14), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
    shape(ctx, ellipse(x + 1.5, y - 3.5, 2.2, 2.6, 8), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] });
  }
  // brows: panic tilts them up in the middle, proud lifts them high, focus pulls them down
  let by = face === 'wow' || face === 'proud' ? y - 25 : y - 19, tilt = 0;
  if (face === 'panic') { by = y - 22; tilt = i ? 5 : -5; }
  if (face === 'focus') {
    // brows pulled low and down toward the nose: determined, not worried
    by = y - 11; const d = 5 * toNose;
    ink(ctx, [[x - 10 * sx, by - d], [x + 10 * sx, by + d]], 4.2, { seed: 90 + i, taper: true });
    return;
  }
  ink(ctx, [[x - 9 * sx, by + tilt], [x + 9 * sx, by - tilt - 2]], 3.4, { seed: 90 + i, taper: true });
}
function mouth(ctx, x, y, face) {
  if (face === 'happy' || face === 'proud') shape(ctx, spline([[x - 16, y - 6], [x + 12, y - 8], [x + 4, y + 11], [x - 10, y + 9]], true, 6), { fill: PAL.coralD, line: 3.2, seed: 95, grain: 0, breaks: 0 });
  else if (face === 'wow') shape(ctx, ellipse(x - 2, y + 2, 7, 10, 16), { fill: PAL.coralD, line: 3.2, seed: 96, grain: 0, breaks: 0 });
  else if (face === 'panic') { shape(ctx, rrect(x - 14, y - 6, 26, 14, 5), { fill: PAL.white, line: 3, seed: 94, grain: 0, breaks: 0 }); ink(ctx, [[x - 12, y + 1], [x + 10, y + 1]], 2, { seed: 93, taper: false }); }
  else if (face === 'focus') { ink(ctx, [[x - 8, y + 1], [x + 10, y - 1]], 3.8, { seed: 97, taper: false }); shape(ctx, ellipse(x + 11, y + 3, 5, 4.5, 10), { fill: PAL.coralL, line: 2.4, seed: 98, grain: 0, breaks: 0 }); }
  else if (face === 'wink') ink(ctx, spline([[x - 16, y - 4], [x - 3, y + 6], [x + 11, y - 6]], false, 5), 3.6, { seed: 99 });
  else ink(ctx, spline([[x - 12, y - 2], [x - 1, y + 4], [x + 9, y - 3]], false, 5), 3.4, { seed: 100 });
}
function cheeks(ctx, pts) { pts.forEach(([x, y], i) => shape(ctx, ellipse(x, y, 11, 7.5, 14), { fill: PAL.pink, line: 0, grain: 0, seed: 101 + i, alpha: 0.85 })); }

// ---------------------------------------------------------------- props held in a hand (local units)
function drawProp(ctx, prop, J) {
  const [hx, hy] = J.ha, a = (J.hang ?? J.a2) + (prop.rot ?? 0);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
  if (prop.kind === 'knife') {
    // handle sits in the fist, blade points along the hand
    shape(ctx, rrect(-8, -8, 46, 16, 6), { fill: PAL.brown, line: 3, seed: 120, grain: 0.2, off: [0, 0] });
    const B = prop.len ?? 124;
    shape(ctx, [[38, -8], [38 + B - 12, -10], [38 + B, -2], [38 + B - 12, 10], [38, 9]], { fill: PAL.chrome, line: 3.2, seed: 121, grain: 0.05,
      shade: [{ pts: [[38, 2], [40 + B, 2], [40 + B, 12], [38, 12]], color: PAL.chromeD, alpha: 0.6 }] });
  } else if (prop.kind === 'spoonDown') {
    ctx.translate(18, 0); ctx.rotate(-a + (prop.blade ?? Math.PI / 2));
    const Ls = prop.len ?? 70;
    shape(ctx, rrect(-6, -5, Ls, 10, 5), { fill: PAL.kraft, line: 3, seed: 127, grain: 0.3 });
  } else if (prop.kind === 'knifeDown') {
    // seen from the front, blade pointing down toward the board: only its narrow side shows
    ctx.translate(22, 0); ctx.rotate(-a + (prop.blade ?? Math.PI / 2));
    shape(ctx, [[2, -6], [prop.len ?? 70, -1], [(prop.len ?? 70) + 8, 2], [prop.len ?? 70, 6], [2, 8]], { fill: PAL.chrome, line: 3.2, seed: 126, grain: 0.05,
      shade: [{ pts: [[2, 2], [90, 2], [90, 9], [2, 9]], color: PAL.chromeD, alpha: 0.7 }] });
  } else if (prop.kind === 'spoon') {
    shape(ctx, rrect(-10, -6, 150, 12, 6), { fill: PAL.kraft, line: 3, seed: 122, grain: 0.3 });
    shape(ctx, ellipse(160, 0, 26, 16, 20), { fill: PAL.kraft, line: 3, seed: 123, grain: 0.3, shade: [{ pts: ellipse(166, 4, 18, 10, 16), color: PAL.kraftD, alpha: 0.6 }] });
  } else if (prop.kind === 'onion') {
    shape(ctx, spline([[22, -34], [44, -20], [46, 8], [24, 24], [2, 8], [0, -20]], true, 6), { fill: PAL.plum, line: 3.4, seed: 124, grain: 0.3,
      shade: [{ pts: [[26, -40], [60, -40], [60, 30], [30, 30]], color: '#553752', alpha: 0.7 }] });
    ink(ctx, [[22, -34], [26, -48]], 3, { seed: 125 });
  }
  ctx.restore();
}
