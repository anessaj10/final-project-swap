(function initPalmHouse() {
  const skyLayerEl = document.getElementById("sky-layer");
  const plantLayerEl = document.getElementById("plant-layer");
  const greenhouseImg = document.querySelector(".greenhouse-layer");
  const sceneViewportEl = greenhouseImg?.closest(".scene-viewport");

  function getLayerSize(layerEl) {
    const rect = layerEl.getBoundingClientRect();
    return {
      width: Math.max(1, Math.floor(rect.width)),
      height: Math.max(1, Math.floor(rect.height))
    };
  }

  function applyViewportAspectFromLoadedImage() {
    if (!greenhouseImg || !sceneViewportEl) return;
    const w = greenhouseImg.naturalWidth;
    const h = greenhouseImg.naturalHeight;
    if (!w || !h) return;
    sceneViewportEl.style.setProperty("--scene-aspect", `${w} / ${h}`);
    window.dispatchEvent(new Event("resize"));
  }

  greenhouseImg?.addEventListener("load", applyViewportAspectFromLoadedImage);
  if (greenhouseImg?.complete) {
    applyViewportAspectFromLoadedImage();
  }

  const skyPresets = {
    brightDay: {
      horizon: ["#E6F7FF", "#D9F0FC", "#CBE8F8"],
      mid: ["#BCDFF4", "#A8D0EC", "#95C2E4"],
      zenith: ["#80BFEC", "#6FAFDD"],
      layers: [
        { color: "#FCFFFF", opacity: 0.44, speed: 0.2, scale: 1.2, y: 0.62 },
        { color: "#FCFFFF", opacity: 0.34, speed: 0.1, scale: 1.6, y: 0.5 },
        { color: "#FFFCED", opacity: 0.25, speed: 0.05, scale: 2, y: 0.38 },
        { color: "#FFFCED", opacity: 0.16, speed: 0.03, scale: 2.6, y: 0.25 }
      ]
    },
    goldenHour: {
      horizon: ["#FFDFAD", "#FFD39A", "#FFC78A"],
      mid: ["#F9BB7D", "#F1AF78", "#EA9E70"],
      zenith: ["#F3B478", "#DF9F67"],
      layers: [
        { color: "#FFF5E0", opacity: 0.42, speed: 0.18, scale: 1.2, y: 0.62 },
        { color: "#FFF5E0", opacity: 0.31, speed: 0.09, scale: 1.6, y: 0.5 },
        { color: "#FFDBB0", opacity: 0.23, speed: 0.05, scale: 2, y: 0.38 },
        { color: "#FFDBB0", opacity: 0.16, speed: 0.03, scale: 2.6, y: 0.25 }
      ]
    },
    overcast: {
      horizon: ["#D2DCE1", "#C7D3D9", "#BDC9D0"],
      mid: ["#B2C0C8", "#A7B8C1", "#9CAFB9"],
      zenith: ["#96AAB6", "#889DAA"],
      layers: [
        { color: "#F2F6F9", opacity: 0.5, speed: 0.22, scale: 1.3, y: 0.65 },
        { color: "#F2F6F9", opacity: 0.4, speed: 0.11, scale: 1.8, y: 0.5 },
        { color: "#E6ECF0", opacity: 0.31, speed: 0.06, scale: 2.2, y: 0.35 },
        { color: "#E6ECF0", opacity: 0.22, speed: 0.03, scale: 2.8, y: 0.2 }
      ]
    },
    stormy: {
      horizon: ["#6C788A", "#647183", "#5D697B"],
      mid: ["#556172", "#4E5968", "#46515F"],
      zenith: ["#3C4A5B", "#344152"],
      layers: [
        { color: "#C7D5E0", opacity: 0.46, speed: 0.55, scale: 1.1, y: 0.7 },
        { color: "#C7D5E0", opacity: 0.36, speed: 0.32, scale: 1.5, y: 0.55 },
        { color: "#71808F", opacity: 0.29, speed: 0.18, scale: 2, y: 0.38 },
        { color: "#71808F", opacity: 0.23, speed: 0.08, scale: 2.5, y: 0.22 }
      ]
    },
    softDusk: {
      horizon: ["#FEDBD6", "#FBD2CF", "#F7C8C8"],
      mid: ["#F0BCC3", "#E9B4C0", "#E2ACBD"],
      zenith: ["#D6ACC6", "#C89FBA"],
      layers: [
        { color: "#FFF3F6", opacity: 0.43, speed: 0.14, scale: 1.3, y: 0.65 },
        { color: "#FFF3F6", opacity: 0.32, speed: 0.07, scale: 1.7, y: 0.5 },
        { color: "#FFD6DE", opacity: 0.24, speed: 0.04, scale: 2.2, y: 0.36 },
        { color: "#FFD6DE", opacity: 0.16, speed: 0.02, scale: 2.8, y: 0.22 }
      ]
    }
  };

  const skySelectEl = document.getElementById("sky-preset");
  let currentSkyPresetKey = skySelectEl?.value || "softDusk";
  const currentPlantStyle = "classic";

  const skySketch = (p) => {
    let activeSkyPreset = skyPresets[currentSkyPresetKey] || skyPresets.softDusk;
    let cloudLayers = [];
    let lastSkyPresetKey = currentSkyPresetKey;

    function rebuildCloudLayers() {
      activeSkyPreset = skyPresets[currentSkyPresetKey] || skyPresets.softDusk;
      cloudLayers = activeSkyPreset.layers.map((layer, i) => ({
        ...layer,
        blobs: Array.from({ length: 5 + i * 2 }, () => ({
          x: p.random(p.width),
          bw: p.random(80, 200) * layer.scale,
          bh: p.random(18, 44) * layer.scale,
          wobble: p.random(1000)
        }))
      }));
    }

    function gradHex(colors, t) {
      const seg = (colors.length - 1) * t;
      const i = Math.floor(seg);
      const f = seg - i;
      const c1 = p.color(colors[Math.min(i, colors.length - 1)]);
      const c2 = p.color(colors[Math.min(i + 1, colors.length - 1)]);
      return p.lerpColor(c1, c2, f);
    }

    function drawSkyGrad() {
      const allColors = [...activeSkyPreset.horizon, ...activeSkyPreset.mid, ...activeSkyPreset.zenith];
      for (let y = 0; y < p.height; y += 1) {
        p.stroke(gradHex(allColors, y / p.height));
        p.line(0, y, p.width, y);
      }
    }

    function drawCloudShape(cx, cy, bw, bh, seed) {
      const numPuffs = 5 + Math.round(bw / 60);
      for (let k = 0; k < numPuffs; k += 1) {
        const kf = k / (numPuffs - 1);
        const px = cx + (kf - 0.5) * bw;
        const arch = p.sin(kf * p.PI) * bh * 0.7;
        const pr = bh * (0.5 + p.sin(kf * p.PI) * 0.5) * (0.8 + 0.2 * p.sin(seed + k));
        p.ellipse(px, cy - arch * 0.3, pr * 2.2, pr * 1.6);
      }
      p.ellipse(cx, cy + bh * 0.18, bw * 0.82, bh * 0.55);
    }

    function drawCloudLayer(layer) {
      const t = p.millis() * 0.001;
      layer.blobs.forEach((blob) => {
        blob.x -= layer.speed;
        if (blob.x + blob.bw * 0.5 < -10) blob.x = p.width + blob.bw * 0.5;
        const wobbleY = p.sin(t * 0.4 + blob.wobble) * 3;
        const cy = layer.y * p.height + wobbleY;
        p.noStroke();
        const cloudColor = p.color(layer.color);
        cloudColor.setAlpha(layer.opacity * 255);
        p.fill(cloudColor);
        for (let xi = -1; xi <= 1; xi += 1) {
          drawCloudShape(blob.x + xi * p.width, cy, blob.bw, blob.bh, t + blob.wobble);
        }
      });
    }

    p.setup = function setup() {
      const { width, height } = getLayerSize(skyLayerEl);
      const canvas = p.createCanvas(width, height);
      canvas.parent("sky-layer");
      rebuildCloudLayers();
    };

    p.draw = function draw() {
      if (lastSkyPresetKey !== currentSkyPresetKey) {
        lastSkyPresetKey = currentSkyPresetKey;
        rebuildCloudLayers();
      }
      drawSkyGrad();
      cloudLayers.forEach(drawCloudLayer);
    };

    p.windowResized = function windowResized() {
      const { width, height } = getLayerSize(skyLayerEl);
      p.resizeCanvas(width, height);
      rebuildCloudLayers();
    };
  };

  const plantSketch = (p) => {
    const plantAnchors = [0.1, 0.35, 0.65, 0.85];
    const plants = [];

    const plantStyles = {
      classic: {
        mainLength: [0.28, 0.42],
        depth: [4, 6],
        spread: [0.19, 0.33],
        branchScale: [0.66, 0.76],
        frondLength: [0.06, 0.11],
        baseYOffset: [0.04, 0.1]
      },
      lush: {
        mainLength: [0.32, 0.46],
        depth: [5, 7],
        spread: [0.22, 0.36],
        branchScale: [0.68, 0.78],
        frondLength: [0.08, 0.13],
        baseYOffset: [0.05, 0.12]
      },
      airy: {
        mainLength: [0.26, 0.38],
        depth: [3, 5],
        spread: [0.15, 0.26],
        branchScale: [0.62, 0.72],
        frondLength: [0.05, 0.09],
        baseYOffset: [0.06, 0.14]
      }
    };

    const greenPalette = [
      [22, 92, 58],
      [48, 118, 72],
      [78, 154, 88],
      [118, 188, 104]
    ];

    function stemWeightMult() {
      return 1;
    }

    p.setup = function setup() {
      const { width, height } = getLayerSize(plantLayerEl);
      const canvas = p.createCanvas(width, height);
      canvas.parent("plant-layer");
      regeneratePlants();
    };

    p.draw = function draw() {
      p.clear();
      p.noiseDetail(2, 0.55);

      plants.forEach((plant, idx) => {
        p.push();
        p.translate(plant.baseX, p.height + plant.baseYOffset);
        const sway = p.sin(p.frameCount * 0.008 + idx * 0.7) * 0.06;
        p.rotate(sway);
        p.randomSeed(plant.seed);
        drawBranch(0, 0, plant.mainLength, -p.HALF_PI, plant.depth, plant);
        p.pop();
      });

      drawGlasshouseMotes();
    };

    function regeneratePlants() {
      plants.length = 0;
      const style = plantStyles[currentPlantStyle] || plantStyles.classic;
      const minDimension = Math.min(p.width, p.height);
      const d = 0.65;

      plantAnchors.forEach((anchor, idx) => {
        const depth = p.floor(p.random(style.depth[0], style.depth[1] + 1));

        plants.push({
          baseX: p.width * anchor,
          baseYOffset: minDimension * p.random(style.baseYOffset[0], style.baseYOffset[1]),
          mainLength:
            minDimension *
            p.random(
              p.lerp(style.mainLength[0] * 0.92, style.mainLength[0], d),
              p.lerp(style.mainLength[1], style.mainLength[1] * 1.06, d)
            ),
          depth,
          spread: p.random(
            p.lerp(style.spread[0] * 0.9, style.spread[0], d),
            p.lerp(style.spread[1], style.spread[1] * 1.08, d)
          ),
          branchScale: p.random(style.branchScale[0], style.branchScale[1]),
          frondLength:
            minDimension *
            p.random(
              p.lerp(style.frondLength[0] * 0.85, style.frondLength[0], d),
              p.lerp(style.frondLength[1], style.frondLength[1] * 1.12, d)
            ),
          leafClusterBias: p.floor(p.lerp(3, 8, d)),
          color: greenPalette[idx % greenPalette.length],
          seed: p.floor(p.random(10_000))
        });
      });
    }

    function drawBranch(x1, y1, len, angle, depth, plant) {
      if (depth <= 0 || Math.abs(len) < 10) {
        drawLeafCluster(x1, y1, angle, plant);
        return;
      }

      const x2 = x1 + p.cos(angle) * len;
      const y2 = y1 + p.sin(angle) * len;
      let strokeWeight = p.map(depth, 1, 6, 1.4, 6.8);
      if (depth >= 2) {
        strokeWeight *= stemWeightMult();
      }
      const shadeShift = p.map(depth, 1, 6, 26, -6);

      p.stroke(
        plant.color[0] + shadeShift * 0.35,
        plant.color[1] + shadeShift,
        plant.color[2] + shadeShift * 0.2,
        220
      );
      p.strokeWeight(strokeWeight);
      p.line(x1, y1, x2, y2);

      const jitterNoise = p.noise(plant.seed + x2 * 0.01, y2 * 0.01);
      const localSpread = plant.spread + p.map(jitterNoise, 0, 1, -0.08, 0.08);
      const nextLength = len * plant.branchScale;

      drawBranch(x2, y2, nextLength, angle - localSpread, depth - 1, plant);
      drawBranch(x2, y2, nextLength * 0.95, angle + localSpread, depth - 1, plant);

      if (depth <= 2) {
        drawLeafCluster(x2, y2, angle, plant);
      }
    }

    function drawLeafCluster(x, y, heading, plant) {
      p.randomSeed(plant.seed + Math.floor(x * 97 + y * 53));
      const lo = p.max(4, plant.leafClusterBias);
      const hi = p.min(9, plant.leafClusterBias + 3);
      const leafCount = p.floor(p.random(lo, hi + 1));

      for (let i = 0; i < leafCount; i += 1) {
        const side = i % 2 === 0 ? -1 : 1;
        const fanAngle = heading + side * p.random(0.22, 0.78);
        const leafLength = plant.frondLength * p.random(0.7, 1.3);
        const leafWidth = p.random(2.5, 5.4);
        const tipX = x + p.cos(fanAngle) * leafLength;
        const tipY = y + p.sin(fanAngle) * leafLength;
        const tag = ((plant.seed + i * 127) % 1000) / 1000;

        const r0 = plant.color[0] + p.random(-6, 10);
        const g0 = plant.color[1] + p.random(-6, 14);
        const b0 = plant.color[2] + p.random(-4, 12);

        p.noStroke();
        p.fill(r0, g0, b0, 218);
        p.push();
        p.translate(x, y);
        p.rotate(fanAngle);
        p.beginShape();
        p.vertex(0, 0);
        p.bezierVertex(
          leafLength * 0.22,
          -leafWidth,
          leafLength * 0.55,
          -leafWidth * 0.65,
          leafLength,
          0
        );
        p.bezierVertex(
          leafLength * 0.55,
          leafWidth * 0.65,
          leafLength * 0.22,
          leafWidth,
          0,
          0
        );
        p.endShape(p.CLOSE);
        p.fill(r0 + 32, g0 + 40, b0 + 28, 85);
        p.beginShape();
        p.vertex(leafLength * 0.08, -leafWidth * 0.05);
        p.bezierVertex(
          leafLength * 0.45,
          -leafWidth * 0.85,
          leafLength * 0.88,
          -leafWidth * 0.22,
          leafLength * 0.95,
          0
        );
        p.bezierVertex(
          leafLength * 0.5,
          -leafWidth * 0.25,
          leafLength * 0.15,
          leafWidth * 0.08,
          leafLength * 0.08,
          -leafWidth * 0.05
        );
        p.endShape(p.CLOSE);
        p.pop();

        p.stroke(plant.color[0] - 14, plant.color[1] - 18, plant.color[2] - 10, 115);
        p.strokeWeight(0.55);
        p.line(x, y, tipX, tipY);
        p.stroke(255, 252, 235, 55 + tag * 35);
        p.strokeWeight(0.35);
        p.line(x + p.cos(fanAngle + 0.08) * 3, y + p.sin(fanAngle + 0.08) * 3, tipX, tipY);

        if (tag > 0.62) {
          const dewR = 1.3 + tag * 2.2;
          p.noStroke();
          p.fill(240, 252, 255, 140 + tag * 80);
          p.circle(tipX - p.cos(fanAngle) * dewR * 2.2, tipY - p.sin(fanAngle) * dewR * 2.2, dewR * 2);
          p.fill(255, 255, 255, 90);
          p.circle(tipX - p.cos(fanAngle) * dewR * 2.5, tipY - p.sin(fanAngle) * dewR * 2.5, dewR * 0.7);
        }

        if (tag < 0.09) {
          drawMiniInflorescence(tipX, tipY, fanAngle);
        }
      }
    }

    function drawMiniInflorescence(tx, ty, angle) {
      p.push();
      p.translate(tx, ty);
      p.rotate(angle + p.HALF_PI * 0.08);
      p.noStroke();
      for (let k = 0; k < 7; k += 1) {
        const a = (k / 7) * p.TWO_PI;
        p.fill(252 + k * 2, 218 - k * 5, 188 - k * 4, 215);
        p.circle(Math.cos(a) * 5, Math.sin(a) * 5 - 2, 5 + (k % 2));
      }
      p.fill(255, 235, 210, 230);
      p.circle(0, -4, 6);
      p.pop();
    }

    function drawGlasshouseMotes() {
      const t = p.millis() * 0.001;
      p.noStroke();
      for (let i = 0; i < 22; i += 1) {
        const u = i / 22;
        const x =
          p.width * (0.06 + u * 0.88) + Math.sin(t * 1.5 + i * 0.73) * (14 + (i % 4) * 3);
        const y =
          p.height * (0.08 + (i % 7) * 0.035) + Math.cos(t * 1.1 + i * 0.44) * 10;
        const tw = 0.5 + 0.5 * Math.sin(t * 2.8 + i * 1.9);
        p.fill(255, 250, 228, 28 + tw * 48);
        p.circle(x, y, 1.6 + tw * 2.4);
        if (i % 5 === 0) {
          p.fill(220, 245, 255, 40 + tw * 35);
          p.circle(x + 4, y - 3, 1.2);
        }
      }
    }

    p.windowResized = function windowResized() {
      const { width, height } = getLayerSize(plantLayerEl);
      p.resizeCanvas(width, height);
      regeneratePlants();
    };

    p.regeneratePlants = regeneratePlants;
  };

  function startScene() {
    new p5(skySketch);
    new p5(plantSketch);
    window.dispatchEvent(new Event("resize"));
  }

  if (document.readyState === "complete") {
    startScene();
  } else {
    window.addEventListener("load", startScene);
  }

  skySelectEl?.addEventListener("change", (event) => {
    currentSkyPresetKey = event.target.value;
  });

})();
