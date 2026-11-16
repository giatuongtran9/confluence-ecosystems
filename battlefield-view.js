// 2.5D battlefield mapping. A perspective battlefield image is calibrated by where the OUTER corners of the 16-tile
// route ring sit in that image, as fractions (0–1) of its width/height, clockwise from the far-left corner:
//   corners: [[U,V] far-left, [U,V] far-right, [U,V] near-right, [U,V] near-left]
// or, when the art paints the 3×3 deployment square, the same four corners of that square instead:  grid: [[U,V] ×4]
// The painted floor is a flat plane, so those 4 points fix a homography that places every slot, route tile, runner and
// effect exactly on it. Engine route coordinates run 0–4 (centre grid 1–3); the outer corners are at -0.5 and 4.5.
(function (root) {
  // Unit square (s, t) -> quad p0..p3 (Heckbert's square-to-quad projective mapping). lo/hi = the engine coordinate
  // the quad's edges sit at: -0.5/4.5 for the outer route corners, 0.5/3.5 for the 3×3 deployment square.
  function homography(corners, lo = -.5, hi = 4.5) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = corners;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
    return (x, y) => {
      const s = (x - lo) / (hi - lo), t = (y - lo) / (hi - lo), w = g * s + h * t + 1;
      return { U: (a * s + b * t + x0) / w, V: (d * s + e * t + y0) / w };
    };
  }
  // The square .board (cards + effects canvas) spans the stage's full width and is centred vertically. The image covers
  // the stage (cropped at the sides when the stage is narrower than the image, e.g. the square Ability Lab), so a point
  // at image fraction (U, V) on a stage of aspect S sits at board fraction ((U - .5) * A / S + .5, (V - .5) / S + .5),
  // with A = the image aspect. S = A (the widescreen battle stage) gives (U, (V - .5) / A + .5).
  function projector(view, stageAspect = view.aspect) {
    const H = view.grid ? homography(view.grid, .5, 3.5) : homography(view.corners), A = view.aspect, S = stageAspect;
    return (x, y) => { const p = H(x, y); return { u: (p.U - .5) * A / S + .5, v: (p.V - .5) / S + .5 }; };
  }
  const api = { homography, projector };
  if (typeof module !== 'undefined') module.exports = api; else root.BattleView = api;
})(typeof window !== 'undefined' ? window : globalThis);
