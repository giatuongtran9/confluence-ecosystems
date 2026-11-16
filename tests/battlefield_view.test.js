'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), V = require('../battlefield-view');
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);
const quad = [[.3, .12], [.7, .12], [.92, .86], [.08, .86]]; // a steep perspective trapezoid

test('homography maps the four outer route corners onto the calibrated image corners', () => {
  const H = V.homography(quad);
  [[-.5, -.5], [4.5, -.5], [4.5, 4.5], [-.5, 4.5]].forEach(([x, y], i) => { const p = H(x, y); near(p.U, quad[i][0], `U${i}`); near(p.V, quad[i][1], `V${i}`); });
});

test('arena centre lands on the intersection of the quad diagonals (perspective, not linear midpoint)', () => {
  const p = V.homography(quad)(2, 2), [a, b, c, d] = quad;
  const t = ((b[0] - a[0]) * (d[1] - b[1]) - (b[1] - a[1]) * (d[0] - b[0])) / ((c[0] - a[0]) * (d[1] - b[1]) - (c[1] - a[1]) * (d[0] - b[0]));
  near(p.U, a[0] + t * (c[0] - a[0]), 'U'); near(p.V, a[1] + t * (c[1] - a[1]), 'V');
  assert.ok(p.V < (quad[0][1] + quad[2][1]) / 2, 'perspective pushes the centre toward the far edge');
});

test('a rectangular calibration reduces to the linear top-down mapping', () => {
  const H = V.homography([[.2, .2], [.8, .2], [.8, .8], [.2, .8]]);
  for (const [x, y] of [[0, 0], [2, 1], [4, 3]]) { const p = H(x, y); near(p.U, .2 + (x + .5) / 5 * .6, 'U'); near(p.V, .2 + (y + .5) / 5 * .6, 'V'); }
});

test('projector converts image fractions to the full-width, vertically centred square board', () => {
  const P = V.projector({ aspect: 1.5, corners: quad }), p = P(-.5, -.5);
  near(p.u, quad[0][0], 'u'); near(p.v, (quad[0][1] - .5) / 1.5 + .5, 'v');
});

test('a 3×3-square (grid) calibration is the same mapping as the equivalent outer-corner calibration', () => {
  const outer = V.homography(quad), grid = [[.5, .5], [3.5, .5], [3.5, 3.5], [.5, 3.5]].map(([x, y]) => { const p = outer(x, y); return [p.U, p.V]; });
  const a = V.projector({ aspect: 1.5, corners: quad }), b = V.projector({ aspect: 1.5, grid });
  for (const [x, y] of [[-.5, -.5], [0, 0], [2, 2], [4, 1], [4.5, 4.5]]) { const p = a(x, y), q = b(x, y); near(p.u, q.u, 'u'); near(p.v, q.v, 'v'); }
});
