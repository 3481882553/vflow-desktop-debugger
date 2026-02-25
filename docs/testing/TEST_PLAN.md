# 测试计划（Test Plan）

## 1. 背景与目标
vFlow Desktop Debugger 是用于可视化调试 vFlow 工作流的桌面工具。测试目标是以风险驱动方式覆盖核心编辑逻辑、主进程调试链路与关键 UI 交互，降低回归风险与稳定性问题。

## 2. 测试范围
包含：
- 渲染进程核心逻辑（workflow 编辑/撤销/JSON 同步、模块加载与持久化、schema 迁移与缓存）
- 主进程 IPC/ADB/Socket 关键流程与异常路径
- 关键 UI 流程（多标签、分屏、JSON 错误提示、日志显示）

不包含：
- Android 端执行结果正确性的业务验收（E2E 仅验证桌面端推送与日志回流）
- 实机 ADB 设备能力与性能基准

## 3. 风险评估与优先级
P0：
- workflow 编辑一致性
- Undo/Redo 可靠性
- JSON 解析失败路径

P1：
- 模块加载优先级与 fallback
- Schema 同步与缓存
- IPC/ADB/Socket 错误处理

P2：
- UI 多标签/分屏交互稳定性

## 4. 测试策略（分层）
- 单测：覆盖核心逻辑与纯函数路径
- 集成：覆盖主进程 IPC/ADB/Socket 的分支链路
- E2E：覆盖关键 UI 路径（Playwright + Electron）
- E2E 运行模式：`E2E_MODE=auto|real|mock`
- `auto`：有设备跑真实链路，无设备自动降级到 mock 兜底用例
- `real`：强制真实设备链路（无设备直接失败）
- `mock`：强制 mock 兜底链路（适合云端无设备）
- 设备策略：`E2E_DEVICE_POLICY=warn_skip|strict_fail`
- 发布要求：`E2E_REQUIRE_DEVICE_FOR=release`（无设备直接失败）

## 5. 测试环境与依赖
- Node.js ≥ 18
- Vitest + @testing-library/react
- Playwright（E2E）
- ADB 在 PATH 中可用
- 设备端 DebugServer 监听 `9999` 且支持 JSON 行协议
- E2E 需先执行 `npm run build`

## 6. 执行策略（变更触发矩阵）
- 每次提交：核心逻辑单测
- 主进程改动：主进程集成测试
- UI/IPC/调试流程改动：关键 E2E 子集
- 云端无设备：执行 `npm run test:e2e:mock`
- 自托管有设备：执行 `npm run test:e2e`（auto）或 `npm run test:e2e:real`
- 发布前门禁：执行 `npm run test:e2e:release`

## 7. 交付物清单
- 测试计划
- 测试用例集
- 测试日志模板
- 覆盖说明
- 执行矩阵
- 设备接入与排障手册
- CI 双轨门禁策略
- 升级回归矩阵

## 8. 退出准则
- P0/P1 用例通过率 100%
- 关键回归场景无失败
- 缺陷均已记录并评估风险
- Vitest 覆盖率阈值达标（lines/statements/functions ≥ 65%，branches ≥ 55%）

## 9. 维护策略与回归策略
- 新功能新增对应单测与 E2E 核心路径
- 关键逻辑变更必须补充回归用例
- 对不稳定的 E2E 用例标注为可选并定期维护
- 设备接入与排障流程见 `docs/testing/DEVICE_ONBOARDING.md`
- 双轨门禁策略见 `docs/testing/CI_GATE_POLICY.md`
