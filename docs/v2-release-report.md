# Blooming Future v2.0 发布验收报告

> 验收日期：2026-07-22 · 分支：`main` · 部署目标：`https://bloomingfuture.io`

## 发布结论

- 自动化契约测试：**53/53 通过**。
- 页面保持纯 HTML、CSS、JavaScript，无 build step、框架、npm 或外部 CDN。
- 全站照片、教材、证书与吉祥物均为项目已有或从 `far1999.com` 官方页面取得的真实素材，**未使用 AI 生成图**。
- HTML 36 KB、CSS 36 KB、JavaScript 20 KB；HTML 低于 80 KB，JavaScript 未超过 20 KB 控制线。
- 联系地址保持为“天津市津南区·启迪科技园 35 号楼”，品牌五色、字体与中英并列策略均未改变。

## 浏览器验收

| 视口 | 布局结果 | 动效与交互 |
|---|---|---|
| 1440×900 | 横向溢出 0 | Hero 60fps；四层 Canvas、桌面代码层和连接层正常 |
| 1024×768 | 横向溢出 0 | Hero 60fps；导航、教材轨道和 Contact 主次正常 |
| 768×1024 | 横向溢出 0 | Hero 60fps；网格重排、图片尺寸和双语层级稳定 |
| 390×844 | 横向溢出 0 | Hero 30fps；代码层与连接层关闭；菜单 Esc、焦点归还和滚动锁正常 |

附加检查：Canvas 像素非空，DPR 不超过 2；所有可见图片 `naturalWidth > 0`；AI 中文主标题在四档均保持两条有效文字行；页脚 logo 渲染为 120×120；离屏动画暂停；`prefers-reduced-motion` 提供静态帧；**console warning/error 0**。

## 真实素材台账

2026-07-22 对官网首页、About、Courses 和旧 About 路径重新抓取并核验。旧路径 `https://www.far1999.com/web/guanyuyuanfang/` 当前返回 404；下表不对低清素材做虚假放大，也不编造已失效的直接地址。

| 本地文件 | 像素尺寸 | 官方来源与状态 |
|---|---:|---|
| `campus-1.jpg` | 404×467 | 早期 `far1999.com` 官网抓取的教学活动照；官网当前未再暴露直接 URL |
| `campus-2.jpg` | 480×276 | 天津课堂实景；当前原图 `https://www.far1999.com/skin/images/home-tx.png` |
| `campus-3.jpg` | 480×276 | 教学现场；当前原图 `https://www.far1999.com/skin/images/home-hk.png` |
| `textbook-1.jpg` | 643×510 | `https://www.far1999.com/courses.html` 早期官网抓取；官网当前未再暴露直接 URL |
| `textbook-2.jpg` | 631×510 | `https://www.far1999.com/courses.html` 早期官网抓取；官网当前未再暴露直接 URL |
| `textbook-3.jpg` | 584×510 | `https://www.far1999.com/courses.html` 早期官网抓取；官网当前未再暴露直接 URL |
| `textbook-4.jpg` | 608×510 | `https://www.far1999.com/courses.html` 早期官网抓取；官网当前未再暴露直接 URL |
| `textbook-5.jpg` | 590×366 | 教材组合图；当前原图 `https://www.far1999.com/skin/images/courses_04-r.jpg` |
| `cert-mofcom.png` | 308×251 | 商务部特许经营备案证明低清裁图；官方合成图 `https://www.far1999.com/skin/images/about_23.jpg` |
| `cert-iso9001.png` | 308×437 | ISO 9001 证书低清裁图；官方合成图 `https://www.far1999.com/skin/images/about_23.jpg` |
| `mascot-elephant.png` | 450×400 | 用户确认沿用项目已有“小 A”版；官网当前未再暴露直接 URL |

素材页：`https://www.far1999.com/`、`https://www.far1999.com/about.html`、`https://www.far1999.com/courses.html`。原 logo 继续沿用；本轮官网没有可核验的高清独立五色花瓣 logo，因此没有替换或生成替代品。

以上 12 个当前使用素材的 SHA-256、像素尺寸与来源状态同时固化在 `assets/img/provenance.json`；契约测试会逐文件计算 hash，同名替换也会被拦截。

## v2.0 验收范围

- Hero：ambient 汉字、品牌色 tokens、桌面 code snippets、短时粒子连线；标题安全区、pointer 响应、离屏暂停和移动降级均生效。
- About：四节点历史、天津实景证据、四项数据与低清证书窗口，证书保留原始比例并明确低清属性。
- AI Education：五步学习闭环、五组真实教材、四项能力与九个十分钟 3×3 信息卡。
- Singapore / Philosophy / Contact：新加坡弱化为无图短横带；小 A 移至理念底部；天津总部成为唯一实景主栏。
- Accessibility：键盘焦点可见，移动菜单支持 Esc 与焦点归还，reduced motion 关闭非必要运动。

## 部署与回滚

发布流程：在 `main` 完成最终验证后执行 `git push origin main`，由 **Cloudflare Pages** 自动部署到生产域名。部署后检查首页资源版本 `v=2.0.0`、Hero Canvas、图片加载和浏览器控制台。

回滚流程：定位本次发布 commit，执行 `git revert <release-commit>` 生成可审计的反向提交，再执行 `git push origin main` 触发 Cloudflare Pages 回滚；禁止 force push。
