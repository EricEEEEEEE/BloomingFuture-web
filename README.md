# Blooming Future — bloomingfuture.io

The official global site of Blooming Future Education Group (花开远方).

A Chinese humanities education group, founded in Tianjin in 1999. Singapore office established 2023. 26 years of literature education, now combined with AI.

## About this repository

This is the source for **bloomingfuture.io** — a static one-page site, hand-crafted in plain HTML, CSS, and JavaScript. No build step. No framework. No npm.

- **Live site:** https://bloomingfuture.io
- **Hosting:** Cloudflare Pages (auto-deployed from `main`)
- **License:** All rights reserved. Code is open for reference; content and brand assets are not for reuse.

## v2.1 Motion Upgrade

v2.1 extends the v2.0 visual system into a site-wide AI motion language. Every visible text block receives viewport choreography; short technical labels decode in place; real photos, textbook covers, certificates, logos, and the existing mascot use five-color shutters, edge scans, brief glitch, depth tilt, and bounded same-image trails. Each content section also has its own motion signature instead of sharing one generic reveal.

The runtime remains local and dependency-free:

- `assets/css/motion.css` — global text, image, cursor, and fallback states
- `assets/css/motion-scenes.css` — section-specific choreography
- `assets/js/motion.js` — one shared scheduler for observers, pointer effects, and animation lifecycle

Heavy pointer and image effects are disabled on mobile, page-hidden animation pauses, and `prefers-reduced-motion` exposes the final static layout without split text or looping motion. No image was generated or replaced for this upgrade. See the [v2.1 motion report](./docs/v2.1-motion-report.md) for the four-viewport acceptance record and exact budgets.

## v2.0 Visual Upgrade

v2.0 turns the homepage into a responsive AI knowledge field while keeping the institution's real-world evidence in view. It adds a four-layer Canvas hero, an explainable five-step learning loop, real textbook and Tianjin campus imagery, denser bilingual information cards, and motion/accessibility fallbacks across desktop, tablet, and mobile.

All photography, textbook covers, and certificate crops are existing project assets sourced from the official far1999.com site; no generated imagery is used. See the [v2.0 release report](./docs/v2-release-report.md) for browser evidence and the asset ledger.

Run a local preview from the repository root:

```bash
python3 -m http.server 8016
```

Then open `http://127.0.0.1:8016`. No build step or dependency installation is required.

Operations: [使用说明](./使用说明.md) · [维护手册](./维护手册.md)

## For AI agents working on this repo

Read [`CLAUDE.md`](./CLAUDE.md) first. It is the project's constitution and explains what can and cannot be changed.

## Contact

For business inquiries: sgfar1999@outlook.com

---

© 1999 – 2026 Blooming Future Education Group / 花开远方教育集团
