# 02 · 设计 Token

> 权威来源：`src/styles/global.css`（`--s-*`）。`src/index.css` 的 `@theme inline` 把它们映射成 Tailwind 类。**组件只写类名，不写 `var(--s-*)`，不写 hex。** 换肤只改 global.css。

## 取值链路
`global.css --s-*`  →  `index.css @theme inline --color-*/--text-*/--radius-*/--shadow-*`  →  JSX 里的 `bg-brand`、`text-ink-2`、`rounded-panel`。
新增 token 必须两处都加（global.css 定义，index.css 映射），并在本文件登记。

## 颜色类（实际可用）
| 类 | 来源变量 | 用途 |
|---|---|---|
| `bg-canvas` | `--s-canvas` | 页面画布 |
| `bg-surface` | `--s-bg` | 卡片、面板（白） |
| `bg-sunken` | `--s-soft` | 次级面板、输入底、嵌入块 |
| `text-ink` / `text-ink-2` / `text-ink-3` | `--s-fg` / `--s-muted` / `--s-input` | 正文 / 辅助 / 弱提示与占位。ink-3 只用于非关键信息 |
| `border-line` | `--s-line` | 分隔线、卡片边框 |
| `bg-mark` / `border-mark` | `--s-mark` | 虚线框、未提及占位、中性圆点 |
| `bg-brand` `text-brand` `bg-brand-soft` `text-on-brand` `brand-deep` | `--s-brand*` | 诊断服务色、主操作、选中态 |
| `bg-mint` `text-mint` `bg-mint-soft` | `--s-mint*` | 内容服务色、优点、成功 |
| `bg-orange` `bg-orange-soft` `text-orange-ink` | `--s-orange*` | 发布服务色、“你”的高亮、排位。**橙色不能当白底文字色，文字用 `orange-ink`** |
| `bg-danger` `bg-danger-soft` `text-danger` | `--s-danger*` | 短板、异常 |
| `bg-accent` `bg-accent-soft` `text-on-accent` | `--s-accent*` | 随 `data-service="content|publish"` 切换的服务强调色 |
| `bg-scrim` | `--s-scrim` | 遮罩 |

`--s-x-*` 是插画专用辅助色（art.tsx / brand.tsx 内使用），**业务界面不得使用**。

## 字阶（`--s-text-*`，只有 7 档）
| 类 | 值 | 用途 |
|---|---|---|
| `text-display` | 44px | 大数字（积分、已提到条数） |
| `text-h1` | 27px | 页面/卡片主标题、关键数字 |
| `text-h2` | 19px | 区块标题 |
| `text-h3` | 15px | 卡片标题、列表主文字 |
| `text-body` | 14px | 正文 |
| `text-caption` | 12px | 说明、元信息 |
| `text-eyebrow` | 11px | 标签、徽标、轴刻度（最小字号） |
页面 Hero 标题允许 `text-[clamp(2rem,4vw,2.75rem)]` 这一种响应式写法。数字一律加 `tabular-nums`。
字体只有 `--s-font`（`font-sans`），不写 `font-family`。SVG `<text>` 用 `font-sans` 类。

## 圆角、阴影、层级
- `rounded-control`（10px，按钮/输入/单元格）、`rounded-panel`（18px，卡片）、`rounded-full`（标签/圆点）。
- `shadow-soft`：静态卡片；`shadow-raised`：hover 浮起、浮层、主横幅。平面层级优先用 `border-line`。
- z：action 10 / overlay 30 / toast 40（`--s-z-*`）；局部浮层 `z-20` 仅限卡片内 popover。

## 服务色规则
诊断=蓝（brand）、内容=绿（mint）、发布=橙（orange）。服务色用于：卡片竖线、徽标、主按钮、该服务页的强调。“你”这个主体在所有排位图里固定用橙色，与服务色无关。

## 推荐程度编码（`diag.ts → TIER`）
| 档位 | 排位 | 视觉 |
|---|---|---|
| 靠前 | ≤3 | 实心橙 |
| 居中 | 4–5 | 浅橙底 + 橙描边 |
| 靠后 | ≥6 | 白底 + 淡橙描边 |
| 未提及 | — | 虚线空心 |
深浅 = 靠前程度；每个单元格同时写出“第 N 位 / 未提及”，不靠颜色单独传达。

## 可访问性约束
- 正文对比度 ≥ 4.5:1；大字与图形 ≥ 3:1。
- 状态不只靠颜色：圆点旁必须有文字或位置信息。
- 焦点环：`focus-visible:outline-2 outline-brand`；可点击的 SVG/圆点必须是 `<button>` 并带 `aria-label`。
- 动画遵守 `MotionConfig reducedMotion="user"`。
