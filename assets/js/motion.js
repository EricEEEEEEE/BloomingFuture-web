(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  root.classList.add("motion-ready");

  const COPY_SELECTOR = [
    "main h1", "main h2", "main h3", "main h4", "main p",
    "main figcaption", "main dt", "main dd", "main strong",
    ".history-point > span", ".credential-copy", ".bi-label",
    ".loop-step", ".sg-tags span", ".dept-tags span",
    "nav a", "nav button", "footer h4", "footer p", "footer a"
  ].join(",");
  const GLYPH_SELECTOR = [
    ".hero-tag", ".hero-meta", ".history-year", ".evidence-kicker",
    ".credentials-label", ".loop-kicker", ".curriculum-kicker",
    ".ai-tag", ".sg-year", ".contact-card .tag", ".status"
  ].join(",");
  const decoys = "AI01<>/{}文华智未来";
  const colors = ["--bf-red", "--bf-orange", "--bf-green", "--bf-blue", "--bf-navy"];
  const MAX_IMAGE_GHOSTS = 6;
  const GHOST_LIFETIME = 600;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add(entry.target.dataset.motionSection === "true" ? "motion-active" : "is-seen");
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: "0px 0px -5% 0px" });

  function watchCopy(element, index) {
    if (element.classList.contains("motion-copy")) return;
    element.classList.add("motion-copy");
    element.style.setProperty("--motion-order", String(index % 8));
    observer.observe(element);
  }

  document.querySelectorAll(COPY_SELECTOR).forEach(watchCopy);

  document.querySelectorAll(GLYPH_SELECTOR).forEach((element, index) => {
    if (element.children.length || !element.textContent.trim()) return;
    const text = element.textContent;
    element.textContent = "";
    const accessible = document.createElement("span");
    accessible.className = "motion-sr";
    accessible.textContent = text.trim();
    accessible.setAttribute("aria-label", text.trim());
    const glyphRun = document.createElement("span");
    glyphRun.className = "motion-glyph-run";
    glyphRun.setAttribute("aria-hidden", "true");
    Array.from(text).forEach((character, glyphIndex) => {
      const glyph = document.createElement("span");
      glyph.className = "motion-glyph";
      glyph.textContent = character === " " ? "\u00a0" : character;
      glyph.dataset.decoy = decoys[(glyphIndex * 3 + index) % decoys.length];
      glyph.style.setProperty("--glyph-index", String(glyphIndex));
      glyph.style.setProperty("--glyph-color", `var(${colors[glyphIndex % colors.length]})`);
      glyph.setAttribute("aria-hidden", "true");
      glyphRun.appendChild(glyph);
    });
    element.append(accessible, glyphRun);
    watchCopy(element, index);
  });

  document.querySelectorAll("main section").forEach((section) => {
    section.dataset.motionSection = "true";
    observer.observe(section);
  });

  const footer = document.querySelector("footer");
  if (footer) {
    footer.dataset.motionSection = "true";
    observer.observe(footer);
  }

  document.querySelectorAll("img").forEach((image, index) => {
    const shell = document.createElement("span");
    shell.className = "motion-image-shell";
    shell.style.setProperty("--image-order", String(index % 5));
    image.before(shell);
    shell.appendChild(image);
    image.classList.add("motion-image");
    observer.observe(shell);
  });

  document.querySelectorAll(".product-card, .ritual-card, .contact-card, .stat, .credential, .textbook-item").forEach((surface) => {
    surface.classList.add("motion-surface");
  });

  const quote = document.querySelector(".quote-cn");
  if (quote) {
    quote.setAttribute("aria-label", quote.textContent.trim());
    const walker = document.createTreeWalker(quote, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let wordIndex = 0;
    nodes.forEach((node) => {
      if (!node.textContent.trim()) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((word) => {
        if (!word.trim()) {
          fragment.appendChild(document.createTextNode(word));
          return;
        }
        const span = document.createElement("span");
        span.className = "motion-word";
        span.textContent = word;
        span.style.setProperty("--word-index", String(wordIndex++));
        span.setAttribute("aria-hidden", "true");
        fragment.appendChild(span);
      });
      node.replaceWith(fragment);
    });
  }

  const loopTrack = document.querySelector(".loop-track");
  if (loopTrack) {
    const signal = document.createElement("span");
    signal.className = "motion-signal";
    signal.setAttribute("aria-hidden", "true");
    loopTrack.appendChild(signal);
  }

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth > 820;
  if (!finePointer) return;

  root.classList.add("motion-pointer");
  const canvas = document.createElement("canvas");
  canvas.className = "motion-cursor-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const cursor = document.createElement("span");
  cursor.className = "motion-cursor";
  cursor.setAttribute("aria-hidden", "true");
  document.body.append(canvas, cursor);

  const context = canvas.getContext("2d");
  const brandColors = colors.map((name) => getComputedStyle(root).getPropertyValue(name).trim());
  let dpr = 1;
  let frame = 0;
  let pointerX = -100;
  let pointerY = -100;
  let points = [];
  let activeMagnet = null;
  let activeImage = null;
  let activeSurface = null;
  let ghostIndex = 0;
  let lastGhostX = -100;
  let lastGhostY = -100;
  let lastGhostTime = 0;
  const ghosts = Array.from({ length: MAX_IMAGE_GHOSTS }, (_, index) => {
    const ghost = document.createElement("img");
    ghost.className = "motion-image-ghost";
    ghost.alt = "";
    ghost.decoding = "async";
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.setProperty("--ghost-color", `var(${colors[index % colors.length]})`);
    document.body.appendChild(ghost);
    return ghost;
  });

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }

  function render(now) {
    frame = 0;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    points = points.filter((point) => now - point.time < 520);
    points.forEach((point, index) => {
      if (!index) return;
      const previous = points[index - 1];
      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(point.x, point.y);
      context.strokeStyle = brandColors[index % brandColors.length];
      context.globalAlpha = Math.max(0, 1 - (now - point.time) / 520) * .72;
      context.lineWidth = Math.max(.5, 2.4 - index * .04);
      context.stroke();
    });
    context.globalAlpha = 1;
    cursor.style.transform = `translate3d(${pointerX - 12}px, ${pointerY - 12}px, 0) rotate(${now / 18}deg)`;
    if (points.length) schedule();
  }

  function resetMagnet() {
    if (!activeMagnet) return;
    activeMagnet.style.setProperty("--magnet-x", "0px");
    activeMagnet.style.setProperty("--magnet-y", "0px");
    activeMagnet = null;
  }

  function resetImage() {
    if (!activeImage) return;
    const shell = activeImage.parentElement;
    shell.classList.remove("is-motion-hover");
    shell.style.setProperty("--tilt-x", "0deg");
    shell.style.setProperty("--tilt-y", "0deg");
    activeImage = null;
  }

  function resetSurface() {
    if (!activeSurface) return;
    activeSurface.classList.remove("is-motion-hover");
    activeSurface.style.setProperty("--surface-x", "0deg");
    activeSurface.style.setProperty("--surface-y", "0deg");
    activeSurface = null;
  }

  function emitGhost(image, x, y, now) {
    if (!image.complete || !image.naturalWidth) return;
    const ghost = ghosts[ghostIndex++ % MAX_IMAGE_GHOSTS];
    const rect = image.getBoundingClientRect();
    const width = Math.min(132, Math.max(72, rect.width * .24));
    ghost.src = image.currentSrc || image.src;
    ghost.style.width = `${width}px`;
    ghost.style.height = `${width / Math.max(.7, rect.width / Math.max(rect.height, 1))}px`;
    ghost.style.left = `${x - width / 2}px`;
    ghost.style.top = `${y - 32}px`;
    ghost.classList.remove("is-active");
    void ghost.offsetWidth;
    ghost.classList.add("is-active");
    window.setTimeout(() => ghost.classList.remove("is-active"), GHOST_LIFETIME);
    lastGhostX = x;
    lastGhostY = y;
    lastGhostTime = now;
  }

  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.classList.add("is-visible");
    points.push({ x: pointerX, y: pointerY, time: performance.now() });
    if (points.length > 28) points.shift();

    const magnet = event.target.closest("a, button, .sg-tags span, .dept-tags span");
    if (magnet !== activeMagnet) {
      resetMagnet();
      activeMagnet = magnet;
      if (activeMagnet) activeMagnet.classList.add("motion-magnet");
    }
    cursor.classList.toggle("is-interactive", Boolean(magnet));
    if (magnet) {
      const rect = magnet.getBoundingClientRect();
      magnet.style.setProperty("--magnet-x", `${(pointerX - rect.left - rect.width / 2) * .14}px`);
      magnet.style.setProperty("--magnet-y", `${(pointerY - rect.top - rect.height / 2) * .18}px`);
    }

    const image = event.target.closest(".motion-image");
    if (image !== activeImage) {
      resetImage();
      activeImage = image;
      if (image) {
        image.parentElement.classList.add("is-motion-hover");
        image.classList.remove("is-glitch");
        void image.offsetWidth;
        image.classList.add("is-glitch");
        window.setTimeout(() => image.classList.remove("is-glitch"), 440);
      }
    }
    if (image) {
      const rect = image.getBoundingClientRect();
      const nx = (pointerX - rect.left) / Math.max(rect.width, 1) - .5;
      const ny = (pointerY - rect.top) / Math.max(rect.height, 1) - .5;
      image.parentElement.style.setProperty("--tilt-x", `${ny * -7}deg`);
      image.parentElement.style.setProperty("--tilt-y", `${nx * 9}deg`);
      image.parentElement.style.setProperty("--light-x", `${(nx + .5) * 100}%`);
      const now = performance.now();
      if (now - lastGhostTime > 65 && Math.hypot(pointerX - lastGhostX, pointerY - lastGhostY) > 42) {
        emitGhost(image, pointerX, pointerY, now);
      }
    }

    const surface = event.target.closest(".motion-surface");
    if (surface !== activeSurface) {
      resetSurface();
      activeSurface = surface;
      if (surface) surface.classList.add("is-motion-hover");
    }
    if (surface) {
      const rect = surface.getBoundingClientRect();
      const sx = (pointerX - rect.left) / Math.max(rect.width, 1) - .5;
      const sy = (pointerY - rect.top) / Math.max(rect.height, 1) - .5;
      surface.style.setProperty("--surface-x", `${sy * -3.5}deg`);
      surface.style.setProperty("--surface-y", `${sx * 4.5}deg`);
      surface.style.setProperty("--surface-light", `${(sx + .5) * 100}%`);
    }
    schedule();
  }, { passive: true });

  document.addEventListener("pointerout", (event) => {
    if (event.relatedTarget) return;
    cursor.classList.remove("is-visible", "is-interactive");
    resetMagnet();
    resetImage();
    resetSurface();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      points = [];
      cursor.classList.remove("is-visible");
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else {
      schedule();
    }
  });
  window.addEventListener("resize", sizeCanvas, { passive: true });
  sizeCanvas();
}());
