# 洞点 · 光感构成 —— Figma / Figma Motion 承接包

> 目的：把代码中已实现的“光感构成”方案（`src/design/*`）交给设计师在 Figma Design + Figma Motion 中精修素材与动效，再经 Dev Mode / MCP 回流到代码。

## 0. 能力边界与协作回路

| 环节 | 谁做 | 工具 |
|---|---|---|
| 素材精修（透镜 / 文稿 / 纸飞机 / 光带）、组件与变体 | 设计师 | Figma Design（变量、组件、Auto layout） |
| 关键帧动效、弹簧、组件级动画、Motion 变量 | 设计师 | Figma Motion（时间轴，Open beta） |
| 读取设计 → 代码 | Make 代理 | MCP `get_design_context`（结构/样式/截图）、`get_motion_context`（关键帧轨道、缓动、CSS/@keyframes 与 motion.dev 片段） |
| 写回 Figma 画布 / 创建关键帧 | **Make 代理不能做** | 仅设计师或 Figma 内置 agent |

回路：设计师在 Figma 完成 → 发我**带 node-id 的链接**（`figma.com/design/<fileKey>/...?node-id=1-2`）→ 我调用 `get_design_context` + `get_motion_context(recursive)` → 用 motion.dev 与 token 落地，替换 `src/design/art.tsx` 中对应组件。

## 1. Token（Figma Variables 请按同名建立）

来源：`src/styles/global.css`。颜色集合 `s/color`，数值集合 `s/size`，Motion 变量 `s/motion`。

| 变量 | 值 | 用途 |
|---|---|---|
| s-bg / s-canvas | #fff / #fafaf8 | 面板 / 画布 |
| s-fg / s-muted / s-input | #15203b / #5c6880 / #8390a7 | 文本三级 |
| s-line / s-soft / s-mark | #e0e6f0 / #f3f6fc / #d5def0 | 分隔 / 凹面 / 未点亮 |
| s-brand / s-brand-deep / s-brand-soft | #2455df / #1741bb / #edf3ff | 诊断服务、主操作 |
| s-orange / s-orange-ink / s-orange-soft | #ff955f / #512306 / #fff1e6 | 内容服务、星级、提醒 |
| s-mint / s-mint-soft | #107666 / #e6f7f1 | 发布服务、成功 |
| s-x-c9dcff / s-x-ffd0a7 / s-x-b9511e | 光带蓝尾 / 光带橙尾与闪电顶 / 文稿 Aa 深端 | 插画辅助色 |
| s-radius-control / panel | 10 / 18 | 控件 / 卡片 |
| s-shadow / raised | 0 10 32 tint 6% / 0 16 40 tint 12%（tint #263c64） | 卡片 / 悬停 |
| 字体 | 仅 `--s-font`（系统无衬线 + PingFang SC） | 所有文字，请勿引入新字体 |

Motion 变量：`ease-standard = cubic-bezier(.2,.8,.2,1)`；`spring-ui = stiffness 260 / damping 26`；`spring-soft = 200 / 20`；`fast 150ms`、`panel 220ms`、`enter 600ms`。

## 2. 画面结构（Frame 1440 宽，断点 1000 / 640）

**服务首页**：顶栏（Logo · 品牌切换 · 通知 · 品牌资料 · ⚡余额胶囊）→ 首屏标题“品牌服务”+ 手写标语“好品牌，会被更多人看见”+ 光带 → 三张服务卡（诊断蓝 / 内容橙 / 发布绿，发布卡带“建议下一步”）→ 发布记录（可展开为上线时间线）。

**积分账户**：左：大号余额（闪电 + 数字）、记录 Tabs（积分明细 / 充值记录 / 发票记录）；右：粘性充值面板（档位 ×3、自定义金额、支付方式、结算摘要、确认按钮三态）。

服务卡组件建议变体：`service = report | content | publish` × `state = rest | hover | focus` × `badge = on | off`；hover 时展开 peek 区（诊断=5 平台胶囊；内容=文章状态链；发布=套餐/精准切换）。

## 3. 素材与动效规格（请以此为起点精修）

画布均为 220×220，插画须表达业务含义而非纯装饰。

### 3.1 诊断 · 玻璃透镜 `LensArt`
- 层：投影椭圆（brand 20%，模糊 6）→ 镜片厚度（rim 渐变 bg→brand→brand-deep）→ 镜面（径向 bg→brand-soft→brand）→ 3 道内环（白，透明度递减）→ 高光→ 轨道虚线圈 r100 + **5 颗平台点**（其中 1 颗橙色 = 唯一推荐你的平台）。
- 动效：镜片 y 0→-6→0，6s 循环 ease-in-out；轨道 rotate 360，常态 36s / hover 10s 线性。
- 精修期望：真实玻璃折射感（可用 Figma 着色器 / 玻璃效果）、hover 时橙点放大并出现“豆包”标签。

### 3.2 内容 · 叠放文稿 `SheetsArt`
- 层：背页（orange-soft→orange 55%，rotate 12°）→ 中页（orange-soft，rotate 5°）→ 顶页（bg→orange-soft，投影 orange 25%）+ 3 条文字行 + “Aa”（orange→s-x-b9511e）+ 光标。
- 动效：进入时文字行依次描出（pathLength 0→1，700ms，间隔 180ms，起始 300ms）；光标 1.1s 闪烁；hover 纸张扇开（背页 12°→18°、x+8；中页 5°→9°；顶页 0°→-4°、y-4，spring-soft）。
- 精修期望：纸张厚度与卷角；“确认”时顶页盖章或打勾的一次性动画。

### 3.3 发布 · 纸飞机 `PlaneArt`
- 层：虚线航迹（mint 40%，dash 4/7）→ 4 个媒体节点（白底 mint 描边）→ 飞机三片面（顶面 bg→mint-soft、机翼 mint→mint 55%、机腹 mint 75%，投影 mint 30%）。
- 动效：航迹 dashoffset 流动（常态 2.4s / hover 0.8s）；节点依次弹出（spring 400/14，间隔 150ms）；飞机悬浮漂移 5s，hover 时 x+8 y-8 rotate -4° 起飞。
- 精修期望：飞机沿航迹飞行、经过节点时节点点亮（对应“已上线篇数”）。

### 3.4 首屏光带 `HeroRibbon`
- 两条流体色带：蓝（brand 0→55%→c9dcff 30%）、橙（orange 0→45%→ffd0a7 20%），模糊 1.2。
- 动效：蓝带 x 0→-18→0（14s），橙带 x 0→14→0（11s），错频形成呼吸感。
- 精修期望：更接近参考图中的丝带折叠与透光；可做成 Motion 组件循环。

### 3.5 交互微动效（组件级，建议做成 Motion 变量驱动的组件动画）
| 场景 | 规格 |
|---|---|
| 页面进入 | 子项 stagger 80ms，y 16→0 + 淡入，600ms ease-standard |
| 服务卡 | 指针倾斜 ±4°（spring 180/22），插画视差 ±10px；hover 阴影 soft→raised；peek 高度展开 350ms |
| 数字 | 进入视口计数 0→目标 1.2s；变化时补间 600ms |
| 星级 | 逐颗填充，起始 500ms，间隔 120ms，每颗 350ms，支持半星 |
| 进度条 | scaleX 0→完成比，1s，延迟 200ms；发布中状态点 ping 脉冲 |
| Tabs / 档位 / 切换 | 选中指示共享布局滑动（spring-ui） |
| 充值按钮 | 确认充值 → 等待支付结果（旋转）→ 已到账（mint 底 + 勾），文字上下切换 200ms |
| 到账反馈 | 新记录高亮 brand-soft 淡出 1.8s；闪电 scale 1.35→1 弹性（300/12）；余额与顶栏同步计数 |
| 降级 | 系统开启“减少动态效果”时全部取终态，无循环 |

## 4. 建议交付（Figma 侧）
1. 变量：按第 1 节建立颜色、尺寸、Motion 变量。
2. 组件：`ServiceCard`（变体见第 2 节）、`LensArt` / `SheetsArt` / `PlaneArt` / `HeroRibbon`（带 Motion 时间轴）、`TierOption`、`PayMethod`、`RecordRow`、`ConfirmButton`（三态）。
3. Frame：服务首页、积分账户各 1440 / 1000 / 390 三档。
4. 把以上 node 链接发给我；有 Motion 的节点我会读取关键帧并替换代码实现，其余通过 `get_design_context` 对齐结构与细节。

## 5. 下一批页面（同一视觉语言）
诊断报告（平台 × 问题矩阵、品牌印象正负主题、原始回答证据）、品牌内容（草稿→确认状态机）、媒体发布（套餐 / 精准 → 确认 → 订单时间线）。建议设计师先做这三页的关键素材与转场。
