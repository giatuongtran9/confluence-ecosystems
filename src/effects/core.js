
const VFX_PALETTES = Object.freeze({
  Cultivation: { primary: '#5ce1e6', secondary: '#f6d365', glow: '#5ce1e688', trail: '#c2f9ff', style: 'sword' },
  Bloodline:   { primary: '#d92027', secondary: '#ff7b54', glow: '#d9202788', trail: '#ff9a8b', style: 'claw' },
  PostApoc:    { primary: '#ff9233', secondary: '#ffd166', glow: '#ff923388', trail: '#9ca3af', style: 'shell' },
  Cyberpunk:   { primary: '#00f0ff', secondary: '#ff2a6d', glow: '#00f0ff88', trail: '#ff2a6d', style: 'laser' },
  Arcane:      { primary: '#a855f7', secondary: '#38bdf8', glow: '#a855f788', trail: '#e9d5ff', style: 'orb' },
  Haunted:     { primary: '#aab9ec', secondary: '#b91c1c', glow: '#b91c1c88', trail: '#cbd5e1', style: 'glitch' },
  Lovecraft:   { primary: '#7e22ce', secondary: '#c084fc', glow: '#581c87aa', trail: '#3b0764', style: 'void' },
  Grimdark:    { primary: '#cbd5e1', secondary: '#991b1b', glow: '#991b1b88', trail: '#f8fafc', style: 'blade' },
  SciFi:       { primary: '#10b981', secondary: '#06b6d4', glow: '#10b98188', trail: '#a7f3d0', style: 'beam' }
});

export function vfxPaletteFor(genre) {
  return VFX_PALETTES[genre] || VFX_PALETTES.Cultivation;
}

export function bezierPt(x0, y0, cx, cy, x1, y1, t) {
  const inv = 1 - t;
  return {
    x: inv * inv * x0 + 2 * inv * t * cx + t * t * x1,
    y: inv * inv * y0 + 2 * inv * t * cy + t * t * y1
  };
}

export function drawGroundRing(ctx, cx, cy, radius, progress, pal, genre) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.0, 0.52);
  const r = Math.max(8, radius * (0.28 + 0.72 * progress));
  ctx.globalAlpha = Math.max(0, (1 - progress) * 0.85);
  ctx.strokeStyle = pal.primary;
  ctx.lineWidth = 4.5 * (1 - progress * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2;
  if (genre === 'Cultivation' || genre === 'Cyberpunk') {
    const sides = genre === 'Cultivation' ? 8 : 6;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2 + progress * 0.8;
      const px = Math.cos(a) * r * 0.78, py = Math.sin(a) * r * 0.78;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCrescentSlash(ctx, x0, y0, tx, ty, progress, pal, genre) {
  const angle = Math.atan2(ty - y0, tx - x0);
  const spread = 0.92;
  const r = 28 + progress * 14;
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(angle);
  ctx.globalAlpha = Math.min(1, (1 - progress) * 1.4);

  const count = genre === 'Bloodline' ? 3 : genre === 'Haunted' ? 2 : 1;
  for (let c = 0; c < count; c++) {
    ctx.save();
    if (genre === 'Haunted' && c === 1) ctx.rotate(0.65);
    const offset = (c - (count - 1) / 2) * 7;
    ctx.translate(offset * 0.4, offset);
    ctx.strokeStyle = c % 2 === 0 ? pal.primary : pal.secondary;
    ctx.lineWidth = (7 - c * 1.5) * (1 - progress * 0.45);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-8, 0, r, -spread, spread);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2 * (1 - progress * 0.5);
    ctx.beginPath();
    ctx.arc(-7, 0, r, -spread * 0.72, spread * 0.72);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export function drawBezierProjectile(ctx, x0, y0, tx, ty, curve, progress, pal) {
  const dx = tx - x0, dy = ty - y0;
  const cx = (x0 + tx) * 0.5 - dy * (curve || 0.18);
  const cy = (y0 + ty) * 0.5 - Math.abs(dx) * 0.22 - 26;
  const headT = Math.min(1, Math.max(0.05, progress * 1.15));
  const tailT = Math.max(0, headT - 0.26);
  const segments = 5;

  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < segments; i++) {
    const tA = tailT + (headT - tailT) * (i / segments);
    const tB = tailT + (headT - tailT) * ((i + 1) / segments);
    const pA = bezierPt(x0, y0, cx, cy, tx, ty, tA);
    const pB = bezierPt(x0, y0, cx, cy, tx, ty, tB);
    const frac = (i + 1) / segments;
    ctx.globalAlpha = frac * Math.min(1, (1 - progress) * 1.5);
    ctx.strokeStyle = frac > 0.7 ? pal.primary : pal.trail;
    ctx.lineWidth = 1.5 + frac * 4.5;
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
  }

  const head = bezierPt(x0, y0, cx, cy, tx, ty, headT);
  const prev = bezierPt(x0, y0, cx, cy, tx, ty, Math.max(0, headT - 0.04));
  const ang = Math.atan2(head.y - prev.y, head.x - prev.x);
  ctx.translate(head.x, head.y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, (1 - progress) * 1.6);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = pal.secondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-5, -4.5);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-5, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawImpactSparks(ctx, tx, ty, progress, pal, isCrit) {
  ctx.save();
  ctx.translate(tx, ty);
  ctx.globalAlpha = Math.max(0, 1 - progress);
  const rays = isCrit ? 8 : 6;
  const inner = 6 + progress * 16;
  const outer = inner + (isCrit ? 16 : 10) * (1 - progress * 0.4);
  ctx.strokeStyle = isCrit ? pal.secondary : pal.primary;
  ctx.lineWidth = isCrit ? 2.8 : 2.0;
  ctx.lineCap = 'round';
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + progress * 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
    ctx.stroke();
  }
  ctx.restore();
}
function drawEmeraldSwordBlade(ctx, x, y, ang, scale, alpha, isColossal = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

  const len = (isColossal ? 155 : 44) * scale;
  const w = (isColossal ? 13 : 4.2) * scale;

  // Outer Emerald Jade Qi Glow
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = (isColossal ? 26 : 12) * scale;

  // 1. Flowing Silk Tassel from Pommel (behind the hilt)
  ctx.strokeStyle = isColossal ? 'rgba(52, 211, 153, 0.9)' : 'rgba(110, 231, 183, 0.75)';
  ctx.lineWidth = (isColossal ? 3.2 : 1.6) * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-len * 0.36, 0);
  const wave = Math.sin((x + y) * 0.04) * (isColossal ? 12 : 4.5) * scale;
  ctx.quadraticCurveTo(-len * 0.56, wave, -len * 0.76, -wave * 0.6);
  ctx.stroke();

  if (isColossal) {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 1.8 * scale;
    ctx.beginPath();
    ctx.moveTo(-len * 0.36, 0);
    ctx.quadraticCurveTo(-len * 0.52, -wave * 0.8, -len * 0.68, wave * 0.5);
    ctx.stroke();
  }

  // 2. Pommel Ring & Jade Bead (Kiếm Thủ)
  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = (isColossal ? 2 : 1) * scale;
  ctx.beginPath();
  ctx.arc(-len * 0.33, 0, w * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(-len * 0.33, 0, w * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // 3. Cord-Wrapped Hilt Grip (Kiếm Bính)
  const gripLen = len * 0.23;
  const gripW = w * 0.46;
  ctx.fillStyle = '#064e3b';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.rect(-len * 0.29, -gripW, gripLen, gripW * 2);
  ctx.fill();
  ctx.stroke();

  // Gold ferrules capping both ends of the grip
  ctx.fillStyle = '#f59e0b';
  for (const fx0 of [-len * 0.295, -len * 0.075]) ctx.fillRect(fx0, -gripW * 1.18, Math.max(1, len * 0.02), gripW * 2.36);

  // Criss-cross gold cord wrap on grip
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = (isColossal ? 1.5 : 0.8) * scale;
  const steps = isColossal ? 5 : 3;
  for (let i = 0; i < steps; i++) {
    const gx0 = -len * 0.28 + (i / steps) * gripLen;
    const gx1 = -len * 0.28 + ((i + 1) / steps) * gripLen;
    ctx.beginPath();
    ctx.moveTo(gx0, -gripW);
    ctx.lineTo(gx1, gripW);
    ctx.moveTo(gx0, gripW);
    ctx.lineTo(gx1, -gripW);
    ctx.stroke();
  }

  // 4. Double-bevel Jian blade: straight, gently tapering edges into a smooth point (one edge path, both facets).
  const edge = side => { // side -1 = upper (lit) edge, +1 = lower (shaded) edge
    ctx.lineTo(0, side * w * 0.9);
    ctx.lineTo(len * 0.8, side * w * 0.72);
    ctx.quadraticCurveTo(len * 0.94, side * w * 0.55, len, 0);
  };
  ctx.beginPath(); ctx.moveTo(0, 0); edge(-1); ctx.closePath();
  const upGrad = ctx.createLinearGradient(0, -w, len, 0);   // lit facet: bright crystalline jade
  upGrad.addColorStop(0, '#10b981');
  upGrad.addColorStop(0.5, '#6ee7b7');
  upGrad.addColorStop(0.88, '#d1fae5');
  upGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = upGrad;
  ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); edge(1); ctx.closePath();
  const lowGrad = ctx.createLinearGradient(0, w, len, 0);   // shaded facet: deep imperial emerald
  lowGrad.addColorStop(0, '#064e3b');
  lowGrad.addColorStop(0.45, '#047857');
  lowGrad.addColorStop(0.85, '#10b981');
  lowGrad.addColorStop(1, '#ecfdf5');
  ctx.fillStyle = lowGrad;
  ctx.fill();

  ctx.shadowBlur = 0; // fine detail below must stay crisp
  // Soft specular sheen running down the lit facet
  const sheen = ctx.createLinearGradient(0, -w * 0.7, 0, -w * 0.1);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(0.55, 'rgba(255, 255, 255, 0.45)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.beginPath(); ctx.moveTo(len * 0.06, -w * 0.62); ctx.lineTo(len * 0.82, -w * 0.48); ctx.lineTo(len * 0.86, -w * 0.18); ctx.lineTo(len * 0.06, -w * 0.22); ctx.closePath(); ctx.fill();

  // Fuller (Huyết Tào): a dark groove just below the spine, fading out before the point
  const fuller = ctx.createLinearGradient(0, 0, len * 0.7, 0);
  fuller.addColorStop(0, 'rgba(2, 44, 34, 0.75)');
  fuller.addColorStop(1, 'rgba(2, 44, 34, 0)');
  ctx.strokeStyle = fuller;
  ctx.lineWidth = Math.max(0.6, w * 0.22);
  ctx.beginPath(); ctx.moveTo(len * 0.04, w * 0.2); ctx.lineTo(len * 0.7, w * 0.16); ctx.stroke();

  // Edges: a thin bright cutting edge, plus a faint inner bevel line on each facet
  ctx.strokeStyle = 'rgba(236, 253, 245, 0.95)';
  ctx.lineWidth = (isColossal ? 1.6 : 0.8) * scale;
  ctx.beginPath(); ctx.moveTo(0, -w * 0.9); ctx.lineTo(len * 0.8, -w * 0.72); ctx.quadraticCurveTo(len * 0.94, -w * 0.55, len, 0);
  ctx.quadraticCurveTo(len * 0.94, w * 0.55, len * 0.8, w * 0.72); ctx.lineTo(0, w * 0.9); ctx.stroke();
  ctx.strokeStyle = 'rgba(209, 250, 229, 0.4)';
  ctx.lineWidth = (isColossal ? 0.9 : 0.5) * scale;
  ctx.beginPath(); ctx.moveTo(len * 0.04, -w * 0.62); ctx.lineTo(len * 0.86, -w * 0.4); ctx.moveTo(len * 0.04, w * 0.62); ctx.lineTo(len * 0.86, w * 0.4); ctx.stroke();

  // Central spine ridge (Jian脊): bright, thinner than the edge glow, ending just short of the point
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = (isColossal ? 1.8 : 0.85) * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len * 0.93, 0);
  ctx.stroke();

  if (isColossal) {
    // Glowing Ancient Seal Runes etched along the blade spine
    ctx.fillStyle = '#fef08a';
    for (let r = 0; r < 5; r++) {
      const rx = len * (0.18 + r * 0.13);
      ctx.beginPath();
      ctx.moveTo(rx, -w * 0.26);
      ctx.lineTo(rx + w * 0.35, 0);
      ctx.lineTo(rx, w * 0.26);
      ctx.lineTo(rx - w * 0.35, 0);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 5. Ornate Winged Cloud-Dragon Crossguard (Kiếm Cách / Hộ Thủ)
  // Smooth cloud-wings sweeping toward the blade (curves, not facets), mirrored top and bottom.
  ctx.beginPath();
  ctx.moveTo(len * 0.06, 0); // forward prong over the blade base
  for (const s of [-1, 1]) {
    ctx.quadraticCurveTo(len * 0.01, s * w * 0.9, len * 0.075, s * w * 2.2);   // wing sweeps out and forward to its tip
    ctx.quadraticCurveTo(-len * 0.03, s * w * 2.05, -len * 0.09, s * w * 0.75); // rolls back toward the grip
    ctx.lineTo(-len * 0.09, 0);
    if (s < 0) ctx.moveTo(len * 0.06, 0);
  }
  ctx.closePath();

  const guardGrad = ctx.createLinearGradient(-len * 0.08, -w * 2, len * 0.06, w * 2);  // polished gold: bright, warm core, bright
  guardGrad.addColorStop(0, '#fef3c7');
  guardGrad.addColorStop(0.3, '#fde047');
  guardGrad.addColorStop(0.55, '#d97706');
  guardGrad.addColorStop(1, '#fef08a');
  ctx.fillStyle = guardGrad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = (isColossal ? 1.8 : 0.9) * scale;
  ctx.stroke();

  // Center Spirit Jade Core Gem set in the Crossguard
  ctx.fillStyle = '#ecfdf5';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = (isColossal ? 2.2 : 1.1) * scale;
  ctx.beginPath();
  ctx.moveTo(len * 0.03, 0);
  ctx.lineTo(-len * 0.02, -w * 0.65);
  ctx.lineTo(-len * 0.07, 0);
  ctx.lineTo(-len * 0.02, w * 0.65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glint on the point: a small four-ray star
  const g = (isColossal ? 7 : 2.6) * scale;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(236, 253, 245, 0.9)';
  ctx.beginPath();
  ctx.moveTo(len + g * 1.6, 0); ctx.lineTo(len + g * 0.18, g * 0.18); ctx.lineTo(len, g * 1.6); ctx.lineTo(len - g * 0.18, g * 0.18);
  ctx.lineTo(len - g * 1.6, 0); ctx.lineTo(len - g * 0.18, -g * 0.18); ctx.lineTo(len, -g * 1.6); ctx.lineTo(len + g * 0.18, -g * 0.18);
  ctx.closePath(); ctx.fill();

  ctx.restore();
}

export function drawSwordTorrentChannel(ctx, cx, cy, prog, size, channelType = 'sword-torrent') {
  const channelLabels = {
    'sword-torrent': { text: '⚡ VẠN KIẾM QUY TÔNG (1.2s)', color: '#34d399', glow: '#10b981', bg: '#064e3b' },
    'melodic-resonance': { text: '🎵 THIÊN LÃI CỘNG HƯỞNG (1.2s)', color: '#818cf8', glow: '#6366f1', bg: '#1e1b4b' },
    'formation-star-river': { text: '✨ TINH HÀ KỲ TRẬN (1.2s)', color: '#60a5fa', glow: '#3b82f6', bg: '#172554' },
    'talisman-decree': { text: '📜 HOÀNG KIM THÁNH CHỈ (1.2s)', color: '#f59e0b', glow: '#d97706', bg: '#451a03' },
    'landscape-dragon': { text: '🐉 SƠN HÀ MỰC LONG (1.2s)', color: '#34d399', glow: '#059669', bg: '#022c22' },
    'soul-reap-detonation': { text: '💀 VẠN HỒN BẠO PHÁ (1.2s)', color: '#c084fc', glow: '#a855f7', bg: '#3b0764' },
    'blood-domain': { text: '🩸 HUYẾT HẢI CUỒNG LỘC (1.2s)', color: '#ef4444', glow: '#dc2626', bg: '#450a0a' },
    'azure-dragon': { text: '⚡ THANH LONG BẠO NỘ (1.2s)', color: '#38bdf8', glow: '#0284c7', bg: '#082f49' },
    'white-tiger': { text: '🐯 BẠCH HỔ THẦN HỐNG (1.2s)', color: '#f87171', glow: '#dc2626', bg: '#450a0a' },
    'xuanwu-toxin': { text: '🐢 HUYỀN VŨ ĐỘC ĐỊA (1.2s)', color: '#4ade80', glow: '#16a34a', bg: '#052e16' },
    'great-sage-staff': { text: '🐒 ĐỊNH HẢI THẦN CHÂM (1.2s)', color: '#fbbf24', glow: '#d97706', bg: '#451a03' },
    'berserker-cleave': { text: '⚔️ BERSERKER COLOSSUS CLEAVE (1.2s)', color: '#f59e0b', glow: '#d97706', bg: '#451a03' },
    'siege-bombardment': { text: '💥 SIEGE TITAN BOMBARDMENT (1.2s)', color: '#ef4444', glow: '#dc2626', bg: '#450a0a' },
    'juggernaut-hellfire': { text: '🔥 VANGUARD OIL HELLFIRE (1.2s)', color: '#fb923c', glow: '#ea580c', bg: '#431407' },
    'magmaLord': { text: '🔥 MOLTEN FISSURE (1.2s)', color: '#fb923c', glow: '#ea580c', bg: '#431407' },
    'tempestArchon': { text: '🌪️ FIRESTORM TORNADO (1.2s)', color: '#f87171', glow: '#ef4444', bg: '#450a0a' },
    'steamSovereign': { text: '💨 SCALDING VAPOR MIST (1.2s)', color: '#38bdf8', glow: '#0284c7', bg: '#082f49' },
    'quagmireColossus': { text: '🌿 PRIMORDIAL QUAGMIRE (1.2s)', color: '#4ade80', glow: '#16a34a', bg: '#052e16' },
    'blizzardArchon': { text: '❄️ GLACIAL BLIZZARD (1.2s)', color: '#67e8f9', glow: '#06b6d4', bg: '#164e63' },
    'sandstormTitan': { text: '🏜️ SANDSTORM STRIP (10s)', color: '#facc15', glow: '#ca8a04', bg: '#422006' }
  };
  const theme = channelLabels[channelType] || channelLabels['sword-torrent'];
  ctx.save();

  const haloRad = 70 + 35 * Math.sin(prog * Math.PI);
  const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, haloRad);
  radGrad.addColorStop(0, 'rgba(52, 211, 153, 0.42)');
  radGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.22)');
  radGrad.addColorStop(1, 'rgba(4, 120, 87, 0)');
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, haloRad, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  const rotAng = prog * Math.PI * 3.5;
  ctx.rotate(rotAng);

  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rx = Math.cos(a) * 42;
    const ry = Math.sin(a) * 42;
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(rx - 2, ry - 2, 4, 4);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 36, Math.sin(a) * 36);
    ctx.lineTo(Math.cos(a) * 48, Math.sin(a) * 48);
    ctx.stroke();
  }

  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, -8, 8, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.arc(0, 8, 8, Math.PI * 0.5, -Math.PI * 0.5);
  ctx.stroke();
  ctx.restore();

  for (let i = 0; i < 9; i++) {
    const seed = i * 47;
    const sparkT = (prog * 3 + seed * 0.1) % 1;
    const sparkRad = 15 + ((seed * 19) % 35);
    const sparkAng = (seed * 31) + prog * 4;
    const sx = cx + Math.cos(sparkAng) * sparkRad;
    const sy = cy + Math.sin(sparkAng) * (sparkRad * 0.6) - sparkT * 60;

    ctx.fillStyle = i % 2 === 0 ? '#ecfdf5' : '#34d399';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.2 * (1 - sparkT * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }

  // 8 Levitating Jade Jian Swords pointing skyward (-Math.PI/2) and oscillating before launch
  const swordCount = 8;
  for (let i = 0; i < swordCount; i++) {
    const baseAng = (i * (Math.PI * 2)) / swordCount;
    const curAng = baseAng + prog * Math.PI * 4.5;
    const orbitRad = 54 - prog * 12;
    const sx = cx + Math.cos(curAng) * orbitRad;
    const sy = cy + Math.sin(curAng) * (orbitRad * 0.68);
    // Pointing upward with slight outward fan
    const swordAng = -Math.PI * 0.5 + Math.cos(curAng) * 0.22;
    const jitter = Math.sin(prog * 42 + i) * (prog * 4);
    drawEmeraldSwordBlade(ctx, sx, sy + jitter, swordAng, 0.62 + prog * 0.16, 0.8 + prog * 0.2, false);
  }

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.font = '700 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillStyle = theme.color;
  ctx.fillText(theme.text, cx, cy - 68);

  const barW = 96, barH = 5;
  ctx.fillStyle = theme.bg;
  ctx.fillRect(cx - barW * 0.5, cy - 60, barW, barH);
  ctx.fillStyle = theme.color;
  ctx.fillRect(cx - barW * 0.5, cy - 60, barW * Math.min(1, prog), barH);
  ctx.strokeStyle = theme.glow;
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - barW * 0.5, cy - 60, barW, barH);

  ctx.restore();
}

// ---- Sword Torrent VFX: cached sprites, additive light, particle pool ----
// Timeline (seconds after channel release, engine time; see engine sword-torrent branch):
// 0–0.15 swords fly up · 0.15–0.68 rain in three accelerating waves · 0.7–0.85 Colossal hangs over a
// lock-on sigil (engine slow motion from 0.8) · 0.85–0.95 slam · 1.0–2.0 linger, then stuck swords shatter.
const SWORD_SPRITES = {};
export function swordSprite(colossal) {
  const key = colossal ? 'colossal' : 'rain';
  if (SWORD_SPRITES[key]) return SWORD_SPRITES[key];
  const scale = colossal ? 2.0 : 0.72;
  const len = (colossal ? 155 : 44) * scale, w = (colossal ? 13 : 4.2) * scale;
  const pad = colossal ? 70 : 18, back = len * 0.8, front = len;
  const c = document.createElement('canvas');
  c.width = Math.ceil(back + front + pad * 2);
  c.height = Math.ceil(w * 6 + pad * 2);
  const g = c.getContext('2d'), ox = back + pad, oy = c.height / 2;
  // Baked glow: an elongated radial gradient along the blade
  const gr = (front + back) * 0.55;
  g.save();
  g.translate(ox + len * 0.3, oy);
  g.scale(1, (c.height / 2) / gr);
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, gr);
  glow.addColorStop(0, 'rgba(110, 231, 183, 0.55)');
  glow.addColorStop(0.45, 'rgba(16, 185, 129, 0.22)');
  glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
  g.fillStyle = glow;
  g.beginPath(); g.arc(0, 0, gr, 0, Math.PI * 2); g.fill();
  g.restore();
  drawEmeraldSwordBlade(g, ox, oy, 0, scale, 1, colossal); // shadowBlur runs once, here
  return (SWORD_SPRITES[key] = { canvas: c, ox, oy, len });
}
// Stamp a cached sword. (x, y) is the guard; the blade points along ang.
function stampSword(ctx, x, y, ang, k, alpha, colossal) {
  if (alpha <= 0) return;
  const s = swordSprite(colossal);
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.rotate(ang);
  if (k !== 1) ctx.scale(k, k);
  ctx.drawImage(s.canvas, -s.ox, -s.oy);
  ctx.restore();
}
// Stamp so the tip sits at (tx, ty); bury pulls the guard toward the tip (0 = tip just touching).
export function stampSwordTip(ctx, tx, ty, ang, k, alpha, colossal, bury = 0) {
  const reach = swordSprite(colossal).len * 0.96 * k * (1 - bury);
  stampSword(ctx, tx - Math.cos(ang) * reach, ty - Math.sin(ang) * reach, ang, k, alpha, colossal);
}
// Cached soft glow disc per colour, stamped with drawImage instead of building a gradient per call.
const GLOW_SPRITES = {};
function glowSprite(rgb) {
  if (GLOW_SPRITES[rgb]) return GLOW_SPRITES[rgb];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${rgb}, 1)`);
  gr.addColorStop(0.35, `rgba(${rgb}, 0.45)`);
  gr.addColorStop(1, `rgba(${rgb}, 0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return (GLOW_SPRITES[rgb] = c);
}
export function additiveGlow(ctx, x, y, r, rgb, alpha) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(glowSprite(rgb), x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// Fixed particle pool: no per-frame allocation.
// kind: 0 spark (additive streak), 1 dust, 2 stone chip, 3 jade shard (additive), 4 music note (additive glyph).
const PARTICLE_MAX = 300;
const PARTICLES = Array.from({ length: PARTICLE_MAX }, () => ({ live: false, kind: 0, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, color: '#fff', rot: 0, vr: 0, glyph: 0 }));
export const NOTE_GLYPHS = ['♪', '♫', '♩', '♬'];
let particleCursor = 0;
export function emitParticle(kind, x, y, vx, vy, life, size, color) {
  for (let n = 0; n < PARTICLE_MAX; n++) {
    const p = PARTICLES[(particleCursor + n) % PARTICLE_MAX];
    if (p.live) continue;
    particleCursor = (particleCursor + n + 1) % PARTICLE_MAX;
    p.live = true; p.kind = kind; p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.life = life; p.max = life; p.size = size; p.color = color;
    p.rot = Math.random() * Math.PI; p.vr = (Math.random() - 0.5) * 14; p.glyph = 0;
    return p;
  }
  return null;
}
export function burstImpact(x, y, sparks, dust, chips, power = 1) {
  for (let i = 0; i < sparks; i++) {
    const a = -Math.PI * (0.1 + Math.random() * 0.8), v = (90 + Math.random() * 170) * power;
    emitParticle(0, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.25 + Math.random() * 0.3, 1.2 + Math.random() * 1.6, Math.random() < 0.4 ? '#ecfdf5' : '#6ee7b7');
  }
  for (let i = 0; i < dust; i++) {
    const a = Math.random() * Math.PI * 2, v = (14 + Math.random() * 30) * power;
    emitParticle(1, x + Math.cos(a) * 4, y + Math.sin(a) * 2, Math.cos(a) * v, Math.sin(a) * v * 0.45 - 6, 0.5 + Math.random() * 0.45, (6 + Math.random() * 7) * power, '#8b8577');
  }
  for (let i = 0; i < chips; i++) {
    const a = -Math.PI * (0.15 + Math.random() * 0.7), v = (120 + Math.random() * 200) * power;
    emitParticle(2, x, y, Math.cos(a) * v, Math.sin(a) * v, 0.55 + Math.random() * 0.4, 1.8 + Math.random() * 2.6, Math.random() < 0.5 ? '#6b6459' : '#4a443c');
  }
}
// Shatter a stuck sword: shards spawn along the exposed blade (tip at the ground, rising along -ang).
export function burstShatter(x, y, ang, bladeLen, count) {
  for (let i = 0; i < count; i++) {
    const along = Math.random() * bladeLen;
    const px = x - Math.cos(ang) * along, py = y - Math.sin(ang) * along;
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 130;
    emitParticle(3, px, py, Math.cos(a) * v, Math.sin(a) * v - 60, 0.45 + Math.random() * 0.4, 1.6 + Math.random() * 2.4, Math.random() < 0.3 ? '#ecfdf5' : Math.random() < 0.5 ? '#6ee7b7' : '#34d399');
  }
}
export function updateParticles(dt) {
  if (dt <= 0) return;
  for (const p of PARTICLES) {
    if (!p.live) continue;
    p.life -= dt;
    if (p.life <= 0) { p.live = false; continue; }
    if (p.kind === 0) { p.vx *= 1 - 2.5 * dt; p.vy = p.vy * (1 - 2.5 * dt) + 260 * dt; }
    else if (p.kind === 1) { p.vx *= 1 - 3 * dt; p.vy *= 1 - 3 * dt; p.size += 10 * dt; }
    else if (p.kind === 2) { p.vy += 620 * dt; p.rot += p.vr * dt; }
    else if (p.kind === 3) { p.vx *= 1 - 1.5 * dt; p.vy += 300 * dt; p.rot += p.vr * dt; }
    else { p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 1.2 * dt) - 26 * dt; p.rot = Math.sin(p.life * 7 + p.vr) * 0.35; } // notes float up, swaying
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
}
export function drawParticles(ctx) {
  ctx.save();
  for (const p of PARTICLES) {          // normal blend: dust and chips
    if (!p.live || p.kind === 0 || p.kind >= 3) continue;
    const t = p.life / p.max;
    ctx.globalAlpha = p.kind === 1 ? 0.32 * t : Math.min(1, t * 2);
    ctx.fillStyle = p.color;
    if (p.kind === 1) { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2); ctx.restore(); }
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.font = '700 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of PARTICLES) {          // additive: sparks as streaks, shards as spinning slivers, notes as glyphs
    if (!p.live || p.kind === 1 || p.kind === 2) continue;
    const t = p.life / p.max;
    ctx.globalAlpha = p.kind === 0 ? t : Math.min(1, t * 1.6);
    if (p.kind === 4) {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.size, p.size);
      ctx.fillStyle = p.color;
      ctx.fillText(NOTE_GLYPHS[p.glyph], 0, 0);
      ctx.restore();
    } else if (p.kind === 0) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
      ctx.stroke();
    } else {
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.moveTo(-p.size * 1.6, 0); ctx.lineTo(0, -p.size * 0.5); ctx.lineTo(p.size * 1.6, 0); ctx.lineTo(0, p.size * 0.5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

export const hash01 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// Darken the board with a vignette that keeps (fx, fy) brighter, so the jade light reads as the focus.
export function dimFocus(ctx, size, fx, fy, alpha, rgb = '2, 8, 6') {
  if (alpha <= 0) return;
  ctx.save();
  const g = ctx.createRadialGradient(fx, fy, 40, fx, fy, size * 0.85);
  g.addColorStop(0, `rgba(${rgb}, ${alpha * 0.4})`);
  g.addColorStop(0.3, `rgba(${rgb}, ${alpha * 0.85})`);
  g.addColorStop(1, `rgba(${rgb}, ${Math.min(0.8, alpha * 1.35)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}
