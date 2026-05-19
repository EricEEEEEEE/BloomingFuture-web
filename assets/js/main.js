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

  const canvas = document.getElementById("heroMatrix");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  if (!ctx || !hero) return;

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
  let ambientGlyphs = [];
  let tokenGlyphs = [];
  let codeGlyphs = [];
  let connections = [];
  let lastFrame = performance.now();
  let nextFlashAt = lastFrame + 3000 + Math.random() * 2000;
  let nextConnectionAt = lastFrame + 2000 + Math.random() * 2000;

  function hexToRgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function sizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    isMobile = width < 720;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeAmbient(initial) {
    const text = ambientWords[Math.floor(Math.random() * ambientWords.length)];
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 40,
      text,
      vy: -(0.07 + Math.random() * 0.11),
      drift: -0.04 + Math.random() * 0.08,
      size: 14 + Math.random() * 4,
      alpha: 0.08 + Math.random() * 0.07,
      life: 0
    };
  }

  function makeToken(initial) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 80,
      text: techTokens[Math.floor(Math.random() * techTokens.length)],
      vy: -(0.14 + Math.random() * 0.22),
      drift: -0.07 + Math.random() * 0.14,
      size: 22 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.25 + Math.random() * 0.15,
      flashUntil: 0,
      life: 0
    };
  }

  function makeCode(initial) {
    const edge = Math.floor(Math.random() * 4);
    const fromLeft = edge === 0;
    const fromRight = edge === 1;
    const fromTop = edge === 2;
    const text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    return {
      x: initial ? Math.random() * width : (fromRight ? width + 180 : fromLeft ? -220 : Math.random() * width),
      y: initial ? Math.random() * height : (fromTop ? -40 : edge === 3 ? height + 40 : Math.random() * height),
      text,
      vx: fromRight ? -(0.24 + Math.random() * 0.14) : fromLeft ? 0.24 + Math.random() * 0.14 : -0.08 + Math.random() * 0.16,
      vy: fromTop ? 0.18 + Math.random() * 0.12 : edge === 3 ? -(0.18 + Math.random() * 0.12) : -0.05 + Math.random() * 0.1
    };
  }

  function seedGlyphs() {
    ambientGlyphs = [];
    tokenGlyphs = [];
    codeGlyphs = [];
    connections = [];
    const ambientCount = Math.max(42, Math.floor((width * height) / 18000));
    const tokenCount = Math.max(12, Math.floor((width * height) / 65000));
    const codeCount = isMobile ? 0 : Math.max(5, Math.floor((width * height) / 150000));
    for (let i = 0; i < ambientCount; i += 1) ambientGlyphs.push(makeAmbient(true));
    for (let i = 0; i < tokenCount; i += 1) tokenGlyphs.push(makeToken(true));
    for (let i = 0; i < codeCount; i += 1) codeGlyphs.push(makeCode(true));
  }

  function triggerFlash(now) {
    if (now < nextFlashAt || !tokenGlyphs.length) return;
    tokenGlyphs[Math.floor(Math.random() * tokenGlyphs.length)].flashUntil = now + 200;
    nextFlashAt = now + 3000 + Math.random() * 2000;
  }

  function triggerConnection(now) {
    if (isMobile || now < nextConnectionAt || tokenGlyphs.length < 2) return;
    const pool = ambientGlyphs.concat(tokenGlyphs);
    const a = pool[Math.floor(Math.random() * pool.length)];
    let b = pool[Math.floor(Math.random() * pool.length)];
    if (a === b) b = pool[(pool.indexOf(a) + 1) % pool.length];
    connections.push({ a, b, start: now, duration: 800 });
    nextConnectionAt = now + 2000 + Math.random() * 2000;
  }

  function drawAmbient(step) {
    ctx.font = "500 16px \"Noto Serif SC\", serif";
    for (let i = ambientGlyphs.length - 1; i >= 0; i -= 1) {
      const glyph = ambientGlyphs[i];
      glyph.y += glyph.vy * step;
      glyph.x += glyph.drift * step;
      glyph.life += step;

      if (glyph.y < -30 || glyph.x < -60 || glyph.x > width + 60) {
        ambientGlyphs[i] = makeAmbient(false);
        continue;
      }

      let alpha = glyph.alpha;
      if (glyph.life < 60) alpha *= glyph.life / 60;
      if (glyph.y < 60) alpha *= Math.max(0, glyph.y / 60);

      ctx.font = `500 ${glyph.size}px "Noto Serif SC", serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.fillText(glyph.text, glyph.x, glyph.y);
    }
  }

  function drawTokens(step, now) {
    for (let i = tokenGlyphs.length - 1; i >= 0; i -= 1) {
      const glyph = tokenGlyphs[i];
      glyph.y += glyph.vy * step;
      glyph.x += glyph.drift * step;
      glyph.life += step;

      if (glyph.y < -40 || glyph.x < -90 || glyph.x > width + 90) {
        tokenGlyphs[i] = makeToken(false);
        continue;
      }

      let alpha = now < glyph.flashUntil ? 0.8 : glyph.alpha;
      if (glyph.life < 50) alpha *= glyph.life / 50;
      if (glyph.y < 70) alpha *= Math.max(0, glyph.y / 70);

      ctx.font = `500 ${glyph.size}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.fillStyle = hexToRgba(glyph.color, alpha.toFixed(3));
      if (now < glyph.flashUntil) {
        ctx.shadowColor = hexToRgba(glyph.color, 0.55);
        ctx.shadowBlur = 16;
      }
      ctx.fillText(glyph.text, glyph.x, glyph.y);
      ctx.shadowBlur = 0;
    }
  }

  function drawCode(step) {
    if (isMobile) return;
    ctx.font = "400 14px \"JetBrains Mono\", ui-monospace, monospace";
    ctx.fillStyle = hexToRgba(green, 0.5);
    for (let i = codeGlyphs.length - 1; i >= 0; i -= 1) {
      const glyph = codeGlyphs[i];
      glyph.x += glyph.vx * step;
      glyph.y += glyph.vy * step;
      const textWidth = ctx.measureText(glyph.text).width;

      if (glyph.x < -textWidth - 80 || glyph.x > width + 220 || glyph.y < -80 || glyph.y > height + 80) {
        codeGlyphs[i] = makeCode(false);
        continue;
      }

      ctx.fillText(glyph.text, glyph.x, glyph.y);
    }
  }

  function drawConnections(now) {
    if (isMobile) return;
    for (let i = connections.length - 1; i >= 0; i -= 1) {
      const connection = connections[i];
      const age = now - connection.start;
      if (age >= connection.duration) {
        connections.splice(i, 1);
        continue;
      }
      const alpha = 0.3 * (1 - age / connection.duration);
      ctx.beginPath();
      ctx.moveTo(connection.a.x, connection.a.y);
      ctx.lineTo(connection.b.x, connection.b.y);
      ctx.strokeStyle = hexToRgba(green, alpha.toFixed(3));
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function draw(now) {
    const step = Math.min(2, (now - lastFrame) / 16.67 || 1);
    lastFrame = now;
    triggerFlash(now);
    triggerConnection(now);
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = "alphabetic";
    drawAmbient(step);
    drawConnections(now);
    drawTokens(step, now);
    drawCode(step);
    requestAnimationFrame(draw);
  }

  sizeCanvas();
  seedGlyphs();
  requestAnimationFrame(draw);
  window.addEventListener("resize", () => {
    sizeCanvas();
    seedGlyphs();
    lastFrame = performance.now();
  }, { passive: true });
})();
