# 真实设备接入与排障手册

## 目的
为真实设备 E2E 提供标准化接入步骤，降低 CI 和本地联调失败率。

## 前置条件
- 已安装 ADB，并确保 `adb` 在 PATH 中
- Android 设备已开启开发者选项和 USB 调试
- 首次连接已点击授权
- 设备端 DebugServer 已启动并监听 `9999`

## 快速接入
1. 连接设备（USB 或网络 ADB）
2. 执行 `adb kill-server`
3. 执行 `adb start-server`
4. 执行 `adb devices`
5. 确认状态为 `device`（不是 `offline` 或 `unauthorized`）
6. 执行真实链路测试：`npm run test:e2e:real`

## 常见问题
- `unauthorized`
- 重新插拔设备，在手机上重新授权 USB 调试

- `offline`
- 执行 `adb kill-server && adb start-server && adb devices`

- 无设备
- 检查 USB 数据线、驱动、设备调试状态
- 临时可执行 `npm run test:e2e:mock` 继续云端回归

- 运行失败但设备在线
- 确认设备端 DebugServer 是否运行并监听 `9999`
- 检查是否存在端口占用或转发失败

## 命令速查
- `adb devices`
- `adb kill-server`
- `adb start-server`
- `npm run test:e2e`
- `npm run test:e2e:real`
- `npm run test:e2e:release`
- `npm run test:e2e:mock`
