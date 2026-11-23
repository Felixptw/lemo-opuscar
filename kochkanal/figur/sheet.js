// Model sheet for the beginner cook (turnaround, expressions, key poses at the counter, hands)
import { PAL, setClock, shape, ink, ellipse, rrect, rect, text, paperFinish, plane } from './engine/toon.js';
import { drawCook, drawHand, reach, reachRelaxed, SHIRT, APRON, NAVY } from './engine/chars.js';
import { pot, board, onionCut } from './props.js';

export function draw(ctx, t) {
  setClock(0.25);
  const W = 1920, H = 1080;
  ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
  text(ctx, 'Modellblatt', 60, 92, { font: '700 64px Oleo', fill: PAL.ink, plate: PAL.mustard, off: [4, 3] });
  text(ctx, 'DER EHRGEIZIGE ANFÄNGER  ·  ARBEITSSTAND', 420, 84, { font: '600 24px Jost', fill: PAL.inkSoft, track: 5 });
  ink(ctx, [[60, 118], [1860, 118]], 3, { breaks: 0.2, seed: 2 });
  // turnaround
  plane(ctx, rrect(40, 140, 1000, 580, 20), PAL.blueL, { off: [0, 0], grain: 0.2 });
  text(ctx, 'DREHUNG', 70, 180, { font: '600 22px Jost', fill: PAL.ink, track: 5 });
  [['front', 'VORNE'], ['q', '3/4'], ['side', 'PROFIL'], ['back', 'HINTEN']].forEach(([v, lab], i) => {
    const x = 170 + i * 240;
    ink(ctx, [[x - 110, 670], [x + 110, 670]], 2.5, { seed: 5 + i, breaks: 0.3 });
    drawCook(ctx, { x, y: 670, s: 0.8, view: v, face: 'neutral' }, 0);
    text(ctx, lab, x, 702, { font: '500 20px Jost', fill: PAL.inkSoft, align: 'center', track: 4 });
  });
  // expressions
  plane(ctx, rrect(1060, 140, 820, 300, 20), PAL.pink, { off: [0, 0], grain: 0.2 });
  text(ctx, 'AUSDRÜCKE', 1090, 180, { font: '600 22px Jost', fill: PAL.ink, track: 5 });
  [['neutral', 'NORMAL'], ['proud', 'STOLZ'], ['panic', 'PANIK'], ['wink', 'GEHEIMTIPP']].forEach(([f, lab], i) => {
    const cx = 1180 + i * 190, cy = 300;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 70, 0, Math.PI * 2); ctx.fillStyle = PAL.white; ctx.fill(); ctx.clip();
    drawCook(ctx, { x: cx - 30, y: cy + 470, s: 0.98, view: 'q', face: f }, 0);
    ctx.restore();
    ink(ctx, ellipse(cx, cy, 70, 70, 40), 3, { closed: true, seed: 20 + i, breaks: 0.2 });
    text(ctx, lab, cx, cy + 108, { font: '500 18px Jost', fill: PAL.ink, align: 'center', track: 3 });
  });
  // key poses
  plane(ctx, rrect(1060, 460, 820, 580, 20), PAL.mustardL, { off: [0, 0], grain: 0.2 });
  text(ctx, 'SCHLÜSSELPOSEN  ·  Körper steht, Arme und Gesicht spielen', 1090, 500, { font: '600 22px Jost', fill: PAL.ink, track: 2 });
  const py = 990;
  // working poses: front view behind a counter, elbows relaxed at the sides, hands placed on the object
  const counter = (x, s) => {
    shape(ctx, rect(x - 88, py - 215 * s, 176, 215 * s + 12), { fill: PAL.kraftL, line: 3.5, seed: 300 + x, grain: 0.3 });
    shape(ctx, rect(x - 88, py - 215 * s, 176, 10), { fill: PAL.white, line: 3, seed: 301 + x, grain: 0.2 });
  };
  {
    const x = 1170, s = 0.64, P = { x, y: py, s, view: 'front', face: 'neutral', look: [4, 10], armsFront: true, handB: 'grip', handF: 'grip',
      propB: { kind: 'knifeDown', len: 48, blade: Math.PI / 2 + 0.06 } };
    const L = (lx, ly) => [x + lx * s, py + ly * s];
    reachRelaxed(P, 'F', ...L(38, -262), Math.PI / 2 + 0.25, 14, 1.3);
    reachRelaxed(P, 'B', ...L(-8, -290), 0.2, 22, Math.PI - 1.3);
    drawCook(ctx, { ...P, propB: null }, 0);
    counter(x, s);
    board(ctx, x, py - 215 * s + 4, 0.42);
    onionCut(ctx, ...L(36, -235), 0.32);
    drawCook(ctx, { ...P, shadow: false, armsOnly: true }, 0);
  }
  {
    const x = 1370, s = 0.64, P = { x, y: py, s, view: 'front', face: 'neutral', look: [2, 10], armsFront: true, handB: 'grip', handF: 'grip',
      prop: { kind: 'spoonDown', len: 60, blade: Math.PI / 2 + 0.25 } };
    const L = (lx, ly) => [x + lx * s, py + ly * s];
    reachRelaxed(P, 'F', ...L(16, -300), Math.PI, 18, 1.35);
    reachRelaxed(P, 'B', ...L(-46, -268), Math.PI / 2 + 0.9, 14, Math.PI - 1.35);
    drawCook(ctx, { ...P, prop: null }, 0);
    counter(x, s);
    pot(ctx, ...L(0, -215), 0.24);
    drawCook(ctx, { ...P, shadow: false, armsOnly: true }, 0);
  }
  {
    // panic: both hands grab the sides of the head, elbows out
    const x = 1570, s = 0.64, P = { x, y: py, s, view: 'front', face: 'panic', armsFront: true, handB: 'open', handF: 'open' };
    reach(P, 'F', x + 60 * s, py - 505 * s, -Math.PI / 2 - 0.25, 16);
    reach(P, 'B', x - 60 * s, py - 505 * s, -Math.PI / 2 + 0.25, 16);
    drawCook(ctx, P, 0);
  }
  {
    // proud: elbow at the side, forearm up in front of the chest, thumb up
    const x = 1770, s = 0.64, P = { x, y: py, s, view: 'q', face: 'proud', handF: 'thumb' };
    reach(P, 'F', x + 110 * s, py - 380 * s, 0.05, 18);
    drawCook(ctx, P, 0);
  }
  ['SCHNEIDEN', 'RÜHREN', 'BESUCH KOMMT!', 'GESCHAFFT'].forEach((l, i) => text(ctx, l, 1170 + i * 200, 1025, { font: '500 17px Jost', fill: PAL.inkSoft, align: 'center', track: 3 }));
  // hands + notes
  plane(ctx, rrect(40, 740, 1000, 300, 20), PAL.avocadoL, { off: [0, 0], grain: 0.2 });
  text(ctx, 'HÄNDE  ·  vier Finger, erst Linie, dann Farbe', 70, 780, { font: '600 22px Jost', fill: PAL.ink, track: 3 });
  ['open', 'flat', 'point', 'grip', 'thumb'].forEach((k, i) => drawHand(ctx, 110 + i * 120, 880, -0.4, k, 1, 1.7));
  ['KENNZEICHEN', '· eine Haarsträhne, die nie liegt', '· derselbe Tomatenfleck auf der Schürze', '· Turnschuhe mit rotem Streifen'].forEach((l, i) =>
    text(ctx, l, 680, 800 + i * 40 + (i ? 10 : 0), { font: (i ? '500 20px' : '600 20px') + ' Jost', fill: PAL.ink, track: i ? 0 : 4 }));
  [SHIRT, APRON, NAVY, PAL.skin, PAL.hair, PAL.coral, PAL.white].forEach((c, i) => shape(ctx, rrect(1520 + i * 46, 60, 36, 36, 6), { fill: c, line: 2, seed: 60 + i, grain: 0, off: [3, 2] }));
  paperFinish(ctx, W, H, 0.8);
}
