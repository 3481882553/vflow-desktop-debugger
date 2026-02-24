# 创建工作流一致性审查报告

日期：2026-02-24（初版）/ 2026-02-25（证据同步更新）  
范围：`vflow` Android 端模块定义 vs `desktop-debugger` 创建工作流能力（模块列表 + schema + 编辑器数据流 + 调试传输鲁棒性）

## 一致性矩阵摘要

- Android 端模块 ID（`override val id`）数量：`116`
- 子项目模块面板 ID（`modules_zh.json`）数量：`135`
- 子项目 schema ID（`data/schemas/*.ts`）数量：`142`
- 主项目存在但子项目模块列表缺失：`66`
- 子项目模块列表额外存在：`85`
- 主项目模块在子项目缺失 schema：`0`
- 子项目 schema 在主项目无对应模块：`26`
- 契约导出产物 `missingSchemaIds`：`0`

完整机器可读矩阵：`desktop-debugger/docs/review/workflow_module_consistency_matrix.json`

## 问题清单

### Blocker 1：模块 ID 命名体系不一致，导致“可创建但不可执行/不可编辑”

子项目模块面板大量使用点号风格 ID（如 `...get.clipboard`、`...input.text`、`...app.start`），而 Android 运行时使用下划线风格（如 `...get_clipboard`、`...input_text`、`...app_start`）。

证据：
- 子项目模块列表使用点号风格：
  - `desktop-debugger/src/renderer/data/modules_zh.json:15`（`vflow.system.get.clipboard`）
  - `desktop-debugger/src/renderer/data/modules_zh.json:69`（`vflow.interaction.input.text`）
  - `desktop-debugger/src/renderer/data/modules_zh.json:135`（`vflow.trigger.app.start`）
- Android 运行时使用下划线风格：
  - `app/src/main/java/com/chaomixian/vflow/core/workflow/module/system/GetClipboardModule.kt:26`
  - `app/src/main/java/com/chaomixian/vflow/core/workflow/module/interaction/InputTextModule.kt:30`
  - `app/src/main/java/com/chaomixian/vflow/core/workflow/module/triggers/AppStartTriggerModule.kt:16`
- 子项目 schema 查找是精确 key 匹配，无兼容映射：
  - `desktop-debugger/src/renderer/ui/App.tsx:311`

影响：
- 用户可创建 Android 端无法识别的步骤 ID。
- 选中步骤时可能拿不到 schema，右侧参数面板为空。
- 导出的 JSON 语法合法，但语义上无法在 Android 端正确执行。

### Blocker 2：导入错误 JSON 的错误页签流程失效

`handleFileChange` 在异常时使用新 tabId 派发 `LOAD_ERROR`，但 reducer 的 `LOAD_ERROR` 仅更新已有 tab，不会新增 tab。

证据：
- 异常时派发新 tabId：
  - `desktop-debugger/src/renderer/hooks/useWorkflow.ts:350`
  - `desktop-debugger/src/renderer/hooks/useWorkflow.ts:352`
  - `desktop-debugger/src/renderer/hooks/useWorkflow.ts:357`
- `LOAD_ERROR` 分支只做 `updateTab(...)`：
  - `desktop-debugger/src/renderer/hooks/useWorkflow.ts:110`
  - `desktop-debugger/src/renderer/hooks/useWorkflow.ts:113`

影响：
- 导入非法 JSON 时，用户看不到预期的错误页签和错误内容。
- 创建流程中断，且缺少可操作反馈。

### Blocker 3：代码视图可写入非法 workflow 结构，切换图形视图可能崩溃

`EDIT_JSON` 只要 `JSON.parse` 成功就直接落状态，没有验证 workflow 必要结构；图形视图随后直接访问 `workflow.steps.length`。

证据：
- 解析后直接信任对象：
  - `desktop-debugger/src/renderer/hooks/useWorkflow.ts:175`
  - `desktop-debugger/src/renderer/hooks/useWorkflow.ts:178`
- 图形视图直接解引用 `workflow.steps.length`：
  - `desktop-debugger/src/renderer/ui/WorkflowGraph.tsx:138`

影响：
- 代码视图改成 `{}` 或缺失 `steps` 时，图形视图渲染路径可崩溃。
- “图形/代码双视图编辑”核心能力不稳定。

### High 1（已关闭）：模块列表与 schema 覆盖不一致

2026-02-25 已完成 23 个缺失 schema 一次性补齐，当前契约与矩阵口径均为 `missingSchema=0`。  
对应验收证据见：
- `desktop-debugger/docs/review/workflow_schema_23_regression_results.md`
- `desktop-debugger/docs/review/workflow_module_consistency_matrix.json`

### High 2：Debug socket 解析未做分包缓冲，存在消息丢失风险

当前按每次 `data` 事件直接 `split('\n')` 解析，没有跨包缓冲，TCP 分片会触发 JSON 解析错误。

证据：
- `desktop-debugger/src/main/debugClient.ts:31`
- `desktop-debugger/src/main/debugClient.ts:35`
- `desktop-debugger/src/main/debugClient.ts:37`

影响：
- 日志/状态/schema 回包在弱网或大包情况下可能丢失或误判。
- 子项目调试 Android 工作流时稳定性不足。

### Medium 1：调试事件监听缺少反注册协议

preload 暴露了 `onDebugLog/onDebugStateChanged`，内部使用 `ipcRenderer.on(...)`，但未提供取消订阅接口。

证据：
- `desktop-debugger/src/main/preload.ts:38`
- `desktop-debugger/src/main/preload.ts:39`
- `desktop-debugger/src/main/preload.ts:41`
- `desktop-debugger/src/main/preload.ts:42`
- 渲染层注册位置：
  - `desktop-debugger/src/renderer/ui/App.tsx:78`
  - `desktop-debugger/src/renderer/ui/App.tsx:84`

影响：
- 长会话/重载场景下可能产生监听累积。

## 最小修复顺序（建议按此排期）

1. 统一模块 ID 契约（模块面板 ID、schema key、Android 运行时 ID），并加历史点号 ID 兼容映射层。
2. 修复 `LOAD_ERROR`：当目标 tab 不存在时创建错误 tab，而非仅更新。
3. 在 `EDIT_JSON` 增加 workflow 结构强校验（至少校验 `id/name/steps` 与 `steps` 数组项结构）。
4. 补齐创建可见模块的 schema；未补齐前在模块面板隐藏或置灰相关模块。
5. 为 debug socket 增加粘包/半包缓冲解析。
6. 为 preload 事件监听提供反注册函数，并在渲染层 `useEffect` cleanup 调用。

## 关于“Android 能力复制”的结论

桌面端不应复制 Android 能力实现本体（截图/NFC/短信）。  
桌面端应保证三件事：
- 模块 ID 与参数契约完全对齐
- 生成可执行的 workflow JSON
- 到 Android 调试运行时的传输链路稳定可诊断
