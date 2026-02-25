# 测试用例集（Test Cases）

## A. 核心逻辑单测

### A1. workspaceReducer
- CREATE_NEW 创建默认 workflow 与 JSON 同步
- UPDATE_WORKFLOW push undo，清空 redo
- EDIT_JSON 正确解析/错误处理
- UNDO/REDO 堆栈边界
- CLOSE_TAB 行为与 active/secondary 更新
- SWITCH_TAB 在 main/secondary 之间切换
- TOGGLE_LAYOUT 行为

### A2. moduleUtils
- guessCategory 规则映射
- getColorByCategory 默认色
- loadModuleOptions 优先级（modules_zh → modules → IPC → fallback）
- loadUsageCounts/saveUsageCounts 持久化
- applyUsageCounts 合并计数

### A3. useSchemas
- migrateSchema 字段迁移（name/type/options/hint/isFolded）
- localStorage 读取与写入
- syncSchemas 成功/失败路径

## B. 主进程集成测试

### B1. AdbClient
- checkDeviceConnected 正常/无设备/异常
- forwardPort/removeForward 成功与失败

### B2. DebugClient
- connect 成功/失败
- sendWorkflow 连接状态断言
- getSchemas 超时/返回
- 协议契约：`LOG/ERROR/DONE/SCHEMAS_RESULT` 事件映射
- 协议鲁棒性：分片、粘包、脏 JSON 包容错

### B3. IPC Handlers
- debug:run 成功链
- debug:run 无设备/转发失败/连接失败/发送失败
- debug:sync-schemas 失败链
- debug:stop 正常断开

## C. E2E（关键路径）
- 多标签创建、切换、关闭
- 图形视图与 JSON 视图同步
- JSON 输入错误提示
- Debug 启动与控制台日志更新（mock IPC）

## C1. E2E（云端兜底 mock）
触发条件：
- `E2E_MODE=mock`
- 或 `E2E_MODE=auto` 且检测不到 ADB 设备

用例：
- 多标签 + 分屏
- 模块拖拽 + 属性联动
- JSON 非法输入错误提示
- 点击运行后出现“推送失败/通信异常”日志（不依赖真实设备）

## D. E2E（真实设备链路）
前置条件：
- ADB 可用，至少 1 台设备在线
- 设备端 DebugServer 启动并监听 `9999`

用例：
1. 多标签 + 分屏
   - 启动后已有默认 tab
   - 点击“新建”产生第二个 tab
   - 切换 active tab
   - 切换为 split 并选择 secondary tab
2. 模块拖拽 + 属性面板联动
   - 搜索并拖拽 `vflow.interaction.screen_operation`
   - 选中节点，属性面板出现
   - `操作类型` 选择“滑动”，`滑动终点`字段出现
3. JSON 错误提示
   - 切换到代码视图
   - 输入非法 JSON，出现错误提示
4. 真实调试推送
   - 点击“运行”
   - 控制台出现“✅ 推送成功”
   - 运行按钮变为停止按钮

## E. 设备策略与告警行为
- 无设备 + `warn_skip`
- 真实设备用例跳过
- 输出 `HIGH WARNING` 告警块
- 告警中包含接入步骤与排障命令

- 无设备 + `strict_fail`
- E2E 直接失败并返回非 0 退出码
- 日志包含设备接入指引与 DebugServer 检查提示
