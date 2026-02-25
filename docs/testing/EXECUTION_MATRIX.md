# 执行矩阵（Execution Matrix）

## 变更类型 → 测试范围

| 变更类型 | 必跑测试 |
|---|---|
| 业务逻辑（workflow、模块、schema） | 单测（renderer） |
| 主进程 IPC/ADB/Socket | 主进程集成测试 |
| UI 交互、视图、调试流程 | 单测 + E2E 核心路径 |
| 依赖升级（Electron/Vite/React） | 单测 + 主进程集成 + E2E |
| 真实设备链路相关改动 | 真实设备 E2E（自托管 Runner） |
| 云端 Runner 无设备 | `npm run test:e2e:mock` |
| 云端 Runner 有设备 | `npm run test:e2e`（auto）或 `npm run test:e2e:real` |
| 发布门禁 | `npm run test:e2e:release`（strict_fail + release） |
| Node/Electron/Playwright 升级 | `npm run build` + `npm run test` + `npm run test:e2e:mock`，必要时补 `test:e2e:release` |

## CI 流水线映射
- `ci-fast.yml`：快速轨（无设备可跑）
- `ci-device.yml`：设备轨（真实设备门禁）
- `ci-upgrade-matrix.yml`：升级兼容性巡检
