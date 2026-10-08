# 01 · 前端架构

## 当前实现 vs 生产目标（先读这个）
设计工作台（Vite）目前**只用到下面标 ✅ 的部分**，其余是生产环境（Next.js）的目标栈，设计稿阶段不要提前引入。
| 项 | 状态 |
|---|---|
| React 19 + Vite + Tailwind v4（`@theme inline`） | ✅ 已用 |
| Motion（`motion/react`） | ✅ 已用 |
| Lucide 图标 | ✅ 已用 |
| 设计稿代码位置 | ✅ `src/design/`（单层目录，未拆 features/ui/patterns） |
| Astra UI kit | ❌ 不使用（无 npm 包）；以 global.css token 为准，`guidelines/Guidelines.md` 已改写 |
| Radix / shadcn、TanStack Query、sonner、react-hook-form + zod、react-router | ⏳ 生产/后续表单与路由阶段再引入；引入需登记 |
当前页面切换由 `flow.tsx` 的 `go(page, params)` 驱动（`FlowProvider` 持有页面、品牌、余额、订单、通知、工单、文章，`BrandState` 由它们派生）；真实路由到生产阶段再做，路由表（页面→路径→入参）尚未登记。共享控件在 `kit.tsx`（`Chip`、`TextField`），数据单一来源在 `data.ts / diag.ts / media.ts / profile.ts`。

## 技术选型
| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | React 19（生产环境用 Next.js App Router，设计工作台用 Vite） | 两边共用同一套组件源码 |
| 样式 | Tailwind CSS v4，token 写在 `@theme` 中 | 禁止内联 `style`（动态几何值除外，见下文）和裸 hex |
| 无头原语 | Radix Primitives（shadcn 模式：源码拷贝进仓库） | 可访问性与键盘行为交给原语负责 |
| 设计系统 | 项目 token（`global.css`）+ 项目 `ui/` 层 | 缺口用 Radix 自建 |
| 动效 | Motion（`motion/react`） | 统一的时长和曲线，见 05-motion |
| 图标 | Lucide，stroke 1.75，尺寸 16/20 | 不混用其他图标库 |
| 服务端状态 | TanStack Query | 负责缓存、骨架屏、乐观更新与回滚 |
| 反馈 | sonner Toast | 全局唯一的 Toaster |
| 表单 | react-hook-form + zod | 分步表单共享同一个 schema |
| 路由 | 生产环境用 Next.js 路由；工作台用 react-router | — |

引入新依赖前，先确认现有栈没有等价能力，并在本表登记。

## 代码分层（依赖只能向下）
```
app/ 或 routes/        页面：只做组装，不写样式细节
features/<domain>/     业务模块：brand、diagnosis、report、content、publishing、account、support
  components/          业务组件（使用 ui/ 与 patterns/）
  api.ts               Query hooks（唯一的数据入口）
  state.ts             品牌状态机和选择器
patterns/              跨业务模式：PageHeader、EmptyState、GateNotice、StatusBadge、StepSheet、DataList、ProgressGrid
ui/                    原语：Button、Card、Sheet、Dialog、Tabs、Menu、Skeleton、Field…（对 Radix 做薄封装）
tokens/                就是 index.css 中的 @theme，不另建 JS token
```
规则：
- 页面里不出现 `className` 长串堆叠。某个组合重复出现 2 次就提炼为 pattern，业务组件只写布局类名。
- 组件变体用 `cva` 声明，**禁止**为一次性需求新增变体。确实需要时先更新本规范。
- 组件的对外 API 以语义命名（`tone="danger"`），不以视觉命名（`color="red"`）。

## 内联样式的唯一例外
只能用于运行时计算出的几何值，比如进度百分比或拖拽坐标。写法是通过 CSS 变量传入：`style={{ '--progress': '42%' }}`，具体样式仍然写在类里。
