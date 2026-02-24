import { ModuleSchema } from '../../domain/vflowTypes';

export const coreBetaSchemas: Record<string, ModuleSchema> = {
  "vflow.core.bluetooth": {
    inputs: [{ id: "action", name: "操作", staticType: "enum", options: ["开启", "关闭", "切换"], defaultValue: "切换" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.bluetooth_state": { inputs: [], outputs: [{ id: "enabled", name: "蓝牙是否开启", typeName: "vflow.type.boolean" }] },
  "vflow.core.wifi": {
    inputs: [{ id: "action", name: "操作", staticType: "enum", options: ["开启", "关闭", "切换"], defaultValue: "切换" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.wifi_state": { inputs: [], outputs: [{ id: "enabled", name: "WiFi是否开启", typeName: "vflow.type.boolean" }] },
  "vflow.core.nfc": {
    inputs: [{ id: "action", name: "操作", staticType: "enum", options: ["开启", "关闭", "切换"], defaultValue: "切换" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.nfc_state": { inputs: [], outputs: [{ id: "enabled", name: "NFC是否开启", typeName: "vflow.type.boolean" }] },
  "vflow.core.set_clipboard": {
    inputs: [{ id: "content", name: "文本内容", staticType: "string", acceptsMagicVariable: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.get_clipboard": {
    inputs: [],
    outputs: [{ id: "text", name: "剪贴板文本", typeName: "vflow.type.string" }]
  },
  "vflow.core.wake_screen": { inputs: [], outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }] },
  "vflow.core.sleep_screen": { inputs: [], outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }] },
  "vflow.core.screen_status": { inputs: [], outputs: [{ id: "is_on", name: "屏幕是否点亮", typeName: "vflow.type.boolean" }] },
  "vflow.core.capture_screen": {
    inputs: [],
    outputs: [{ id: "image", name: "截图数据", typeName: "vflow.type.image" }]
  },
  "vflow.core.screen_operation": {
    inputs: [
      { id: "operation_type", name: "操作类型", staticType: "enum", options: ["点击", "长按", "滑动"], defaultValue: "点击" },
      { id: "target", name: "目标坐标", staticType: "string", required: true }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.input_text": {
    inputs: [{ id: "text", name: "输入文本", staticType: "string", required: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.press_key": {
    inputs: [{ id: "key_code", name: "键码", staticType: "number", required: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.touch_replay": {
    inputs: [{ id: "file_path", name: "脚本路径", staticType: "string", required: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.force_stop_app": {
    inputs: [{ id: "package_name", name: "包名", staticType: "string", required: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.core.shell_command": {
    inputs: [{ id: "command", name: "命令", staticType: "string", required: true }],
    outputs: [{ id: "result", name: "执行结果", typeName: "vflow.type.string" }]
  },
  "vflow.core.volume": {
    inputs: [
      { id: "stream_type", name: "类型", staticType: "enum", options: ["媒体", "铃声", "通知", "闹钟", "通话", "系统"] },
      { id: "action", name: "操作", staticType: "enum", options: ["设置", "获取"] },
      { id: "level", name: "音量值", staticType: "number" }
    ],
    outputs: [{ id: "current_volume", name: "当前音量", typeName: "vflow.type.number" }]
  },
  "vflow.core.volume_state": {
    inputs: [{ id: "stream_type", name: "类型", staticType: "enum", options: ["媒体", "铃声", "音量"] }],
    outputs: [{ id: "volume", name: "当前音量", typeName: "vflow.type.number" }]
  }
};
