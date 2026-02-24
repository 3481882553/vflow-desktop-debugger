# 23 模块补齐回归结果与审计证据

日期：2026-02-25T02:08:00+08:00

## 自动校验结果快照

### 1) `node scripts/export_vflow_module_contracts.mjs`
```text
[vflow-contract] exported 116 modules with locales [en, zh-CN] -> D:\vFlow-learn\docs\contracts\vflow_module_contract_source.json
```

### 2) `npm run contracts:export`
```text
> vflow-desktop-debugger@0.1.0 contracts:export
> node scripts/export-module-contracts.mjs
[contracts] generated: D:\vFlow-learn\desktop-debugger\src\renderer\data\generated\module-contract-bundle.json
[contracts] app=116, missingSchema=0
```

### 3) `npm run contracts:check`
```text
> vflow-desktop-debugger@0.1.0 contracts:check
> node scripts/check-module-consistency.mjs
[consistency] canonical=116, missingSchema=0
[consistency] PASS
```

### 4) `npm run contracts:check-display`
```text
> vflow-desktop-debugger@0.1.0 contracts:check-display
> node scripts/check-display-consistency.mjs
[display-check] PASS: compared 232 locale displays
```

### 5) `npm run typecheck`
```text
> vflow-desktop-debugger@0.1.0 typecheck
> tsc --noEmit -p tsconfig.renderer.json
```

### 6) `npm run build-main`
```text
> vflow-desktop-debugger@0.1.0 build-main
> tsc -p tsconfig.main.json
```

## 23 模块契约恢复情况
- hasLocalSchema=true：23/23
- missingSchema（contracts:check）：0

| moduleId | hasLocalSchema | schema文件 |
|---|---:|---|
| `vflow.ai.autoglm` | true | `interactions.ts` |
| `vflow.data.comment` | true | `data.ts` |
| `vflow.data.get_current_time` | true | `data.ts` |
| `vflow.data.text_extract` | true | `data.ts` |
| `vflow.data.text_replace` | true | `data.ts` |
| `vflow.data.text_split` | true | `data.ts` |
| `vflow.device.delay` | true | `interactions.ts` |
| `vflow.device.play_audio` | true | `interactions.ts` |
| `vflow.device.toast` | true | `interactions.ts` |
| `vflow.interaction.find_image` | true | `interactions.ts` |
| `vflow.interaction.find_until` | true | `interactions.ts` |
| `vflow.logic.break_loop` | true | `logics.ts` |
| `vflow.logic.continue_loop` | true | `logics.ts` |
| `vflow.logic.stop_workflow` | true | `logics.ts` |
| `vflow.network.feishu_upload` | true | `sys.ts` |
| `vflow.notification.find` | true | `sys.ts` |
| `vflow.notification.remove` | true | `sys.ts` |
| `vflow.snippet.find_until` | true | `interactions.ts` |
| `vflow.system.systeminfo` | true | `sys.ts` |
| `vflow.trigger.share` | true | `triggers.ts` |
| `vflow.ui.interaction.exit` | true | `interactions.ts` |
| `vflow.variable.load` | true | `data.ts` |
| `vflow.variable.random` | true | `data.ts` |

## 人工回归执行结论
- 本轮已完成：自动化与静态契约证据同步（可复现）。
- 本轮未自动执行：UI拖拽交互、真机推送调试（需人工设备）。

## 最终验收汇总
- missingSchemaForAppModule：23 -> 0
- 23 个目标模块已从契约层恢复可用
- 残余风险：
  - `vflow.trigger.share` 在 Android 为动态输出类型；桌面以 `vflow.type.any + conditionalOptions` 做兼容表达。
  - `vflow.variable.random` 输出类型在 Android 随 `type` 动态变化；桌面以 `vflow.type.any` 承载。
  - 图形交互与 Android 真机端到端推送需要人工设备验证。
