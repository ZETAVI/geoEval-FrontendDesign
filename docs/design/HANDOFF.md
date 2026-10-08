# 交接：洞点前端设计 · 给下一个 agent

> 先读本文，再按「§9 阅读顺序」读规范。读完你应该知道：做什么、做到哪、怎么做才和已有风格一致、下一步做什么、哪些坑别再踩。
> 本文随第 6 轮更新（旧版交接已作废，`src/imports/HANDOFF.md` 同理）。用户使用**中文**交流，汇报也用中文。

## 1. 任务目标
产品【洞点】：面向中小本地生活客户的 GEO（生成式引擎优化）应用。主线：
`品牌资料 → AI 搜索诊断（4 问题 × 5 平台 × 采样）→ 诊断报告 → 品牌内容（文章）→ 媒体发布（套餐/自选媒体）→ 订单 → 复测`，另有积分账户与充值、帮助与工单、站内通知。
当前阶段是**前端设计稿（Vite 工作台）**，不是生产实现；接真实后端时的缺口记录在 [13](13-backend-integration.md)。后端仓库 github.com/ZETAVI/GEOEval（私有，读不到 Issues）。

## 2. 用户与协作方式（决定你怎么汇报）
- 用户期待**设计师 + PM 视角**：先复盘根因、再动手；要辩证、独立的判断，不是照单执行。
- 每次改动后**举一反三**回查同类位置；汇报要诚实写出**未做/未验证**的部分。
- 用户一次可能给出很长、带编号的批注。先归纳共同根因（见 18 §二），再逐条落地，最后给出对照表。
- 没有联网工具时，要明说“这是经验判断”；信息不足就停下来问，不要编。
- **任何 `git commit` / `push` 之前必须先问用户。**
- 用户对 Figma Make 预览里的报错会直接贴来（见 §8“预览噪音”）。

## 3. 硬约束（违反会被用户指出）
1. 样式只来自 `src/styles/global.css` 的 `--s-*`，经 `src/index.css` 的 `@theme inline` 映射为 Tailwind 类。**禁止内联 style、裸 hex、自定义 font-family**。新增 token 两处都加并登记 02。
2. **颜色=服务**：服务页里选中态/强调字/进度/主按钮只用 `accent` 系列（`bg-accent`、`bg-accent-soft`、`text-accent-ink`、`border-accent`），不要写 `bg-brand/bg-orange/text-mint`（首页 `TONE` 表除外）。详见 [17](17-design-system.md) §2。
3. 选择类控件用 `kit.tsx` 的 `Chip`，输入框用 `TextField`，不要再造第二种。
4. 动效用 `motion/react`，沿用 `motion.tsx` 的 `EASE/SPRING/rise/stagger/CountUp`；**不新增动效时长**（见 05）；新 `layoutId` 全局唯一。
5. 文案：标题 2–6 字动词+宾语；说明 1 句 ≤20 字写具体动作；禁用「信息密度/流转/闭环/动作与回应/赋能/让…更具体」（07）。
6. 指标口径：只记录排位，不声称“已判断推荐”。“AI 推荐指数”名称**不改**。
7. “你”=橙色（排位/同场品牌）；同一屏**不混用**橙色的两种含义（你 vs 内容服务色）。
8. 视觉风格“光感构成”：白底、三服务色、自绘 SVG 插画、轻阴影、克制动效。**不引入新的视觉语言**。
9. AGENTS.md：不改 `main.tsx / App.tsx` 入口结构；不加无层的全局 CSS 重置；组件默认导出。含撇号的字符串用双引号。
10. Make Kit `hardcoded-astra-ui` 装不上：照 make-kit skill 试一次，失败就如实说明，继续用项目 token，**不要用公共同名包替代**。

## 4. 已确认的产品决定（不得推翻）
平台顺序「豆包、腾讯元宝、DeepSeek、通义千问、文心一言」；服务色 蓝=诊断 / 橙=内容 / 绿=发布；保留 TopBar、无 Sidebar；通知仅站内；订单按后端：**不可取消、无退款、72 小时结算**，未上线篇数结算后退回积分；套餐发布由运维逐篇回传已上线媒体与链接；后端缺口只记 13。其余见 [12](12-review.md) §一。

## 5. 代码地图（`src/design/`，约 4200 行）
```
Design.tsx    评审壳：顶部“评审页面”条 + “品牌状态”预设条；SERVICE 表把页面映射到 data-service；FlowProvider 包 Stage
flow.tsx      useFlow()：page/go(page,params)、balance、brands、orders、notices、tickets、article、state(BrandState 派生)、preset(state)
TopBar.tsx    品牌切换 · 通知 · 帮助 · 品牌资料 · 余额
Home.tsx      首页：三服务卡（TONE 表）、LogoField、最近订单
Running.tsx   诊断进行中：BLOCKS 串行回放（~60s，LINE_MS=420，1×/3×）、5×4 表、Record 面板
Report.tsx PositionMap.tsx Impression.tsx   诊断报告三 tab
Content.tsx   品牌内容：品牌资料 | 文章写作（Stepper：选风格→改草稿→确认）
Profile.tsx profile.ts   资料表单与完整度清单（checklist/missingMust）
Editor.tsx    Tiptap
Publish.tsx PublishParts.tsx media.ts MediaUI.tsx   发布方案(PackPicker) | 媒体库(MediaCard→MediaDetail) | 发布订单
Orders.tsx    订单详情（逐篇回传、未上线篇数/退回积分）
Points.tsx    积分账户与充值       Help.tsx   帮助中心 + 工单工作区
ui.tsx        ModuleShell / Sheet / GateNotice / RechargeSheet / PayMethod
kit.tsx       Chip / TextField      shared.tsx  cx / AnimatedNumber / Progress / Stars
motion.tsx    动效基线              art.tsx brand.tsx   插画与 Logo
data.ts diag.ts media.ts profile.ts   数据单一来源（诊断口径、媒体、订单、品牌、通知、工单、FAQ）
```
新增页面：`shared.tsx` 的 `Page` 加键 → `Design.tsx` 的 `PAGES`（需要评审条入口时）与渲染分支 → 若属于某服务，在 `SERVICE` 表登记。`order`、`help` 不在评审条里，从业务入口进入。
`BrandState = setup → ready → report → draft → publishable → published`，首页主推由它驱动；评审页“品牌状态”条可直接切换演示。

## 6. 进度（截至第 6 轮）
| 模块 | 状态 | 备注 |
|---|---|---|
| 首页 | ✅ | 文案与服务色第 6 轮重写 |
| 诊断进行中 | ✅ | 回答记录面板、串行回放；真实流式接口待定（13/16） |
| 诊断报告（概览/平台排位/品牌印象） | ✅ | 手写数字待复核（18 §六.2） |
| 品牌资料 | ✅ | 级联行业、地图地址卡、价格刻度、特点卡（示例/Enter 跳转） |
| 文章写作 | ✅ | Tiptap；已确认编辑回退草稿；自查为用户声明 |
| 媒体发布 | ✅ | 套餐=PackPicker；媒体库卡片+详情；精准模式勾选；确认抽屉 |
| 订单详情 | ✅ | 随机发布订单的“范围+逐篇回传” |
| 积分与充值 | ✅ | 支付宝 + 微信支付 |
| 帮助与工单、通知、品牌切换 | ✅ | 站内通知可直达订单/工单 |
| 首个品牌引导 | ⏳ 未做 | 决定 #9 |
| 诊断状态矩阵（空/部分失败/样本不足/锁定） | ⏳ 未做 | 见 11 |
| “基于旧资料”报告标记 | ⏳ 未做 | |
| 移动端底部 Tab、窄屏复核 | ⏳ 未做 | 03 有规范 |
| 通用 ErrorNotice / 骨架屏 | ⏳ 未做 | 04 有规范 |
| 路由表、a11y 审计、动效时长归并 | ⏳ 债务 | 18 §六 |

## 7. 建议的下一步（按价值排序，开工前与用户确认）
1. **收尾一致性（半天量级）**：复核手写数字并改为派生；归并动效时长；`grep` 全站残留的 `bg-brand/bg-orange/text-mint` 是否在服务页中误用；定位那个 404。已知残留：`Orders.tsx` 第 101 行“未能上线/已退回”提示在发布（绿）服务页里用了 `bg-orange-soft`，应改为 `danger` 或中性；`Profile.tsx` 的“已通过高德校验”用 mint 属于“成功”语义，可保留。
2. **状态矩阵 + ErrorNotice + 骨架屏**：先做诊断（空、样本不足、部分失败、锁定），再推广到发布/订单。
3. **首个品牌引导**：复用 Profile 分步表单（`mode="onboarding"` 多一条欢迎语），完成必填后落到“开始诊断”。
4. **“基于旧资料”标记**：资料保存 → 旧报告 Hero 打标 → 首页主推切回“可诊断”。
5. **窄屏与移动端**：先在 768–1100 逐页看双栏塌缩，再做底部 Tab。
6. 之后才是路由与真实接口接入（按 13 的核对表与后端逐项对）。
每个新模块先说明参考来源是否经过核对；没有联网工具就写“经验判断”。

## 8. 环境与验证（实测可用）
- Vite 开发服务器已在运行（沙箱端口 3000），热更新。**改完用绝对路径**，shell cwd 会漂移。
- 类型检查：`cd /workspaces/default/code && npx tsc --noEmit -p . 2>&1 | grep -v "^npm"`
- 构建：`npx vite build`，随后 `rm -rf dist`。
- 截图/控制台：沙箱有 `/usr/bin/chromium`；用临时目录里的 playwright（`createRequire('/opt/playwright-mcp/')`）打开 `http://localhost:3000`。评审条选择器：`nav[aria-label="设计稿页面"] button`、`div[aria-label="演示：品牌所处位置"] button`。**沙箱无中文字体，文字是方块**，只能验证布局、颜色、动效和报错；字体渲染与中文换行没验证过。
- **预览噪音/假报错**（不要改代码）：
  - `Source data resolution timed out for element DIV/NAV/HEADER` → Figma Make 检查器超时。
  - `useFlow 需要在 FlowProvider 内使用`、`xxx is not defined` 且**堆栈行号与当前源码对不上** → 预览 HMR 旧模块。先 `grep -n "FlowProvider" src/design/Design.tsx` 核对，再让用户刷新预览；冷加载无 `pageerror` 即可确认。
- Git：只有一个 `bootstrap` 平台快照提交。**提交/推送先问用户。**

## 9. 阅读顺序（新 agent）
1. 本文 → 2. [17-design-system](17-design-system.md)（风格与组件，一页读懂）→ 3. [18-session-review](18-session-review.md)（为什么这样、踩过的坑）→ 4. [02-tokens](02-tokens.md)、[05-motion](05-motion.md)、[07-content](07-content.md) → 5. 动手的模块对应的文档（11 诊断、13 后端缺口）→ 6. 打开 `src/design/` 里 1–2 个已认可页面（推荐 `Publish.tsx` + `PublishParts.tsx`、`Running.tsx`）感受代码风格。
`14/15/16` 是历史轮次记录，用来理解决策来源，不当作现行规范。

## 10. 经验清单（每个新页面开工前过一遍）
1. 这一页用户**要管理的对象**是什么？颜色、Tab、文案围绕它，而不是围绕“动作”。
2. 先盘点**真实可得的数据**，再选呈现；设计不出数据撑不起的图，也不承诺系统做不到的验证。
3. 三个同构块 = 应该是“选择器 + 一个面板”。
4. 指标/标题互不重叠，每个只回答一个问题；文本与图形分离。
5. 总览 → 筛选 → 证据，一键可达；选中态用共享指示器滑动。
6. 等待阶段呈现“最终结果的结构”，不放转圈。
7. 每个状态都要设计：空、加载、部分失败、成功、被门槛锁住（原因 + 补救入口）。
8. 能复用 `Chip / TextField / ModuleShell / GateNotice / Sheet` 就不要新造。
9. 改完回头查同类位置，再汇报；汇报要写清没验证的部分。
