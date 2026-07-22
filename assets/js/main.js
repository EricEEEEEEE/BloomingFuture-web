(function () {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setNavState() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }

  window.addEventListener("scroll", setNavState, { passive: true });
  setNavState();

  if (burger && nav && navLinks) {
    burger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      nav.classList.toggle("open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Open navigation");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  const revealNodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("in"));
  }

  function animateNumber(el) {
    const target = Number.parseInt(el.dataset.count || "0", 10);
    const unit = el.querySelector(".unit")?.outerHTML || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.innerHTML = Math.round(target * eased) + unit;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const countNodes = document.querySelectorAll(".num[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateNumber(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    countNodes.forEach((node) => countObserver.observe(node));
  }

  const learningLoop = document.querySelector("[data-learning-loop]");
  if (learningLoop) {
    const learningSteps = [...learningLoop.querySelectorAll("[data-loop-step]")];
    let learningStepIndex = 0;
    let learningLoopTimer = 0;
    let learningLoopVisible = false;

    function showLearningStep(index) {
      learningStepIndex = index % learningSteps.length;
      learningLoop.dataset.activeStep = String(learningStepIndex + 1);
      learningSteps.forEach((step, stepIndex) => {
        step.classList.toggle("is-active", stepIndex === learningStepIndex);
        if (stepIndex === learningStepIndex) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    }

    function stopLearningLoop() {
      window.clearInterval(learningLoopTimer);
      learningLoopTimer = 0;
    }

    function startLearningLoop() {
      if (reduceMotion) return;
      if (document.hidden || !learningLoopVisible || learningLoopTimer) return;
      learningLoopTimer = window.setInterval(() => showLearningStep(learningStepIndex + 1), 2000);
    }

    showLearningStep(0);
    const learningLoopObserver = new IntersectionObserver(([entry]) => {
      learningLoopVisible = entry.isIntersecting;
      if (learningLoopVisible) startLearningLoop();
      else stopLearningLoop();
    }, { threshold: 0.25 });
    learningLoopObserver.observe(learningLoop);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopLearningLoop();
      else startLearningLoop();
    });
  }

  const canvas = document.getElementById("heroMatrix");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  const heroBody = hero?.querySelector(".hero-body");
  if (!ctx || !hero || !heroBody) return;

  const DESKTOP_FRAME_INTERVAL = 1000 / 60;
  const MOBILE_FRAME_INTERVAL = 1000 / 30;
  const POINTER_RADIUS = 120;
  const ambientWords = ["文", "学", "AI", "远", "方", "华", "语", "言", "开", "花", "诗", "人", "文", "思", "考", "读", "写", "讲"];
  const techTokens = ["LLM", "NLP", "tensor", "token", "model", "embedding", "inference"];
  const codeSnippets = [
    "{\"model\":\"bf-tutor\"}",
    "tokens:274_000",
    "<reasoning>",
    "embedding[768]",
    "attention(q,k,v)",
    "loss:0.0023"
  ];

  const root = getComputedStyle(document.documentElement);
  const colorVars = ["--bf-red", "--bf-orange", "--bf-green", "--bf-blue", "--bf-navy"];
  const colors = colorVars.map((name) => root.getPropertyValue(name).trim());
  const green = root.getPropertyValue("--bf-green").trim();
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let isMobile = false;
  let isHeroVisible = true;
  let animationFrame = 0;
  let resizeFrame = 0;
  let lastPaint = 0;
  let lastUpdate = performance.now();
  let paintCount = 0;
  let exclusionRect = null;
  let ambientGlyphs = [];
  let tokenGlyphs = [];
  let codeGlyphs = [];
  let connections = [];
  let nextFlashAt = lastUpdate + 4000 + Math.random() * 3000;
  let nextConnectionAt = lastUpdate + 2400 + Math.random() * 1600;
  const pointer = { active: false, x: 0, y: 0 };

  function hexToRgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function refreshExclusion() {
    const heroRect = hero.getBoundingClientRect();
    const nodes = [
      heroBody.querySelector(".hero-content"),
      heroBody.querySelector(".hero-lede .bi-para")
    ].filter(Boolean);
    if (!nodes.length) {
      exclusionRect = null;
      return;
    }

    const rects = nodes.map((node) => node.getBoundingClientRect());
    exclusionRect = {
      left: Math.max(0, Math.min(...rects.map((rect) => rect.left)) - heroRect.left - 30),
      right: Math.min(width, Math.max(...rects.map((rect) => rect.right)) - heroRect.left + 30),
      top: Math.max(0, Math.min(...rects.map((rect) => rect.top)) - heroRect.top - 30),
      bottom: Math.min(height, Math.max(...rects.map((rect) => rect.bottom)) - heroRect.top + 30)
    };
  }

  function isInsideExclusion(x, y, padding = 0) {
    if (!exclusionRect) return false;
    return x >= exclusionRect.left - padding
      && x <= exclusionRect.right + padding
      && y >= exclusionRect.top - padding
      && y <= exclusionRect.bottom + padding;
  }

  function boxHitsExclusion(x, y, boxWidth, boxHeight) {
    if (!exclusionRect) return false;
    return x < exclusionRect.right
      && x + boxWidth > exclusionRect.left
      && y > exclusionRect.top
      && y - boxHeight < exclusionRect.bottom;
  }

  function segmentHitsExclusion(a, b) {
    if (!exclusionRect) return false;
    const left = Math.min(a.x, b.x);
    const right = Math.max(a.x, b.x);
    const top = Math.min(a.y, b.y);
    const bottom = Math.max(a.y, b.y);
    return left < exclusionRect.right
      && right > exclusionRect.left
      && top < exclusionRect.bottom
      && bottom > exclusionRect.top;
  }

  function safePoint(preferRight = false) {
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const x = preferRight ? width * (0.58 + Math.random() * 0.4) : Math.random() * width;
      const y = 44 + Math.random() * Math.max(1, height - 88);
      if (!isInsideExclusion(x, y, 24)) return { x, y };
    }
    return { x: width * 0.88, y: height * (0.16 + Math.random() * 0.68) };
  }

  function sizeCanvas() {
    const rect = hero.getBoundingClientRect();
    const nextWidth = rect.width;
    const nextHeight = rect.height;
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    const changed = Math.abs(nextWidth - width) > 0.5
      || Math.abs(nextHeight - height) > 0.5
      || nextDpr !== dpr;
    if (!changed) {
      refreshExclusion();
      return false;
    }

    width = nextWidth;
    height = nextHeight;
    isMobile = width < 720;
    dpr = nextDpr;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.dataset.dpr = String(dpr);
    canvas.dataset.fps = isMobile ? "30" : "60";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    refreshExclusion();
    return true;
  }

  function makeAmbient(initial) {
    const point = initial ? safePoint(false) : { x: Math.random() * width, y: height + Math.random() * 40 };
    return {
      ...point,
      text: ambientWords[Math.floor(Math.random() * ambientWords.length)],
      vy: -(0.055 + Math.random() * 0.075),
      drift: -0.035 + Math.random() * 0.07,
      size: 14 + Math.random() * 4,
      alpha: 0.08 + Math.random() * 0.05,
      life: 0
    };
  }

  function makeToken(initial) {
    const point = initial ? safePoint(true) : { x: width * (0.62 + Math.random() * 0.36), y: height + Math.random() * 70 };
    return {
      ...point,
      text: techTokens[Math.floor(Math.random() * techTokens.length)],
      vy: -(0.095 + Math.random() * 0.12),
      drift: -0.05 + Math.random() * 0.1,
      size: 22 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.25 + Math.random() * 0.12,
      flashUntil: 0,
      life: 0
    };
  }

  function makeCode(initial) {
    const fromRight = Math.random() > 0.42;
    const point = initial ? safePoint(true) : {
      x: fromRight ? width + 220 : width * (0.56 + Math.random() * 0.4),
      y: fromRight ? 70 + Math.random() * Math.max(1, height - 140) : height + 40
    };
    return {
      ...point,
      text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
      vx: fromRight ? -(0.16 + Math.random() * 0.1) : -0.04 + Math.random() * 0.08,
      vy: fromRight ? -0.025 + Math.random() * 0.05 : -(0.13 + Math.random() * 0.07)
    };
  }

  function seedScene() {
    ambientGlyphs = [];
    tokenGlyphs = [];
    codeGlyphs = [];
    connections = [];
    const area = width * height;
    const ambientCount = isMobile ? 18 : Math.min(36, Math.max(28, Math.floor(area / 34000)));
    const tokenCount = isMobile ? 4 : Math.min(10, Math.max(8, Math.floor(area / 130000)));
    const codeCount = isMobile ? 0 : 4;
    for (let i = 0; i < ambientCount; i += 1) ambientGlyphs.push(makeAmbient(true));
    for (let i = 0; i < tokenCount; i += 1) tokenGlyphs.push(makeToken(true));
    for (let i = 0; i < codeCount; i += 1) codeGlyphs.push(makeCode(true));
  }

  function applyPointerForce(glyph, step) {
    if (!pointer.active || isMobile) return;
    const dx = glyph.x - pointer.x;
    const dy = glyph.y - pointer.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance >= POINTER_RADIUS) return;
    const force = (1 - distance / POINTER_RADIUS) * 1.15 * step;
    glyph.x += (dx / distance) * force;
    glyph.y += (dy / distance) * force;
  }

  function updateAmbient(step) {
    for (let i = 0; i < ambientGlyphs.length; i += 1) {
      const glyph = ambientGlyphs[i];
      glyph.y += glyph.vy * step;
      glyph.x += glyph.drift * step;
      glyph.life += step;
      applyPointerForce(glyph, step * 0.55);
      if (glyph.y < -30 || glyph.x < -60 || glyph.x > width + 60) ambientGlyphs[i] = makeAmbient(false);
    }
  }

  function updateTokens(step) {
    for (let i = 0; i < tokenGlyphs.length; i += 1) {
      const glyph = tokenGlyphs[i];
      glyph.y += glyph.vy * step;
      glyph.x += glyph.drift * step;
      glyph.life += step;
      applyPointerForce(glyph, step);
      if (glyph.y < -40 || glyph.x < -120 || glyph.x > width + 120) tokenGlyphs[i] = makeToken(false);
    }
  }

  function updateCode(step) {
    if (isMobile) return;
    for (let i = 0; i < codeGlyphs.length; i += 1) {
      const glyph = codeGlyphs[i];
      glyph.x += glyph.vx * step;
      glyph.y += glyph.vy * step;
      if (glyph.x < -240 || glyph.x > width + 260 || glyph.y < -80 || glyph.y > height + 80) codeGlyphs[i] = makeCode(false);
    }
  }

  function triggerFlash(now) {
    if (now < nextFlashAt || !tokenGlyphs.length) return;
    tokenGlyphs[Math.floor(Math.random() * tokenGlyphs.length)].flashUntil = now + 200;
    nextFlashAt = now + 4000 + Math.random() * 3000;
  }

  function triggerConnection(now) {
    if (isMobile || now < nextConnectionAt || tokenGlyphs.length < 2) return;
    const pool = ambientGlyphs.concat(tokenGlyphs);
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const a = pool[Math.floor(Math.random() * pool.length)];
      const b = pool[Math.floor(Math.random() * pool.length)];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (a !== b && distance < 240 && !segmentHitsExclusion(a, b)) {
        connections.push({ a, b, start: now, duration: 800, static: false });
        if (connections.length > 2) connections.shift();
        break;
      }
    }
    nextConnectionAt = now + 2400 + Math.random() * 1600;
  }

  function updateScene(step, now) {
    triggerFlash(now);
    triggerConnection(now);
    updateAmbient(step);
    updateTokens(step);
    updateCode(step);
  }

  function drawGrid() {
    const gap = isMobile ? 56 : 72;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.026)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = gap / 2; x < width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = gap / 2; y < height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      for (let x = gap / 2; x < width; x += gap) ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
    }
  }

  function drawAmbient() {
    for (const glyph of ambientGlyphs) {
      let alpha = glyph.alpha;
      if (glyph.life < 50) alpha *= glyph.life / 50;
      if (glyph.y < 60) alpha *= Math.max(0, glyph.y / 60);
      if (isInsideExclusion(glyph.x, glyph.y, 10)) alpha *= 0.32;
      ctx.font = `500 ${glyph.size}px "Noto Serif SC", serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.fillText(glyph.text, glyph.x, glyph.y);
    }
  }

  function drawTokens(now) {
    for (const glyph of tokenGlyphs) {
      ctx.font = `500 ${glyph.size}px "JetBrains Mono", ui-monospace, monospace`;
      const textWidth = ctx.measureText(glyph.text).width;
      if (boxHitsExclusion(glyph.x, glyph.y, textWidth, glyph.size)) continue;
      let alpha = now < glyph.flashUntil ? 0.8 : glyph.alpha;
      if (glyph.life < 40) alpha *= glyph.life / 40;
      ctx.fillStyle = hexToRgba(glyph.color, alpha.toFixed(3));
      if (now < glyph.flashUntil) {
        ctx.shadowColor = hexToRgba(glyph.color, 0.55);
        ctx.shadowBlur = 14;
      }
      ctx.fillText(glyph.text, glyph.x, glyph.y);
      ctx.shadowBlur = 0;
    }
  }

  function drawCode() {
    if (isMobile) return;
    ctx.font = "400 14px \"JetBrains Mono\", ui-monospace, monospace";
    ctx.fillStyle = hexToRgba(green, 0.5);
    for (const glyph of codeGlyphs) {
      const textWidth = ctx.measureText(glyph.text).width;
      if (!boxHitsExclusion(glyph.x, glyph.y, textWidth, 14)) ctx.fillText(glyph.text, glyph.x, glyph.y);
    }
  }

  function drawConnections(now) {
    if (isMobile) return;
    for (let i = connections.length - 1; i >= 0; i -= 1) {
      const connection = connections[i];
      const age = now - connection.start;
      if (!connection.static && age >= connection.duration) {
        connections.splice(i, 1);
        continue;
      }
      if (segmentHitsExclusion(connection.a, connection.b)) continue;
      const alpha = connection.static ? 0.18 : 0.3 * (1 - age / connection.duration);
      ctx.beginPath();
      ctx.moveTo(connection.a.x, connection.a.y);
      ctx.lineTo(connection.b.x, connection.b.y);
      ctx.strokeStyle = hexToRgba(green, alpha.toFixed(3));
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawScene(now) {
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = "alphabetic";
    drawGrid();
    drawAmbient();
    drawConnections(now);
    drawTokens(now);
    drawCode();
    paintCount += 1;
    canvas.dataset.frameCount = String(paintCount);
  }

  function renderStaticFrame() {
    if (!isMobile && tokenGlyphs.length > 3) {
      const pairs = [[0, 1], [2, 3]];
      connections = pairs
        .map(([a, b]) => ({ a: tokenGlyphs[a], b: tokenGlyphs[b], start: 0, duration: Infinity, static: true }))
        .filter((connection) => !segmentHitsExclusion(connection.a, connection.b));
    }
    drawScene(performance.now());
    canvas.dataset.paused = "reduced-motion";
  }

  function canAnimate() {
    return !reduceMotion && !document.hidden && isHeroVisible;
  }

  function frame(now) {
    animationFrame = 0;
    if (!canAnimate()) return;
    const interval = isMobile ? MOBILE_FRAME_INTERVAL : DESKTOP_FRAME_INTERVAL;
    if (now - lastPaint >= interval) {
      const step = Math.min(2, (now - lastUpdate) / 16.67 || 1);
      lastUpdate = now;
      lastPaint = now;
      updateScene(step, now);
      drawScene(now);
    }
    animationFrame = requestAnimationFrame(frame);
  }

  function syncAnimationState() {
    if (!canAnimate()) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      canvas.dataset.paused = document.hidden ? "hidden" : isHeroVisible ? "reduced-motion" : "offscreen";
      return;
    }
    canvas.dataset.paused = "false";
    lastUpdate = performance.now();
    lastPaint = 0;
    if (!animationFrame) animationFrame = requestAnimationFrame(frame);
  }

  function rebuildScene() {
    const changed = sizeCanvas();
    if (changed) seedScene();
    if (reduceMotion) renderStaticFrame();
    else drawScene(performance.now());
    syncAnimationState();
  }

  hero.addEventListener("pointermove", (event) => {
    if (isMobile) return;
    const rect = hero.getBoundingClientRect();
    pointer.active = true;
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  document.addEventListener("visibilitychange", syncAnimationState);

  const heroObserver = new IntersectionObserver((entries) => {
    isHeroVisible = entries[0]?.isIntersecting ?? true;
    syncAnimationState();
  }, { threshold: 0.01 });
  heroObserver.observe(hero);

  const resizeObserver = new ResizeObserver(() => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      rebuildScene();
    });
  });
  resizeObserver.observe(hero);

  sizeCanvas();
  seedScene();
  if (reduceMotion) renderStaticFrame();
  else drawScene(performance.now());
  syncAnimationState();
})();
