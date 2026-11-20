/* Pure geometry helpers shared by the browser game.
 * Keep this file dependency-free so it works on Netlify static hosting.
 */
(function attachDuelPhysics(global) {
  'use strict';

  function segmentIntersectsAabb(x1, y1, x2, y2, box) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let tMin = 0;
    let tMax = 1;
    const p = [-dx, dx, -dy, dy];
    const q = [
      x1 - box.x,
      box.x + box.w - x1,
      y1 - box.y,
      box.y + box.h - y1
    ];

    for (let i = 0; i < 4; i++) {
      if (Math.abs(p[i]) < 1e-9) {
        if (q[i] < 0) return false;
        continue;
      }
      const t = q[i] / p[i];
      if (p[i] < 0) tMin = Math.max(tMin, t);
      else tMax = Math.min(tMax, t);
      if (tMin > tMax) return false;
    }
    return true;
  }

  function segmentCrossesHorizontalPlane(x1, y1, x2, y2, planeY) {
    if (y1 >= planeY) return { x: x1, y: planeY, t: 0 };
    if (y2 < planeY || Math.abs(y2 - y1) < 1e-9) return null;
    const t = (planeY - y1) / (y2 - y1);
    if (t < 0 || t > 1) return null;
    return { x: x1 + (x2 - x1) * t, y: planeY, t };
  }

  global.DuelPhysics = Object.freeze({
    segmentIntersectsAabb,
    segmentCrossesHorizontalPlane
  });
})(window);
