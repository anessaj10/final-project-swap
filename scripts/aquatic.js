(function initAquaticRoom() {
  const skyLayerEl = document.getElementById("sky-layer");
  const plantLayerEl = document.getElementById("plant-layer");
  const greenhouseImg = document.getElementById("greenhouse-img");
  const sceneViewportEl = greenhouseImg?.closest(".scene-viewport");
  const skySelectEl = document.getElementById("sky-preset");

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

  const skyPresets = {
    aquaticBlue: [
      "#F0FDFF",
      "#D4F4FC",
      "#A8E8F2",
      "#78D4E8",
      "#4FB8D8",
      "#2E96BE",
      "#1A6F94",
      "#0E4A6E"
    ],
    brightDay: [
      "#FAFEFF",
      "#E5F8FF",
      "#C8EEFB",
      "#A6E0F4",
      "#7CCDE8",
      "#58B6D6"
    ],
    softDusk: [
      "#F4E8F2",
      "#E8D5E8",
      "#D9C0DE",
      "#C4A8CF",
      "#A68BB8",
      "#8A7299"
    ]
  };

  let currentSkyPresetKey = skySelectEl?.value || "aquaticBlue";
  greenhouseImg?.addEventListener("load", applyViewportAspectFromLoadedImage);
  if (greenhouseImg?.complete) applyViewportAspectFromLoadedImage();

  const skySketch = (p) => {
    let caustics = [];

    function seedCaustics() {
      const { width, height } = getLayerSize(skyLayerEl);
      caustics = Array.from({ length: 14 }, (_, i) => ({
        x: (p.random(0.08, 0.92) * width) || width * 0.5,
        y: (p.random(0.35, 0.98) * height) || height * 0.7,
        rx: p.random(width * 0.08, width * 0.22),
        ry: p.random(height * 0.014, height * 0.05),
        phase: p.random(p.TWO_PI),
        spd: p.random(0.018, 0.055)
      }));
    }

    p.setup = function setup() {
      const { width, height } = getLayerSize(skyLayerEl);
      p.createCanvas(width, height).parent("sky-layer");
      seedCaustics();
    };

    p.draw = function draw() {
      const colors = skyPresets[currentSkyPresetKey] || skyPresets.aquaticBlue;
      for (let y = 0; y < p.height; y += 1) {
        const seg = (colors.length - 1) * (y / p.height);
        const i = Math.floor(seg);
        const f = seg - i;
        const c1 = p.color(colors[Math.min(i, colors.length - 1)]);
        const c2 = p.color(colors[Math.min(i + 1, colors.length - 1)]);
        p.stroke(p.lerpColor(c1, c2, f));
        p.line(0, y, p.width, y);
      }

      const t = p.frameCount * 0.015;
      p.blendMode(p.ADD);
      caustics.forEach((c, idx) => {
        const driftX = Math.sin(t * c.spd + c.phase) * (p.width * 0.055);
        const driftY = Math.cos(t * c.spd * 0.65 + c.phase + idx) * (p.height * 0.025);
        const cx = p.constrain(c.x + driftX, -c.rx * 0.3, p.width + c.rx * 0.3);
        const cy = p.constrain(c.y + driftY, p.height * 0.28, p.height * 0.98);
        const alpha = currentSkyPresetKey === "softDusk" ? 18 : 28;
        p.fill(200, 248, 255, alpha);
        p.noStroke();
        p.push();
        p.translate(cx, cy);
        p.rotate(Math.sin(t * 0.4 + idx * 0.7) * 0.35);
        p.ellipse(0, 0, c.rx, c.ry);
        p.pop();
      });
      p.blendMode(p.BLEND);

      p.noFill();
      p.stroke(255, 255, 255, currentSkyPresetKey === "softDusk" ? 28 : 42);
      p.strokeWeight(1);
      const horizon = p.height * 0.28;
      for (let x = 0; x < p.width; x += 7) {
        const wobble = Math.sin(x * 0.03 + t * 1.6) * 3 + Math.sin(x * 0.09 + t * 2.3) * 1.5;
        p.point(x, horizon + wobble);
      }
    };

    p.windowResized = function windowResized() {
      const { width, height } = getLayerSize(skyLayerEl);
      p.resizeCanvas(width, height);
      seedCaustics();
    };
  };

  function startScene() {
    new p5(skySketch);
    if (typeof window.initAquaticPlants === "function" && plantLayerEl) {
      window.initAquaticPlants("plant-layer");
    }
    window.dispatchEvent(new Event("resize"));
  }

  if (document.readyState === "complete") {
    startScene();
  } else {
    window.addEventListener("load", startScene);
  }

  skySelectEl?.addEventListener("change", (e) => {
    currentSkyPresetKey = e.target.value;
  });
})();
