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

  const tokens = [
    "文", "学", "AI", "远", "方", "华", "语", "言", "开", "花", "诗", "人", "思", "考", "读", "写", "讲",
    "<", ">", "/", "{", "}", "=", "( )", "=>", "//", "&&", "||", "*", "#",
    "AI", "NLP", "LLM", "learn", "model", "语言", "智能", "启蒙", "生成", "token", "tensor", "集团", "渊博", "坦荡", "快乐"
  ];

  const root = getComputedStyle(document.documentElement);
  const colorVars = ["--bf-red", "--bf-orange", "--bf-green", "--bf-blue", "--bf-navy"];
  const colors = colorVars.map((name) => root.getPropertyValue(name).trim());
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let glyphs = [];

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
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeGlyph(initial) {
    const text = tokens[Math.floor(Math.random() * tokens.length)];
    const isCjk = /[\u4e00-\u9fff]/.test(text);
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 40,
      vy: -(0.18 + Math.random() * 0.35),
      text,
      size: isCjk ? 16 + Math.random() * 22 : 13 + Math.random() * 16,
      isCjk,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.07 + Math.random() * 0.05,
      life: 0
    };
  }

  function seedGlyphs() {
    glyphs = [];
    const count = Math.max(36, Math.floor((width * height) / 22000));
    for (let i = 0; i < count; i += 1) glyphs.push(makeGlyph(true));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = glyphs.length - 1; i >= 0; i -= 1) {
      const glyph = glyphs[i];
      glyph.y += glyph.vy;
      glyph.life += 1;

      if (glyph.y < -30) {
        glyphs[i] = makeGlyph(false);
        continue;
      }

      let alpha = glyph.alpha;
      if (glyph.life < 60) alpha *= glyph.life / 60;
      if (glyph.y < 60) alpha *= Math.max(0, glyph.y / 60);

      ctx.font = `${glyph.isCjk ? "500" : "400"} ${glyph.size}px ${glyph.isCjk ? "\"Noto Serif SC\", serif" : "\"JetBrains Mono\", ui-monospace, monospace"}`;
      ctx.fillStyle = hexToRgba(glyph.color, alpha.toFixed(3));
      ctx.fillText(glyph.text, glyph.x, glyph.y);
    }
    requestAnimationFrame(draw);
  }

  sizeCanvas();
  seedGlyphs();
  draw();
  window.addEventListener("resize", () => {
    sizeCanvas();
    seedGlyphs();
  }, { passive: true });
})();
