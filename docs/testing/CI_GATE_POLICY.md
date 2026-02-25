# CI 双轨门禁策略

## 目标
在保障 CI 稳定性的前提下，持续覆盖真实设备链路，避免“只测 mock”导致的发布后风险。

## 轨道定义
- 快速轨（`ci-fast.yml`）
- 运行环境：云端公共 Runner
- 执行内容：`npm run test` + `npm run test:e2e:mock`
- 目标：快速反馈代码健康度，不依赖设备

- 设备轨（`ci-device.yml`）
- 运行环境：自托管 Windows Runner + Android 设备
- 执行内容：`npm run test:e2e:release`
- 默认策略：`E2E_DEVICE_POLICY=strict_fail`、`E2E_REQUIRE_DEVICE_FOR=release`
- 目标：发布前或夜间验证真实设备链路

## 门禁规则
- 合并门禁建议至少包含快速轨通过
- 发布门禁必须包含设备轨通过
- 设备轨失败时，不允许发布

## 无设备策略
- 常规 CI：使用 `warn_skip` + mock 兜底，不阻断迭代
- 发布流程：必须使用 `strict_fail`，无设备直接失败

## 日志规范
当设备缺失时，统一输出 `HIGH WARNING` 块，包含：
- 执行模式与策略
- 设备状态与错误信息
- 被跳过测试清单
- 接入步骤和排障命令
