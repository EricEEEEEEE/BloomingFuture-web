# BloomingFuture-web v2.0 · 施工计划（待批准）

## 要做成什么

把现有页面升级成“真实华文教育证据 + AI 知识网络”的官网。用户第一眼先认出花开远方，第二眼感知 AI 能力，再往下能用天津现场、教材、数字和资质验证机构积累。

## 为什么这样做

1. **沿用纯网页技术。** 现站打开快、全球可访问，也最符合长期归档和 AI 维护要求。
2. **保留原生 Canvas。** 当前已经有粒子基础，直接优化比安装粒子库更小、更稳定。
3. **真实照片与程序视觉分工。** 照片证明机构真实存在，Canvas 表达 AI 未来，互不冒充。
4. **仍保留六个导航锚点。** 用户不需要重新学习网站，Cloudflare 部署链路也不变化。
5. **先写考题再实现。** 所有红线、图片、联系方式、性能和移动端要求都能自动或人工复核。

## 施工阶段

### 第一阶段：锁定验收

先写不依赖 npm 的站点检查脚本，让当前页面在新增需求上明确失败。考题覆盖本地素材、禁用依赖、联系信息、Hero 生命周期、响应式结构和内容同步。

### 第二阶段：首屏 AI 场景

重写 `heroMatrix` 的 update/draw 生命周期，加入内容避让区、真实限帧、离屏暂停、pointer 关系和静态 reduced-motion 画面；同时收紧首屏文字层级。

### 第三阶段：真实证据进入叙事

在 About 放入 1999-Now 时间轴、天津楼宇、课堂与教学现场；把证书改成低清友好的证据窗；在 AI section 放入五组真实教材。

### 第四阶段：AI 学习过程与课程系统

用 HTML/CSS/少量 JS 做 AI Learning Loop，重排四项能力，精修九个十分钟的桌面和移动版。

### 第五阶段：后半页权重重排

Singapore 压缩为横带；Philosophy 以小 A banner 收尾；Contact 改为天津主、新加坡辅、Departments 全宽行。

### 第六阶段：完整验证与发布

执行自动检查，逐一检查 1440/1024/768/390 四个视口、图片加载、Canvas 像素、console、外部请求、动画暂停和 reduced motion。通过后再请求 `git push main` 许可。

## 验收方法

- 每项任务先运行 `.loopwork/hooks/verify.sh`。
- 浏览器检查必须有四档截图和尺寸数据，不只凭肉眼看单一桌面。
- 对 Hero 采样 RAF 与 Canvas 尺寸；对页面检查 CLS、横向溢出和图片 natural size。
- 最终逐条对照 `spec.md` F1-F9，预期 9 组、实际 9 组才算完成。

## 时间

传统设计与前端团队约 4-6 个工作日；AI 协作约 4-6 小时。第 1 个可点击里程碑预计在 T02 完成后，约 75 分钟。

<details>
<summary>技术附录</summary>

- 生产技术：HTML5、CSS Variables、Canvas 2D、ES2020、IntersectionObserver、ResizeObserver、Performance API。
- 测试技术：Python 3 标准库、shell、Codex in-app Browser；不创建 `package.json`。
- 主要文件：`index.html`、`assets/css/main.css`、`assets/js/main.js`、`content/*.md`。
- 资产：只读取 `assets/img/` 中现有真实素材。
- 发布：GitHub `main` → Cloudflare Pages；无 build command。

</details>
