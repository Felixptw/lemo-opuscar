import { textures } from './engine/toon.js';
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['700 80px Oleo', '400 80px Oleo', '80px Slab', '400 40px Jost', '500 40px Jost', '600 40px Jost', '700 40px Jost'].map(f => document.fonts.load(f)));
textures();
const mod = Q.get('test') === 'scene' ? await import('./scene.js') : await import('./sheet.js');
window.DUR = 1;
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); mod.draw(g, t); };
window.READY = true;
