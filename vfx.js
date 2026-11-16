// Textured VFX layer: sprites and particles built from real effect textures (Kenney Particle Pack, CC0, assets/vfx),
// tinted at runtime. It adds glow, sparks and light on top of the existing canvas animations; timing still comes from
// the engine effect objects, so visuals stay on the damage beats.
const VFX = (() => {
  const NAMES = ['circle_02', 'circle_03', 'light_02', 'magic_05', 'star_06', 'star_07', 'star_09', 'flare_01', 'trace_02',
    'twirl_01', 'twirl_02', 'spark_01', 'spark_02', 'smoke_05'];
  const IMG = {}, TINT = new Map();
  for (const n of NAMES) { const i = new Image(); i.src = `assets/vfx/${n}.webp?v=1`; IMG[n] = i; }

  // White texture -> coloured copy, cached per texture + colour.
  function tinted(name, rgb) {
    const key = name + rgb, hit = TINT.get(key);
    if (hit) return hit;
    const img = IMG[name];
    if (!img || !img.complete || !img.naturalWidth) return null;
    const c = document.createElement('canvas'); c.width = c.height = img.naturalWidth;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = `rgb(${rgb})`; g.fillRect(0, 0, c.width, c.height);
    TINT.set(key, c);
    return c;
  }
  // One textured quad centred at (x, y), w × h px. 'lighter' for light, 'source-over' for haze.
  function sprite(ctx, name, rgb, x, y, w, h, alpha, rot = 0, blend = 'lighter') {
    const t = tinted(name, rgb);
    if (!t || alpha <= 0.003 || w <= 0 || h <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = blend; ctx.globalAlpha = Math.min(1, alpha);
    ctx.translate(x, y); if (rot) ctx.rotate(rot);
    ctx.drawImage(t, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  // ---- particle pool (air layer, drawn over units)
  const P = [], MAX = 900, rnd = (a, b) => a + Math.random() * (b - a);
  function emit(o) {
    if (P.length >= MAX) P.shift();
    P.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, ay: 0, drag: 0, life: 1, s0: 10, s1: 10, a0: 1, a1: 0, rot: 0, vr: 0, squash: 1,
      rgb: '255, 255, 255', tex: 'star_06', blend: 'lighter', stretch: 0, flash: false }, o, { age: 0 }));
  }
  function update(dt) {
    if (!dt) return;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.age += dt;
      if (p.age >= p.life) { P.splice(i, 1); continue; }
      p.vy += p.ay * dt;
      const k = Math.max(0, 1 - p.drag * dt); p.vx *= k; p.vy *= k;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
  }
  function draw(ctx) {
    for (const p of P) {
      const k = p.age / p.life, s = p.s0 + (p.s1 - p.s0) * (1 - (1 - k) * (1 - k));
      const a = p.flash ? p.a0 * (k < .15 ? k / .15 : 1 - (k - .15) / .85) : p.a0 + (p.a1 - p.a0) * k;
      if (p.stretch) { const v = Math.hypot(p.vx, p.vy); sprite(ctx, p.tex, p.rgb, p.x, p.y, s * .6, Math.max(s, v * p.stretch), a, Math.atan2(p.vy, p.vx) - Math.PI / 2, p.blend); }
      else sprite(ctx, p.tex, p.rgb, p.x, p.y, s, s * p.squash, a, p.rot, p.blend);
    }
  }

  // ---- Melodic Saint building blocks (indigo + gold palette of the existing animation)
  const INDIGO = '129, 140, 248', PALE = '199, 210, 254', GOLD = '253, 230, 138', VIOLET = '168, 85, 247', PINK = '244, 114, 182';
  // A soft glowing sound-wave ring on the ground: radius rx × ry px.
  function soundRing(ctx, x, y, rx, ry, alpha, rgb = INDIGO) {
    sprite(ctx, 'circle_03', rgb, x, y, rx * 2.3, ry * 2.3, alpha * .55);   // wide bloom
    sprite(ctx, 'circle_02', PALE, x, y, rx * 2.08, ry * 2.08, alpha);     // crisp bright front
  }
  // Motes of light riding a wavefront: spawn on the ellipse, drift outward and up.
  function waveMotes(x, y, rx, ry, n, rgb = PALE) {
    for (let i = 0; i < n; i++) {
      const th = rnd(0, Math.PI * 2), px = x + Math.cos(th) * rx, py = y + Math.sin(th) * ry;
      emit({ x: px, y: py, vx: Math.cos(th) * rnd(20, 60), vy: Math.sin(th) * rnd(10, 30) - rnd(20, 50), drag: 1.4, tex: Math.random() < .7 ? 'star_06' : 'flare_01', rgb: Math.random() < .25 ? GOLD : rgb, s0: rnd(5, 10), s1: 2, a0: .95, life: rnd(.4, .8) });
    }
  }
  // Pluck: a bright star burst and a short shock ring at the guqin.
  function pluck(x, y) {
    emit({ x, y: y - 6, tex: 'star_09', rgb: PALE, s0: 60, s1: 150, a0: 1, life: .3, flash: true });
    emit({ x, y: y - 6, tex: 'magic_05', rgb: INDIGO, s0: 90, s1: 200, a0: .9, life: .4, flash: true });
    emit({ x, y: y + 8, tex: 'circle_02', rgb: PALE, s0: 20, s1: 170, a0: .9, life: .35, squash: .45 });
    for (let i = 0; i < 18; i++) { const a = rnd(0, Math.PI * 2), v = rnd(140, 320); emit({ x, y: y - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .5 - 40, drag: 2.4, tex: 'trace_02', rgb: i % 4 ? PALE : GOLD, s0: 6, s1: 2, a0: 1, life: rnd(.3, .55), stretch: .05 }); }
  }
  // An enemy struck by the resonance: flash, ring and a spray of light.
  function resonanceHit(x, y) {
    emit({ x, y: y - 10, tex: 'star_07', rgb: PALE, s0: 30, s1: 64, a0: 1, life: .28, flash: true });
    emit({ x, y: y - 8, tex: 'magic_05', rgb: INDIGO, s0: 40, s1: 80, a0: .8, life: .35, flash: true });
    emit({ x, y: y + 2, tex: 'circle_02', rgb: PALE, s0: 12, s1: 70, a0: .9, life: .35, squash: .42 });
    for (let i = 0; i < 8; i++) { const a = rnd(-Math.PI * .95, -Math.PI * .05), v = rnd(60, 150); emit({ x, y: y - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 120, drag: 1.2, tex: 'star_06', rgb: i % 3 ? PALE : GOLD, s0: rnd(5, 9), s1: 2, a0: 1, life: rnd(.4, .7) }); }
  }
  // While stunned: a slow halo of light turning above the enemy.
  function stunHalo(ctx, x, y, t) {
    sprite(ctx, 'twirl_02', INDIGO, x, y - 30, 40, 16, .6, t * 3);
    sprite(ctx, 'twirl_01', PALE, x, y - 30, 30, 12, .5, -t * 4);
  }
  // Harmony on an ally: golden light rising.
  function harmonyAlly(x, y) {
    emit({ x, y: y - 12, tex: 'light_02', rgb: GOLD, s0: 30, s1: 60, a0: .7, life: .5, flash: true });
    for (let i = 0; i < 7; i++) emit({ x: x + rnd(-14, 14), y: y + rnd(-4, 6), vx: rnd(-8, 8), vy: rnd(-90, -50), drag: .8, tex: 'flare_01', rgb: i % 3 ? GOLD : PALE, s0: rnd(10, 16), s1: 3, a0: .95, life: rnd(.6, .9) });
  }
  // Dissonance on an enemy: violet lightning crackle and splintered light.
  function dissonanceHit(x, y) {
    emit({ x, y: y - 12, tex: Math.random() < .5 ? 'spark_01' : 'spark_02', rgb: PINK, s0: 46, s1: 56, a0: 1, life: .18, rot: rnd(0, 6), flash: true });
    emit({ x, y: y - 10, tex: 'magic_05', rgb: VIOLET, s0: 34, s1: 60, a0: .8, life: .3, flash: true });
    for (let i = 0; i < 7; i++) { const a = rnd(0, Math.PI * 2), v = rnd(90, 200); emit({ x, y: y - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6 - 30, drag: 3, tex: 'trace_02', rgb: i % 2 ? PINK : VIOLET, s0: 5, s1: 2, a0: 1, life: rnd(.2, .4), stretch: .045 }); }
  }

  return { update, draw, emit, sprite, rnd, melodic: { soundRing, waveMotes, pluck, resonanceHit, stunHalo, harmonyAlly, dissonanceHit, INDIGO, PALE, GOLD, VIOLET, PINK } };
})();
