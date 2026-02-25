# E2E 云端兜底策略

## 目标
在云端 Runner 没有设备或设备不稳定时，E2E 不因真实链路不可用而整体中断，同时保留一套可执行的 UI 端到端回归。

## 运行模式
- `E2E_MODE=auto`
- 行为：检测到 ADB 设备则跑真实设备链路，否则自动降级到 mock 兜底链路
- 命令：`npm run test:e2e`

- `E2E_MODE=real`
- 行为：强制真实设备链路；无设备时测试失败
- 命令：`npm run test:e2e:real`

- `E2E_MODE=mock`
- 行为：强制 mock 兜底链路；不依赖设备
- 命令：`npm run test:e2e:mock`

## 设备策略
- `E2E_DEVICE_POLICY=warn_skip|strict_fail`
- 默认：`warn_skip`
- `warn_skip`：输出 `HIGH WARNING` 后跳过设备依赖步骤并运行兜底链路
- `strict_fail`：若设备缺失且流程要求设备，直接失败并返回非 0 退出码

- `E2E_REQUIRE_DEVICE_FOR=none|release`
- 默认：`none`
- `release`：发布门禁模式，设备缺失时不允许继续

## 推荐策略
- 自托管（有设备）：`npm run test:e2e`（auto）
- 云端（无设备）：`npm run test:e2e:mock`
- 发布前门禁（必须走实机）：`npm run test:e2e:real`
- 发布门禁（严格）：`npm run test:e2e:release`

## 最小流水线模板（示例）
```yaml
steps:
  - run: npm ci
  - run: npm run build
  - run: npm run test
  - run: npm run test:e2e
```

云端无设备可替换最后一步为：
```yaml
steps:
  - run: npm run test:e2e:mock
```

## 已知限制
- mock 兜底只能验证桌面端 UI 与 IPC 错误反馈，不验证 Android 端真实执行。
- 真实链路仍依赖 ADB 授权和设备端 DebugServer 可用性。

## 告警样式
无设备时会输出统一告警前缀：
- `HIGH WARNING: REAL DEVICE NOT AVAILABLE...`
- 告警会附带跳过用例、设备接入步骤、ADB 排查命令与 DebugServer 检查指引。
