# 洞点 · 前端设计规范（入口）

> 本目录是前端设计的唯一权威来源。人和 AI agent 在写任何 UI 之前，都按下面的顺序阅读。
> 一个事实只在一处定义，其他地方链接过去，不复制。

| 顺序 | 文档 | 回答的问题 |
|---|---|---|
| 0 | [HANDOFF.md](HANDOFF.md) | **新 agent 先读**：目标、约束、进度、代码地图、下一步 |
| 1 | [00-journey.md](00-journey.md) | 终端客户在做什么，每一步的门槛和状态 |
| 2 | [01-architecture.md](01-architecture.md) | 用什么技术栈，代码怎么分层 |
| 3 | [02-tokens.md](02-tokens.md) | 颜色、字阶、间距、圆角、阴影从哪里来 |
| 4 | [03-layout.md](03-layout.md) | Shell、栅格、容器查询 |
| 5 | [04-interaction.md](04-interaction.md) | 渐进暴露、状态矩阵、骨架屏、乐观更新 |
| 6 | [05-motion.md](05-motion.md) | 动效时长、曲线、微交互、减少动态 |
| 7 | [06-ai-patterns.md](06-ai-patterns.md) | AI 结果如何可解释、可追溯 |
| 8 | [07-content.md](07-content.md) | 文案语气、错误信息、数字格式 |
| 9 | [08-agent-contract.md](08-agent-contract.md) | 多 agent 协作规则与 PR 自检清单 |
| 10 | [09-roadmap.md](09-roadmap.md) | 复盘、组件选型原则与任务进度 |
| 11 | [10-retrospective.md](10-retrospective.md) | 用户反馈提炼出的通用原则、经验与已知不足 |
| 12 | [11-diagnosis.md](11-diagnosis.md) | AI 搜索诊断模块的数据模型、页面、可视化与状态矩阵 |
| 13 | [12-review.md](12-review.md) | 已确认的决定、系统性问题清单、品牌状态机（历史计划，进度以 HANDOFF 为准） |
| 14 | [13-backend-integration.md](13-backend-integration.md) | 前后端接入时需要补充、调整、重构的点 |
| 15 | [17-design-system.md](17-design-system.md) | **设计系统总览**：服务配色、页面骨架与韵律、组件清单、呈现手法、反模式 |
| 16 | [18-session-review.md](18-session-review.md) | **全程复盘**：演进、根因、踩坑、未决债务、已确认决定 |
| — | 14 / 15 / 16 号文档（`14-restructure`、`15-round3`、`16-round4`） | 第 2–6 轮历史记录，理解决策来源，不作现行规范 |

## 设计原则（按优先级）
1. **一个主语，一个下一步**：界面永远围绕“当前品牌”，每个视图只有一个主操作。
2. **先结论，后证据**：先给结论，再给解释，原始数据放在最后，默认收起但一定能找到。
3. **可解释的门槛**：不能做的事要说明原因，并给出一步可达的补救入口。
4. **克制的生命力**：动效用来表达因果和状态变化，不做装饰。
5. **系统优先**：先用已有组件和 token，确实有缺口时才扩展，而且扩展要回写到本规范。

## 状态
- Token 来源：团队的 `src/styles/global.css`（`--s-*`），经 `src/index.css` 映射为 Tailwind 类，详见 02-tokens。
- 视觉风格已定稿为“光感构成”（白底 + 蓝(诊断)/橙(内容)/绿(发布)**整套服务色** + 自绘 SVG 插画 + 克制动效），新页面保持一致，不引入新视觉语言。
- 已完成（第 6 轮）：首页、诊断进行中/报告、品牌资料、文章写作、媒体发布、订单、积分、帮助与通知。未做：首个品牌引导、状态矩阵、移动端；详见 HANDOFF §6–7。
