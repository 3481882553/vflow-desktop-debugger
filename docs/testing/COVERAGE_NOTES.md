# 覆盖说明（Coverage Notes）

## 已覆盖
- workflow 编辑/撤销/JSON 同步
- 模块加载优先级与 fallback
- Schema 同步与本地缓存
- IPC/ADB/Socket 关键分支与错误路径
- 关键 UI 交互（真实设备 + 云端 mock 兜底）
- 设备缺失场景下的 `HIGH WARNING` 告警与降级策略

## 未覆盖/限制
- DebugServer 若未启动，真实设备 E2E 将失败
- 实机 ADB 设备兼容性
- 性能与资源占用基准测试
- 云端 mock 兜底不覆盖设备端真实执行行为

## 维护建议
- 每次修改核心逻辑或 IPC 链路，补充对应单测与集成用例
- E2E 用例可先覆盖关键路径，稳定后逐步扩展
- 持续检查覆盖率阈值（lines/statements/functions 65%，branches 55%）
