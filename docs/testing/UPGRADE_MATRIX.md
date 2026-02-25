# 升级回归矩阵

## 目标
在 Node、Electron、Playwright 升级时，保证核心测试体系稳定，不引入隐性回归。

## 矩阵维度
- Node LTS：`20`、`22`
- Electron：当前主版本、下一主版本试跑
- Playwright：当前版本、最新主版本试跑

## 推荐执行频率
- Node 矩阵：每次 PR（至少 20 + 22）
- Electron/Playwright 试跑：每周或每两周一次

## 最小检查项
- `npm run build`
- `npm run test`
- `npm run test:e2e:mock`

## 升级准入标准
- 单测/集成测试通过
- mock E2E 关键路径通过
- 若涉及主进程通信或设备链路代码，需补跑 `npm run test:e2e:release`

## 变更记录要求
每次升级需要在 PR 描述中记录：
- 升级版本
- 失败用例与修复点
- 是否影响真实设备链路
