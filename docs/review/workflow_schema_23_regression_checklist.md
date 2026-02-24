# 23 模块回归验证清单（可勾选）

日期：2026-02-24T18:01:04.863Z
范围：创建工作流模块 23 项 schema 补齐后的回归验证

说明：
- `输入字段对齐/输出字段对齐/默认值` 对照 Android `getInputs()/getDynamicInputs()/getOutputs()`。
- `可见性联动` 重点检查 `vflow.device.play_audio`。
- `导出JSON键名` 与 `运行payload键名` 都以 canonical moduleId 与参数键为准。

| 勾选 | moduleId | schema文件 | Android源码定位 | 输入字段对齐 | 输出字段对齐 | 默认值 | 可见性联动 | 导出JSON键名 | 运行payload键名 | 结果 |
|---|---|---|---|---|---|---|---|---|---|---|
| [ ] | `vflow.ai.autoglm` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\interaction\AutoGLMModule.kt:48` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.data.comment` | `data.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\data\CommentModule.kt:16` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.data.get_current_time` | `data.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\data\GetCurrentTimeModule.kt:20` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.data.text_extract` | `data.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\data\TextExtractModule.kt:21` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.data.text_replace` | `data.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\data\TextReplaceModule.kt:19` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.data.text_split` | `data.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\data\TextSplitModule.kt:20` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.device.delay` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\system\DelayModule.kt:25` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.device.play_audio` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\system\PlayAudioModule.kt:24` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.device.toast` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\system\ToastModule.kt:22` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.interaction.find_image` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\interaction\FindImageModule.kt:42` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.interaction.find_until` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\interaction\FindTextUntilModule.kt:38` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.logic.break_loop` | `logics.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\logic\BreakLoopModule.kt:17` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.logic.continue_loop` | `logics.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\logic\ContinueLoopModule.kt:17` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.logic.stop_workflow` | `logics.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\logic\StopWorkflowModule.kt:17` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.network.feishu_upload` | `sys.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\network\FeishuMediaUploadModule.kt:27` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.notification.find` | `sys.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\notification\FindNotificationModule.kt:18` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.notification.remove` | `sys.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\notification\RemoveNotificationModule.kt:16` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.snippet.find_until` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\snippet\FindTextUntilSnippet.kt:27` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.system.systeminfo` | `sys.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\system\SystemInfoModule.kt:18` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.trigger.share` | `triggers.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\triggers\ReceiveShareTriggerModule.kt:19` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.ui.interaction.exit` | `interactions.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\ui\blocks\UiListenerModules.kt:328` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.variable.load` | `data.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\data\LoadVariablesModule.kt:12` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| [ ] | `vflow.variable.random` | `data.ts` | `app\src\main\java\com\chaomixian\vflow\core\workflow\module\data\RandomVariableModule.kt:17` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## 场景检查（全局）
- [ ] 23 模块逐一创建步骤并保存
- [ ] 参数修改 + 撤销/重做后导出 JSON
- [ ] `vflow.device.play_audio` 动态字段联动正常
- [ ] `vflow.trigger.share` 文本/图片分支无类型报错
- [ ] `vflow.variable.load/random` 下游引用正常
- [ ] 图形/代码视图往返不丢字段
- [ ] 抽样调试推送（含 `trigger.share + play_audio + find_until`）通过
