/**
 * Simple aquatic plant strokes (optional helper for other scenes).
 */
(function registerAquaticPlantHelper(globalObj) {
  function drawAquaticPlants(p) {
    p.clear();
  }

  globalObj.drawAquaticPlants = drawAquaticPlants;
})(window);


// aquatic-plants.js — lily pads with p5.js
// Usage: initAquaticPlants('your-container-id')
// Requires p5.js to be loaded before this script

function initAquaticPlants(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  new p5(function(p) {
    let W = 660;
    let H = 600;

    function syncPlantLayerSize() {
      const r = container.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width)) || 660;
      H = Math.max(1, Math.floor(r.height)) || Math.round(W * 0.92);
      if (p.canvas) {
        p.resizeCanvas(W, H);
      }
    }

    // Lily pads: x, y center as fraction of canvas; r radius / W; rot, gap (notch) in rad
    const pads = [
      { x: 0.12, y: 0.78, r: 0.048, rot: 0.5, gap: 1.05 },
      { x: 0.22, y: 0.86, r: 0.042, rot: 2.2, gap: 0.95 },
      { x: 0.30, y: 0.74, r: 0.055, rot: 1.1, gap: 1.1 },
      { x: 0.38, y: 0.84, r: 0.046, rot: 3.4, gap: 1.0 },
      { x: 0.44, y: 0.76, r: 0.078, rot: 0.4, gap: 1.2, bloom: true },
      { x: 0.54, y: 0.80, r: 0.062, rot: 2.8, gap: 0.9 },
      { x: 0.48, y: 0.84, r: 0.052, rot: 1.8, gap: 1.0 },
      { x: 0.58, y: 0.74, r: 0.068, rot: 4.1, gap: 1.1 },
      { x: 0.50, y: 0.88, r: 0.044, rot: 0.7, gap: 0.85 },
      { x: 0.42, y: 0.82, r: 0.056, rot: 3.3, gap: 1.05 },
      { x: 0.62, y: 0.86, r: 0.050, rot: 5.0, gap: 0.95 },
      { x: 0.38, y: 0.78, r: 0.045, rot: 2.1, gap: 1.15 },
      { x: 0.56, y: 0.90, r: 0.038, rot: 1.2, gap: 0.8 },
      { x: 0.46, y: 0.72, r: 0.060, rot: 3.8, gap: 1.0 },
      { x: 0.65, y: 0.79, r: 0.042, rot: 0.2, gap: 0.9 },
      { x: 0.72, y: 0.85, r: 0.040, rot: 4.5, gap: 0.92 },
      { x: 0.82, y: 0.77, r: 0.052, rot: 1.6, gap: 1.08, bloom: true },
      { x: 0.88, y: 0.88, r: 0.038, rot: 2.9, gap: 0.88 },
      { x: 0.08, y: 0.90, r: 0.036, rot: 0.9, gap: 0.9 },
      { x: 0.68, y: 0.68, r: 0.046, rot: 2.5, gap: 1.0, bloom: true },
    ];

    const padPhase = pads.map((_, i) => i * 0.91);
    let dragonPhase = 0;

    const sacredLotuses = [
      { nx: 0.34, ny: 0.56, padR: 0.095, rot: 0.35, seed: 401 },
      { nx: 0.71, ny: 0.52, padR: 0.082, rot: 2.05, seed: 718 },
      { nx: 0.52, ny: 0.63, padR: 0.072, rot: 4.2, seed: 529 }
    ];

    // Perspective skew: compresses y and pulls x inward to simulate top-down view
    function skewPt(x, y, cx, cy) {
      const yScale = 0.38;
      const xPull = 0.18;
      const dy = y - cy;
      const dx = x - cx;
      return {
        x: cx + dx * (1 - xPull * Math.abs(dy / (W * 0.1))),
        y: cy + dy * yScale
      };
    }

    function drawLilyPad(pad, idx) {
      const t = p.frameCount * 0.016;
      const drift = Math.sin(t + padPhase[idx]) * (W * 0.004);
      const cx = pad.x * W;
      const cy = pad.y * H + drift;
      const r = pad.r * W;
      const gap = pad.gap;
      const rot = pad.rot + Math.sin(t * 0.8 + padPhase[idx] * 0.5) * 0.045;
      const steps = 52;

      function skewedPts(radiusScale) {
        const pts = [];
        for (let i = 0; i <= steps; i += 1) {
          const a = rot + gap / 2 + (i / steps) * (p.TWO_PI - gap);
          const rx = cx + Math.cos(a) * r * radiusScale;
          const ry = cy + Math.sin(a) * r * radiusScale;
          const s = skewPt(rx, ry, cx, cy);
          pts.push(s);
        }
        return pts;
      }

      const outerPts = skewedPts(1.0);

      p.noStroke();
      const deep = p.color(28, 96, 58, 240);
      const rim = p.color(72, 156, 92, 215);
      const mid = p.lerpColor(deep, rim, 0.45);
      p.fill(mid);
      p.beginShape();
      p.vertex(cx, cy);
      outerPts.forEach((pt) => p.vertex(pt.x, pt.y));
      p.endShape(p.CLOSE);

      const shine = skewPt(cx + r * 0.18, cy - r * 0.14, cx, cy);
      p.noStroke();
      p.fill(160, 228, 168, 65);
      p.ellipse(shine.x, shine.y, r * 0.65, r * 0.28);

      p.noFill();
      p.stroke(34, 90, 48, 205);
      p.strokeWeight(r * 0.034);
      p.beginShape();
      outerPts.forEach((pt) => p.vertex(pt.x, pt.y));
      p.endShape();

      p.stroke(66, 136, 74, 150);
      p.strokeWeight(r * 0.019);
      const veinCount = 8;
      for (let v = 0; v < veinCount; v += 1) {
        const a = rot + gap / 2 + ((v + 0.5) / veinCount) * (p.TWO_PI - gap);
        const es = skewPt(cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92, cx, cy);
        p.line(cx, cy, es.x, es.y);
      }

      const midA = rot + gap / 2 + (p.TWO_PI - gap) / 2;
      const spineEnd = skewPt(cx + Math.cos(midA) * r * 0.94, cy + Math.sin(midA) * r * 0.94, cx, cy);
      p.stroke(72, 146, 78, 165);
      p.strokeWeight(r * 0.026);
      p.line(cx, cy, spineEnd.x, spineEnd.y);

      p.noStroke();
      p.fill(62, 132, 74, 215);
      const lipA = rot;
      const lipW = r * 0.16;
      const lipH = r * 0.055;
      p.push();
      const lipS = skewPt(cx + Math.cos(lipA) * r * 0.05, cy + Math.sin(lipA) * r * 0.05, cx, cy);
      p.translate(lipS.x, lipS.y);
      p.rotate(lipA + Math.atan2(Math.sin(lipA) * 0.38, Math.cos(lipA)));
      p.rect(-lipW * 0.5, -lipH * 0.5, lipW, lipH, lipH * 0.4);
      p.pop();
      p.noStroke();

      if (pad.bloom) {
        const fa = rot + gap / 2 + (p.TWO_PI - gap) * 0.5;
        const fx = cx + Math.cos(fa) * r * 0.22;
        const fy = cy + Math.sin(fa) * r * 0.15;
        const fs = skewPt(fx, fy, cx, cy);
        drawWaterLilyBloom(fs.x, fs.y, r * 1.5, fa, idx);
      }
    }

    function drawWaterLilyBloom(x, y, scale, facing, seed) {
      const t = p.frameCount * 0.017;
      const bob = Math.sin(t + seed * 0.4) * 2;
      p.push();
      p.translate(x, y + bob);
      p.rotate(facing + 0.25);
      p.noStroke();
      for (let k = 0; k < 8; k += 1) {
        const a = (k / 8) * p.TWO_PI;
        p.push();
        p.rotate(a);
        p.fill(252, 252, 255, 232);
        p.ellipse(0, -scale * 0.36, scale * 0.58, scale * 0.28);
        p.pop();
      }
      p.fill(255, 228, 130, 238);
      p.circle(0, 0, scale * 0.4);
      p.fill(252, 195, 65, 215);
      p.circle(0, 0, scale * 0.22);
      p.fill(255, 255, 255, 140);
      p.circle(-scale * 0.07, -scale * 0.06, scale * 0.11);
      p.pop();
    }

    function drawSacredLotus(lo) {
      const t = p.frameCount * 0.014;
      const drift = Math.sin(t + lo.seed * 0.07) * (W * 0.003);
      const cx = lo.nx * W + drift;
      const cy = lo.ny * H + Math.cos(t * 0.9 + lo.seed * 0.05) * (H * 0.004);
      const pr = lo.padR * W;
      const rot = lo.rot + Math.sin(t * 0.35 + lo.seed * 0.02) * 0.04;
      const cxSk = skewPt(cx, cy, cx, cy).x;
      const cySk = skewPt(cx, cy, cx, cy).y;

      const outerPts = [];
      const steps = 48;
      const notch = 0.28;
      for (let i = 0; i <= steps; i += 1) {
        const ang =
          rot +
          notch / 2 +
          (i / steps) * (p.TWO_PI - notch);
        const px = cx + Math.cos(ang) * pr;
        const py = cy + Math.sin(ang) * pr * 0.72;
        outerPts.push(skewPt(px, py, cx, cy));
      }

      p.noStroke();
      const depth = p.color(18, 92, 58, 245);
      const rim = p.color(52, 142, 88, 235);
      p.fill(p.lerpColor(depth, rim, 0.45));
      p.beginShape();
      p.vertex(cxSk, cySk);
      outerPts.forEach((pt) => p.vertex(pt.x, pt.y));
      p.endShape(p.CLOSE);

      p.stroke(34, 110, 72, 160);
      p.strokeWeight(Math.max(pr * 0.06, 1));
      p.noFill();
      for (let v = 0; v < 11; v += 1) {
        const a = rot + notch / 2 + ((v + 0.5) / 11) * (p.TWO_PI - notch);
        const ex = cx + Math.cos(a) * pr * 0.94;
        const ey = cy + Math.sin(a) * pr * 0.72 * 0.94;
        const es = skewPt(ex, ey, cx, cy);
        p.line(cxSk, cySk, es.x, es.y);
      }

      const bloomR = pr * 0.72;
      const bx = cxSk;
      const by = cySk - pr * 0.06;
      p.push();
      p.translate(bx, by);
      p.rotate(rot * 0.5 + t * 0.04);
      const rings = [
        { n: 14, rat: 1, pink: [255, 158, 178] },
        { n: 11, rat: 0.78, pink: [255, 192, 210] },
        { n: 9, rat: 0.58, pink: [255, 220, 232] }
      ];
      rings.forEach((ring, ri) => {
        const rr = bloomR * ring.rat;
        for (let k = 0; k < ring.n; k += 1) {
          const a = (k / ring.n) * p.TWO_PI + ri * 0.25 + t * 0.06;
          p.push();
          p.rotate(a);
          p.fill(ring.pink[0], ring.pink[1], ring.pink[2], 242);
          p.ellipse(0, -rr * 0.48, rr * 0.4, rr * 1.05);
          p.pop();
        }
      });

      p.noStroke();
      p.fill(255, 252, 238, 245);
      p.circle(0, 0, bloomR * 0.52);
      p.fill(210, 195, 110, 240);
      p.circle(0, 0, bloomR * 0.4);
      const holes = 18;
      for (let h = 0; h < holes; h += 1) {
        const a = (h / holes) * p.TWO_PI;
        const rx = Math.cos(a) * bloomR * 0.14;
        const ry = Math.sin(a) * bloomR * 0.14;
        p.fill(92, 122, 48, 215);
        p.circle(rx, ry, bloomR * 0.062);
      }
      p.fill(255, 248, 210, 230);
      p.circle(0, 0, bloomR * 0.14);
      p.pop();
    }

    function drawPondDragonfly() {
      dragonPhase = (dragonPhase + W * 0.0022) % (W * 1.35);
      const dx = dragonPhase - W * 0.08;
      const dy = H * 0.28 + Math.sin(dragonPhase * 0.012) * (H * 0.06);
      const flap = Math.sin(p.frameCount * 0.35) * (W * 0.008);
      p.push();
      p.translate(dx, dy);
      p.rotate(-0.15);
      p.stroke(52, 72, 110, 190);
      p.strokeWeight(W * 0.004);
      p.line(-W * 0.06, 0, W * 0.06, 0);
      p.fill(160, 210, 255, 185);
      p.noStroke();
      p.ellipse(-W * 0.05, -flap, W * 0.045, W * 0.028);
      p.ellipse(-W * 0.05, flap, W * 0.045, W * 0.028);
      p.ellipse(W * 0.05, -flap * 0.9, W * 0.045, W * 0.028);
      p.ellipse(W * 0.05, flap * 0.9, W * 0.045, W * 0.028);
      p.fill(90, 140, 210, 160);
      p.ellipse(0, 0, W * 0.022, W * 0.014);
      p.pop();
    }

    function drawOceanVignette() {
      const steps = 28;
      for (let s = 0; s < steps; s += 1) {
        const u = s / (steps - 1);
        const y = H * (0.55 + u * 0.45);
        const deep = p.lerpColor(p.color(12, 48, 62, 0), p.color(10, 58, 72, 120), u * u);
        p.stroke(deep);
        p.strokeWeight(H * 0.022);
        p.line(0, y, W, y);
      }
      p.noStroke();
      p.fill(8, 42, 58, 35);
      p.rect(0, 0, W * 0.06, H);
      p.rect(W * 0.94, 0, W * 0.06, H);
    }

    function drawWaveBands() {
      const t = p.frameCount * 0.008;
      p.noFill();
      for (let b = 0; b < 6; b += 1) {
        const y0 = H * (0.18 + b * 0.11) + Math.sin(t * 1.4 + b * 1.1) * 10;
        p.stroke(160, 220, 235, 18 + b * 5);
        p.strokeWeight(1.2);
        p.beginShape();
        for (let x = 0; x <= W; x += 14) {
          const y = y0 + Math.sin(x * 0.014 + t * 2.2 + b * 0.8) * 6;
          p.vertex(x, y);
        }
        p.endShape();
      }
    }

    function drawRisingBubbles() {
      const t = p.frameCount * 0.022;
      p.noStroke();
      for (let i = 0; i < 46; i += 1) {
        const bx = ((i * 7411) % 1000) / 1000 * W * 0.9 + W * 0.05;
        const speed = 0.28 + ((i * 29) % 19) / 85;
        const travel = (t * speed * 52 + i * 37) % (H * 1.35);
        const y = H * 1.05 - travel;
        const wob = Math.sin(t * 1.6 + i * 0.9) * 11;
        const size = 1.6 + (i % 6) * 0.85;
        const a = 30 + (i % 13) * 9;
        p.fill(210, 248, 255, a);
        p.circle(bx + wob, y, size);
        p.stroke(255, 255, 255, a * 0.45);
        p.noFill();
        p.circle(bx + wob, y, size + 1.4);
        p.noStroke();
      }
    }

    function drawKelpStrands() {
      const bases = [0.05, 0.11, 0.18, 0.84, 0.91, 0.96];
      bases.forEach((bx, i) => {
        const x = bx * W;
        const baseY = H * 0.98;
        p.noFill();
        p.stroke(22, 96, 88, 165);
        p.strokeWeight(Math.max(W * 0.005, 1.2));
        p.beginShape();
        const segs = 22;
        for (let s = 0; s <= segs; s += 1) {
          const u = s / segs;
          const sway = Math.sin(p.frameCount * 0.019 + i * 2.1 + u * 7) * W * 0.042 * u;
          const px = x + sway;
          const py = baseY - u * H * (0.2 + (i % 3) * 0.04);
          p.vertex(px, py);
        }
        p.endShape();
        p.stroke(46, 140, 120, 95);
        p.strokeWeight(Math.max(W * 0.0025, 0.7));
        p.beginShape();
        for (let s = 0; s <= segs; s += 1) {
          const u = s / segs;
          const sway = Math.sin(p.frameCount * 0.019 + i * 2.1 + u * 7 + 0.5) * W * 0.028 * u;
          p.vertex(x + sway + W * 0.012, baseY - u * H * 0.18);
        }
        p.endShape();
      });
    }

    function drawFishSchools() {
      const t = p.frameCount * 0.018;
      const lead = ((t * 125) % (W * 1.55)) - W * 0.12;
      const y1 = H * 0.38 + Math.sin(t * 1.15) * (H * 0.035);
      p.noStroke();
      for (let f = 0; f < 9; f += 1) {
        const fx = lead - f * W * 0.036;
        const fy = y1 + Math.sin(t * 1.4 + f * 0.7) * 7;
        const g = 120 + Math.sin(t * 2 + f) * 35;
        p.fill(72, g, 158, 195);
        p.push();
        p.translate(fx, fy);
        p.rotate(-0.05 + Math.sin(t + f) * 0.04);
        p.triangle(0, 0, -W * 0.024, -W * 0.01, -W * 0.024, W * 0.01);
        p.fill(200, 230, 255, 160);
        p.circle(-W * 0.018, -W * 0.003, W * 0.008);
        p.pop();
      }

      const lead2 = W * 1.08 - ((t * 88) % (W * 1.4));
      const y2 = H * 0.52 + Math.cos(t * 0.95) * (H * 0.04);
      for (let f = 0; f < 6; f += 1) {
        const fx = lead2 + f * W * 0.03;
        const fy = y2 + Math.cos(t * 1.2 + f) * 5;
        p.fill(255, 170, 130, 175);
        p.push();
        p.translate(fx, fy);
        p.rotate(p.PI + 0.12);
        p.triangle(0, 0, -W * 0.02, -W * 0.009, -W * 0.02, W * 0.009);
        p.pop();
      }
    }

    function drawWaterShimmer() {
      const t = p.frameCount * 0.011;
      p.noStroke();
      for (let i = 0; i < 11; i += 1) {
        const sx = W * (0.1 + (i % 4) * 0.23) + Math.sin(t + i * 1.3) * 26;
        const sy = H * (0.06 + (i % 3) * 0.09) + Math.cos(t * 0.9 + i) * 16;
        const teal = p.lerpColor(p.color(140, 235, 245, 18), p.color(180, 250, 255, 38), (i % 5) / 5);
        p.fill(teal);
        p.ellipse(sx, sy, W * 0.15 + i * 7, H * 0.038 + i * 2);
      }
      p.fill(255, 255, 255, 14);
      for (let j = 0; j < 5; j += 1) {
        const cx = W * (0.2 + j * 0.18) + Math.sin(t * 1.8 + j * 2.2) * 40;
        const cy = H * (0.25 + j * 0.06);
        p.ellipse(cx, cy, W * 0.55, H * 0.018);
      }
    }

    p.setup = function setup() {
      syncPlantLayerSize();
      const cnv = p.createCanvas(W, H);
      cnv.parent(containerId);
      p.pixelDensity(1);
    };

    p.windowResized = function windowResized() {
      syncPlantLayerSize();
    };

    p.draw = function draw() {
      p.clear();
      drawOceanVignette();
      drawWaveBands();
      drawRisingBubbles();
      drawWaterShimmer();
      drawFishSchools();
      drawKelpStrands();
      pads.forEach((pad, idx) => drawLilyPad(pad, idx));
      sacredLotuses.forEach((lot) => drawSacredLotus(lot));
      drawPondDragonfly();
    };
  });
}
