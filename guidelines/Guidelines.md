# 洞点 · 项目设计指引

本项目不使用任何外部 UI Kit。开始任何 UI 工作前，按顺序读：

1. `docs/design/HANDOFF.md`：目标、硬约束、进度、代码地图。
2. `docs/design/README.md`：规范入口，按需阅读其链接的各篇。
3. `docs/design/12-review.md`：当前已知问题、已做的统一决定与本阶段计划。

## 硬约束（摘要，完整版见 HANDOFF §2）
- 样式只来自 `src/styles/global.css` 的 `--s-*`，经 `src/index.css` 的 `@theme inline` 映射为 Tailwind 类。禁止内联 style、裸 hex、自定义 font-family。
- 动效只用 `motion/react`，沿用 `src/design/motion.tsx`。
- 服务色：诊断=蓝、内容=橙、发布=绿。“你”在排位图里固定为橙色。
- 平台顺序：豆包、腾讯元宝、DeepSeek、通义千问、文心一言（`src/design/diag.ts`）。
- 文案：标题 2–6 字，说明一句话 ≤20 字，禁用黑话。
- 每个页面都要设计空、加载、部分失败、成功、被门槛锁住五类状态。
