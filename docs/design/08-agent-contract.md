# 08 · 多 Agent 协作契约

## 写 UI 前
1. 读 `docs/design/README.md` 和本任务涉及的文档。
2. 在 `ui/`、`patterns/`、Astra kit 中搜索已有组件，**先复用**。
3. 确实需要新组件或新变体时：在 PR 描述中说明为什么现有组件不够用，并同步更新对应的规范文档。

## 单一写入者
token（`index.css @theme`）、`ui/` 原语、本目录下的文档，同一时间只允许一个 agent 修改。业务 agent 只改自己负责的 `features/<domain>/`。

## PR 自检清单
- [ ] 没有内联 `style`（CSS 变量传值的例外除外）、没有裸 hex、没有自定义 `font-family`
- [ ] 只使用 Semantic token，没有直接引用 Primitive
- [ ] 覆盖了状态矩阵中的全部状态（04-interaction）
- [ ] 每个视图只有一个主操作，次要操作收进“更多”
- [ ] 组件内部布局用容器查询，只有 Shell 使用 `@media`
- [ ] 键盘可操作、焦点可见、对比度达到 AA
- [ ] 动效使用 token，并验证了减少动态模式
- [ ] 文案符合 07-content，错误信息三要素齐全
- [ ] 术语与仓库 `docs/product/glossary.md` 一致

## 规范演进
规范变更单独提一个 PR，标注 `design-system`，只改一处权威定义，不另建 v2 这类副本文件。
