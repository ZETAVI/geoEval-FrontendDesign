# 05 · 动效与微交互

> 实现在 `src/design/motion.tsx`。风格关键词：**流畅、自然、有因果**。已被用户明确认可，后续新页面保持同一手感。

## 基线
| 名称 | 值 | 用途 |
|---|---|---|
| `EASE` | `[0.2, 0.8, 0.2, 1]`（同 `--s-ease`） | 默认曲线 |
| `SPRING` | stiffness 260 / damping 26 | 共享指示器、布局变化、卡片 hover 上浮 |
| 弹出 spring | stiffness 380 / damping 20–22 | 小元素“蹦出”：排位圆点、完成格 |
| 进入 `rise` | y 16→0，opacity，0.6s EASE | 页面区块 |
| 编排 `stagger` | staggerChildren 0.08 / delay 0.05 | 页面内区块依次进入 |
| 页面切换 | opacity 0.25s，`AnimatePresence mode="wait"` | Design.tsx |
| Tab 内容切换 | y 10→0 / -6，0.25s | 报告 tab |
| 细微 hover | `whileHover={{ y: -3 }}` / `scale 1.05–1.12`，`whileTap scale 0.94–0.96` | 卡片/圆点/关键词 |

## 已沉淀的模式
1. **共享指示器**：tab 下划线 `layoutId="report-tab"`、选中圆点外环 `layoutId="dot-sel"`。选中态不闪现，而是“滑过去”。
2. **逐个入场**：圆点按 `(平台*4+问题)*0.04s` 延迟 spring 入场；关键词按 0.08s 间隔；气泡按 0.1s。总时长控制在 ~1.2s 内。
3. **状态格三态**（`Running.tsx`）：等待（虚线）→ 提问中（淡蓝底 + 扫光 + 三点呼吸）→ 完成（spring 弹出并显示结果）。用 `AnimatePresence mode="popLayout"`。
4. **数字**：`CountUp` 进入视口计数；`AnimatedNumber` 随值变化滚动；环形进度用 `pathLength` + `strokeDashoffset`，禁止内联 style。
5. **回放**：给容器 `key={run}` 让动画重演（“回放诊断”“重播演示”）。
6. **展开收起**：`height: 0 ↔ auto` + opacity。
7. **背景氛围**：只在首页 Hero（`LogoField`），业务页不用动态背景。

## 第 6 轮新增模式
8. **档位选择器**：`layoutId="pack-tier"` 的高亮在套餐档位间滑动；覆盖面板内数字用 `AnimatedNumber`，切换时随值滚动。
9. **串行回放**（`Running.tsx`）：后台是并发返回，前端把 20 条回答按到达顺序串行回放（总长约 60s，`LINE_MS=420`），表格格子与右侧记录同步；1×/3× 切换只改节拍，不改结构。
10. **自动跟随最新**：记录面板默认贴底；用户上滑后停止跟随并出现“回到最新”；回到底部恢复。
11. **整卡可点 + 独立勾选**：卡片整体进详情，右上勾选是单独按钮，互不触发。
12. **TextField 反馈**：聚焦环、计数变色、“清除”只在聚焦且有内容时出现，全部走 `transition-colors / transition-[border-color,box-shadow]`，不另加动画。

## 已知债（勿扩大）
代码里仍散落约 14 种时长（0.15–1.6s）。上表之外的值应在复查时归并；**新代码只用上表的值**。

## 规则
- 动效必须表达因果（新数据到了、选中变了、状态推进了）；纯装饰不加。
- 单次过渡 ≤ 0.6s；循环动画（扫光、呼吸）只出现在“进行中”元素上，完成后停止。
- 减少动态：`MotionConfig reducedMotion="user"` 已在 Design.tsx 全局设置，组件不各自判断（`CountUp` 内部例外）。
- 动态几何值（百分比、位置）优先用 Tailwind 类 / SVG 属性 / `pathLength`；列位置这类离散值用静态类查表（如 `COL[]` → `col-start-N`），不写 `style`。
