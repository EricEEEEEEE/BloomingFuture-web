# Blooming Future Web — Project Doc (L2)

> 这是 `BloomingFuture-web` 项目的"宪法"。任何在本仓库工作的 AI agent（Codex / Claude Code / Claude in Chrome）必须先完整读这份文档再动手。
>
> 这份文档是 L2（项目记忆）。它**不**重复 L1（全局 SOUL）里的通用工程规范、编程风格、AI 协作习惯——那些在全局位置。L2 只回答："这个项目是什么、长什么样、什么不能动。"

---

## 1. Project Identity

| 字段 | 值 |
|---|---|
| 项目名 | `BloomingFuture-web` |
| 仓库 | `https://github.com/EricEEEEEEE/BloomingFuture-web` (public) |
| 默认分支 | `main` |
| 域名 | `bloomingfuture.io`（Cloudflare 托管，状态 Active） |
| 业主 | 花开远方教育集团 / Blooming Future Education Group |
| 阶段 | 0 → 1，首版上线 |
| 形态 | 静态单页站点（one-pager） |

**这个站点是什么：**
花开远方教育集团的全球官方主站。一家 1999 年创立于天津的中文人文教育机构，2023 年在新加坡设立运营基地。当前定位：以新加坡为前沿，把 26 年的中文文学教育与 AI 技术深度结合，面向东南亚和全球华人家庭。

**这个站点不是什么：**
- 不是招生表单系统、不是会员中心、不是后台
- 不是博客、不是 CMS 驱动的内容站
- 不是 Web App，没有用户登录、没有数据库
- 没有支付、没有交易

**首版目标：**
- 把 Claude Design 做好的视觉版（参见 `docs/source-design.html`）忠实搬到 bloomingfuture.io
- 中国大陆 + 新加坡 + 全球都能稳定访问
- LCP < 2.5s on 4G
- 文案后续由 Eric 或 Codex 在仓库内修改 markdown 同步到 HTML

---

## 2. Stack & Constraints

**技术栈：** 纯 HTML + CSS + JavaScript。无 build step，无框架，无 Node 依赖。

**理由：** 业主决策。所有代码由 AI 编写，目标是长期可读、易归档、文件结构透明、AI 容易解析整份代码。

### 禁用清单（HARD）

- ❌ build tool（Webpack / Vite / Parcel / esbuild / Rollup）
- ❌ framework runtime（React / Vue / Svelte / Astro / Next.js）
- ❌ CSS preprocessor（Sass / Less / PostCSS）——用原生 CSS Variables
- ❌ `package.json` / `node_modules` / `npm` / `pnpm` / `yarn`
- ❌ 任何外部 CDN（字体、JS、icon、image）
- ❌ 任何分析/追踪 SDK（GA、Meta Pixel、Hotjar、Sentry...）

### 允许清单

- ✅ Vanilla JS（ES2020+，现代浏览器原生支持的语法）
- ✅ Web standards：Canvas、IntersectionObserver、CSS Variables、ResizeObserver
- ✅ Self-hosted `.woff2` 字体
- ✅ Inline SVG 或 `/assets/img/` 下的本地 SVG / PNG / JPG
- ✅ Cloudflare Pages 的 `_headers` 和 `_redirects` 配置文件

### 性能底线

| 指标 | 目标 |
|---|---|
| 首屏 HTML（不含字体） | < 80 KB |
| 字体子集总和 | < 250 KB |
| LCP（4G） | < 2.5s |
| CLS | < 0.05 |
| 主线程阻塞 | 不允许同步加载非首屏 JS |

### 浏览器支持

Chrome / Safari / Firefox / Edge 近两年版本；iOS Safari 16+；Chrome Android 110+。
不支持 IE11。

### i18n 策略

中英**并列**展示，不做语言切换器。中文段紧跟英文译文。
HTML `lang="zh-Hans"`。SEO 通过 `<meta>` 双语描述兼顾。

---

## 3. Information Architecture

**单页 + 锚点滚动。** 一个 `index.html`，6 个 section 用 `id` 定位，nav 平滑滚动跳转。

| Section | id | Nav 名 | 内容职责 |
|---|---|---|---|
| Hero | `#top` | — | 品牌定位 + 26 年历史定调 + 粒子动画 |
| About | `#about` | 集团 / About | 集团简介、商务部加盟资质、AI 教育转型 |
| AI Education | `#courses` | AI 课程 / AI | 新加坡 AI 教育方向 + 4 个产品维度 |
| Singapore | `#singapore` | 新加坡 / Singapore | 新加坡运营总部定位 |
| Philosophy | `#philosophy` | 理念 / Belief | 创始人语 + 教育哲学 |
| Contact | `#contact` | 联系 / Contact | 新加坡 + 天津 + 部门邮箱 |

顶部 CTA「报名 2026 / Enrol」首版**只锚点跳转到 #contact**，不接表单。

### 预留路由（首版不实现，登记保留）

未来若 footer 4 个业务板块要拆独立页：
- `/campuses` — 教学校区
- `/travel` — 文化游学
- `/creative` — 文创工作室
- `/tech` — 网络科技

加任一子页前，先回 L2 第 3 节登记，再动代码。

---

## 4. Design Tokens

**全部用 CSS Variables 定义在 `:root`。** 修改样式时只能引用 token 名，禁止硬编码 hex 色值/字体名。

```css
:root {
  /* ===== Backgrounds ===== */
  --bg:      #f7f3eb;  /* 主背景，米色 */
  --bg-elev: #efe8d6;  /* 抬升层 */
  --bg-card: #ffffff;  /* 卡片白 */
  --bg-deep: #0a1428;  /* 深底（hero 反转区） */

  /* ===== Inks - 文字层级 ===== */
  --ink:   #0a1428;
  --ink-2: #3a4860;
  --ink-3: #7a8499;
  --ink-4: #b6bccb;

  /* ===== Lines ===== */
  --line:        rgba(0,64,137,.10);
  --line-strong: rgba(0,64,137,.20);

  /* ===== Brand 5 colors（花瓣 logo） ===== */
  --bf-red:    #c30d23;
  --bf-orange: #ef7a00;
  --bf-green:  #8fc31f;
  --bf-blue:   #2ea7e0;
  --bf-navy:   #004089;

  /* ===== Typography ===== */
  --sans:     "Manrope", ui-sans-serif, system-ui, sans-serif;
  --serif:    "Cormorant Garamond", "Noto Serif SC", Georgia, serif;
  --serif-cn: "Noto Serif SC", "Cormorant Garamond", serif;
  --mono:     "JetBrains Mono", ui-monospace, Menlo, monospace;
}
```

### 字体文件（self-host）

放在 `/assets/fonts/`，全部 woff2 子集。

| 字体 | 字重 | 子集 |
|---|---|---|
| Manrope | 300 / 400 / 500 / 600 / 700 | Latin Basic + Latin Ext |
| Cormorant Garamond | 400 italic / 500 / 600 italic | Latin Basic |
| Noto Serif SC | 400 / 500 / 600 | 中文常用 6500 字 |
| JetBrains Mono | 400 / 500 | Latin Basic + symbols |

字体引入用 `@font-face` + `font-display: swap`，禁止用 `@import url(...)` 引外部 CDN。

### Spacing scale（8px 基线）

`4 / 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128` px

---

## 5. Content Source of Truth

**约定：** `/content/*.md` 是文案的 source of truth；`index.html` 是渲染产物。所有内容改动必须保留在 markdown 里可追溯。

### 文件结构

```
content/
├── hero.md
├── about.md
├── ai.md
├── singapore.md
├── philosophy.md
└── contact.md
```

每个 `.md` 文件用同一份模板：

```markdown
# Section: about
> Last sync to index.html: 2026-05-19

## CN
01 / The Group
集团简介
AI 赋能 · 华文传承

花开远方创立于 1999 年...

## EN
01 / The Group
Group Introduction
Advancing Chinese education with artificial intelligence.

Founded in 1999...
```

### `index.html` 标记约定

每个 section 用注释包围，方便 AI/Eric 精确定位：

```html
<!-- ==================== SECTION: about ==================== -->
<!-- source: content/about.md  ·  last sync: 2026-05-19 -->
<section class="about" id="about">
  ...
</section>
<!-- ================== END SECTION: about ================== -->
```

### 修改文案的流程

1. 编辑 `/content/<section>.md`
2. 把新内容同步到 `index.html` 对应注释块内（保持 HTML 结构不变）
3. 更新 `last sync` 日期
4. `git commit -m "content: update <section>"`

### v1.1 已知文案修订（首次同步时必改）

| 位置 | 原文 | 改为 |
|---|---|---|
| `about.md` | "2005 年起，花开远方开始探索 AI 技术..." | **2015** 年起 |
| `philosophy.md` | "教育变成纯**籹**的投资" | "教育变成纯**粹**的投资" |

### v1.5 资产待补

- `cert-copyright.png`：far1999.com 未暴露国家版权局单独证书图，当前用 typography 占位。
- `cert-mct.png`：far1999.com 未暴露文旅部审批单独证书图，当前用 typography 占位。

### 已核对的事实（不要再质疑）

- 「27 万学生」= 全国累计在读学生数 ✓
- 「1999 创立 / 天津总部 / 700+ 城市 / 31 省」✓
- 「2023 设立新加坡运营基地」✓
- 「商务部授予的品牌加盟总部」✓
- 联系信息（地址 / 电话 / 邮箱 / 工时）以仓库当前版本为准 ✓

---

## 6. Component Inventory

按视觉出现顺序：

| Component | 用途 | 关键行为 |
|---|---|---|
| `Nav` | 顶部固定导航 | 滚动 40px 后切 `.scrolled` 状态 |
| `HeroParticles` | Canvas 粒子动画 | 5 色品牌色 token 飘升，CJK + 代码 token 混合 |
| `HeroTitle` | 巨型品牌字 | 中文 serif 大字 + 英文 italic serif 副标 |
| `SectionLabel` | "01 / The Group" | 数字编号 + 中英对照短句 |
| `BiTitle` | 中英并列大标题 | 中文行 + 英文行紧贴 |
| `StatBig` | 大数字 + count-up | `data-count` 属性触发动画 |
| `MissionBlock` | 强调段落 | 关键短语着色（red / navy） |
| `ProductCard` | AI section 4 个产品卡 | 编号 + 中英标题 + 描述 + 角标 |
| `ContactCard` | 三栏联系卡 | 地址、电话、邮箱、工时 |
| `Footer` | 底部 3 列 | Group / Divisions / Contact |

### Reveal 动画

任何 DOM 块加 `.reveal` 类即可在视口出现时淡入。基于 `IntersectionObserver`。

---

## 7. Interaction Spec

| 行为 | 实现 |
|---|---|
| Nav 滚动状态 | `window.scrollY > 40` 时切 `.scrolled` class |
| 锚点平滑滚动 | `scrollIntoView({behavior:'smooth', block:'start'})` |
| Hero 粒子动画 | Canvas 2D；token 词库 + 5 色；`requestAnimationFrame`；DPR ≤ 2 |
| Reveal 淡入 | `IntersectionObserver`，threshold 0.12，rootMargin `0px 0px -60px 0px` |
| Number count-up | `IntersectionObserver`，threshold 0.5，1400ms ease-cubic-out |
| 移动端汉堡菜单 | 切换 `.nav-links` display；点击外部关闭（可选优化） |
| 报名 CTA | 锚点跳到 `#contact`，**首版不接表单** |

### 粒子动画 token 词库（hero）

汉字：`文 学 AI 远 方 华 语 言 开 花 诗 人 文 思 考 读 写 讲`
术语：`AI NLP LLM learn model 语言 智能 启蒙 生成 token tensor 集团 渊博 坦荡 快乐`
符号：`< > / { } = ( ) => // && || * #`

resize 时重新 seed 粒子。性能要求：60fps 桌面 / 30fps 移动端。

---

## 8. Red Lines（绝对不能改）

1. ❌ **不改品牌 5 色 hex 值**（red `#c30d23` / orange `#ef7a00` / green `#8fc31f` / blue `#2ea7e0` / navy `#004089`）
2. ❌ **不替换字体**（Manrope / Cormorant Garamond / Noto Serif SC / JetBrains Mono 是品牌识别的一部分）
3. ❌ **不拆中英双语**（不允许加语言切换器把中英分开）
4. ❌ **不引入任何分析/追踪/广告 SDK**
5. ❌ **不引入框架 / build tool / npm**
6. ❌ **不修改联系信息**（地址、电话、邮箱、营业时间）——除非 Eric 在 chat 里明确指示修改哪一项
7. ❌ **不引入外部 CDN**（字体、icon、JS、image 全部 self-host）
8. ❌ **不部署到 main 之外的环境**（无 staging，main 即生产）
9. ❌ **不 force push**（`git push --force` / `--force-with-lease` 都禁止）
10. ❌ **不删 `/content` 目录下的文件**

例外协议：以上任一项若需突破，Eric 必须在 chat 里明确说"打破 Red Line N"，agent 才能执行；并在 commit message 里注明 `[red-line-override: N]`。

---

## 9. Deploy & Ops

### 仓库 ↔ 站点链路

```
GitHub repo (main 分支 push)
  │
  ▼
Cloudflare Pages 自动构建（< 10 秒）
  │
  ▼
bloomingfuture.io (Cloudflare 边缘网络)
```

### Cloudflare Pages 项目配置

| 字段 | 值 |
|---|---|
| Framework preset | None |
| Build command | （空） |
| Build output directory | `/` |
| Root directory | `/` |
| Production branch | `main` |

### Custom domains

- `bloomingfuture.io`
- `www.bloomingfuture.io` → 301 到 `bloomingfuture.io`

### `_headers` 配置（仓库根放此文件）

```
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/assets/css/*
  Cache-Control: public, max-age=86400

/assets/js/*
  Cache-Control: public, max-age=86400

/*
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
```

### 首次推送

```bash
cd ~/projects/bloomingfuture-web
git init
git remote add origin https://github.com/EricEEEEEEE/BloomingFuture-web.git
git add .
git commit -m "Initial commit: project scaffold + v1 content"
git branch -M main
git push -u origin main
```

之后每次 commit 到 main 自动部署。

---

## 10. Working Protocol

### Codex / Claude Code 进项目第一件事

```bash
cat CLAUDE.md
ls content/
ls assets/
```

把这份文档读完，再动手。

### 修改流程

| 改什么 | 怎么改 |
|---|---|
| 文案 | 改 `/content/<section>.md` → 同步到 `index.html` 注释块 → commit |
| 样式 | 必须用 CSS variable，禁止硬编码 hex → commit |
| 加新 section | 先在 L2 第 3 节登记 → 再写代码 → commit |
| 加新交互 | 先在 L2 第 7 节登记 → 再写代码 → commit |
| 加新依赖（字体/图片） | 文件放进 `/assets/` 对应子目录 → commit |

### Commit 规范

| 前缀 | 用于 |
|---|---|
| `content:` | 文案改动 |
| `style:` | 样式改动 |
| `feat:` | 新 section / 新组件 / 新交互 |
| `fix:` | bug 修复 |
| `docs:` | CLAUDE.md / README.md 改动 |
| `chore:` | 资源更新（字体文件、图片） |
| `ops:` | 部署/配置改动（`_headers`、Cloudflare 设置说明） |

### 项目目录结构（首版应长这样）

```
BloomingFuture-web/
├── CLAUDE.md                    # 本文件（L2）
├── AGENTS.md                    # symlink → CLAUDE.md（用户在本地 ln -s 建立）
├── README.md                    # 公开仓库门面
├── .gitignore
├── _headers                     # Cloudflare Pages 头部配置
├── index.html                   # 单页主文件
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   └── main.js
│   ├── fonts/                   # self-hosted woff2
│   │   ├── manrope-*.woff2
│   │   ├── cormorant-*.woff2
│   │   ├── noto-serif-sc-*.woff2
│   │   └── jetbrains-mono-*.woff2
│   └── img/                     # logo / 装饰用 SVG
├── content/                     # 文案 source of truth
│   ├── hero.md
│   ├── about.md
│   ├── ai.md
│   ├── singapore.md
│   ├── philosophy.md
│   └── contact.md
└── docs/
    └── source-design.html       # Claude Design 导出的视觉参考版（archived）
```

---

*Last updated: 2026-05-19*
*Owner: Eric (鄂玮强)*
