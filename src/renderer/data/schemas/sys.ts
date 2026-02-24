import { ModuleSchema } from '../../domain/vflowTypes';

export const sysSchemas: Record<string, ModuleSchema> = {
  "vflow.data.input": {
    inputs: [
      { id: "inputType", name: "输入类型", staticType: "enum", options: ["文本", "数字", "时间", "日期"], defaultValue: "文本", inputStyle: "chip_group" },
      { id: "prompt", name: "提示信息", staticType: "string", defaultValue: "请输入", acceptsMagicVariable: true, supportsRichText: true, hint: "显示在输入框上方的提示" }
    ],
    outputs: [{ id: "userInput", name: "用户输入", typeName: "vflow.type.any" }]
  },
  "vflow.data.quick_view": {
    inputs: [{ id: "content", name: "内容", staticType: "any", acceptsMagicVariable: true, supportsRichText: true, hint: "支持富文本和变量引用" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.wifi": {
    inputs: [
      { id: "state", name: "Wi-Fi 状态", staticType: "enum", options: ["开启", "关闭", "切换"], defaultValue: "切换", inputStyle: "chip_group" },
      { id: "ssid", name: "WiFi名称", staticType: "string", hint: "可选，留空则仅切换开关" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.bluetooth": {
    inputs: [
      { id: "state", name: "蓝牙状态", staticType: "enum", options: ["开启", "关闭", "切换"], defaultValue: "切换", inputStyle: "chip_group" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.wake_screen": { inputs: [], outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }] },
  "vflow.system.sleep_screen": { inputs: [], outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }] },
  "vflow.system.share": {
    inputs: [{ id: "content", name: "分享内容", staticType: "string", acceptsMagicVariable: true, supportsRichText: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.set_clipboard": {
    inputs: [{ id: "content", name: "内容", staticType: "string", acceptsMagicVariable: true, supportsRichText: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.get_clipboard": {
    inputs: [],
    outputs: [{ id: "text_content", name: "剪贴板文本", typeName: "vflow.type.string" }]
  },
  "vflow.system.launch_app": {
    inputs: [
      { id: "packageName", name: "应用包名", staticType: "string", required: true, pickerType: "app", hint: "点击图标选择已安装的应用" },
      { id: "activityName", name: "Activity 名称", staticType: "string", defaultValue: "LAUNCH", pickerType: "activity", hint: "可选，常用 LAUNCH 代表主界面" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.close_app": {
    inputs: [
      { id: "packageName", name: "应用包名", staticType: "string", required: true, pickerType: "app" },
      { id: "activityName", name: "Activity 名称", staticType: "string", isHidden: true }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.get_usage_stats": {
    inputs: [{ id: "interval", name: "时间范围", staticType: "enum", options: ["今天", "过去24小时", "本周"], defaultValue: "今天", inputStyle: "chip_group" }],
    outputs: [{ id: "usage_stats", name: "使用统计", typeName: "vflow.type.list" }]
  },
  "vflow.system.read_sms": {
    inputs: [
      { id: "filter_by", name: "筛选方式", staticType: "enum", options: ["最新一条", "来自发件人", "包含内容", "发件人与内容"], defaultValue: "最新一条", inputStyle: "chip_group" },
      { id: "sender", name: "发件人号码", staticType: "string", visibility: { type: "or", conditions: [{ type: "eq", dependsOn: "filter_by", value: "来自发件人" }, { type: "eq", dependsOn: "filter_by", value: "发件人与内容" }] }, hint: "支持部分匹配" },
      { id: "content", name: "内容包含", staticType: "string", visibility: { type: "or", conditions: [{ type: "eq", dependsOn: "filter_by", value: "包含内容" }, { type: "eq", dependsOn: "filter_by", value: "发件人与内容" }] }, hint: "支持模糊匹配" },
      { id: "max_scan", name: "扫描数量", staticType: "number", defaultValue: 20, isFolded: true },
      { id: "extract_code", name: "提取验证码", staticType: "boolean", defaultValue: false, inputStyle: "switch" }
    ],
    outputs: [
      { id: "found", name: "是否找到", typeName: "vflow.type.boolean" },
      { id: "sender", name: "发件人号码", typeName: "vflow.type.string" },
      { id: "content", name: "短信内容", typeName: "vflow.type.string" },
      { id: "timestamp", name: "接收时间", typeName: "vflow.type.number" },
      { id: "verification_code", name: "提取的验证码", typeName: "vflow.type.string" }
    ]
  },
  "vflow.system.capture_screen": {
    inputs: [
      { id: "mode", name: "模式", staticType: "enum", options: ["自动", "screencap"], defaultValue: "自动", inputStyle: "chip_group", isFolded: true },
      { id: "region", name: "区域 (可选)", staticType: "string", hint: "x1,y1,x2,y2", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.coordinate_region"] }
    ],
    outputs: [{ id: "screenshot", name: "截图数据", typeName: "vflow.type.image" }]
  },
  "vflow.system.mobile_data": {
    inputs: [{ id: "action", name: "操作", staticType: "enum", options: ["开启", "关闭", "切换"], defaultValue: "切换", inputStyle: "chip_group" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.brightness": {
    inputs: [{ id: "brightness_level", name: "亮度值 (0-255)", staticType: "number", min: 0, max: 255, sliderConfig: [0, 255, 1], hint: "0 为最暗, 255 为最亮" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.lua": { inputs: [{ id: "script", name: "Lua 脚本", staticType: "string", inputStyle: "textarea", hint: "编写 Lua 代码进行高级控制" }], outputs: [] },
  "vflow.system.js": { inputs: [{ id: "script", name: "JavaScript", staticType: "string", inputStyle: "textarea", hint: "编写 JS 代码" }], outputs: [] },
  "vflow.system.invoke": {
    inputs: [{ id: "uri", name: "URI", staticType: "string", hint: "intent:// 或其他链接" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.play_audio": {
    inputs: [{ id: "localFile", name: "本地文件路径", staticType: "string", required: true, pickerType: "media", hint: "选择音频文件" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.network.get_ip": {
    inputs: [{ id: "type", name: "类型", staticType: "enum", options: ["本地", "外部"], defaultValue: "本地", inputStyle: "chip_group" }],
    outputs: [{ id: "ip", name: "IP地址", typeName: "vflow.type.string" }]
  },
  "vflow.network.http_request": {
    inputs: [
      { id: "url", name: "请求 URL", staticType: "string", required: true, hint: "https://example.com", acceptsMagicVariable: true },
      { id: "method", name: "方法", staticType: "enum", options: ["GET", "POST", "PUT", "DELETE"], defaultValue: "GET", inputStyle: "chip_group" }
    ],
    outputs: [{ id: "response", name: "响应内容", typeName: "vflow.type.string" }]
  },
  "vflow.notification.send_notification": {
    inputs: [
      { id: "title", name: "标题", staticType: "string", defaultValue: "vFlow 提醒", acceptsMagicVariable: true, supportsRichText: true },
      { id: "message", name: "内容", staticType: "string", required: true, acceptsMagicVariable: true, supportsRichText: true, hint: "推送消息的具体正文" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.network.feishu_upload": {
    inputs: [
      { id: "access_token", name: "访问令牌", staticType: "string", acceptsMagicVariable: true, supportsRichText: true, hint: "飞书应用的 access_token 或 user_access_token" },
      { id: "file", name: "文件", staticType: "any", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"], hint: "选择或引用要上传的图片文件" },
      { id: "file_name", name: "文件名", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true, hint: "留空则使用原始文件名" },
      { id: "parent_type", name: "上传点类型", staticType: "enum", defaultValue: "docx_image", options: ["doc_image", "docx_image", "sheet_image", "doc_file", "docx_file", "sheet_file", "bitable_image", "bitable_file"] },
      { id: "parent_node", name: "文档 Token", staticType: "string", acceptsMagicVariable: true, supportsRichText: true, hint: "要上传到的云文档 token" },
      { id: "extra", name: "额外参数", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true, isFolded: true, hint: "JSON 格式，如 {\"drive_route_token\":\"xxx\"}" },
      { id: "timeout", name: "超时(秒)", staticType: "number", defaultValue: 30, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"], isFolded: true }
    ],
    outputs: [
      { id: "file_token", name: "文件 Token", typeName: "vflow.type.string" },
      { id: "code", name: "响应码", typeName: "vflow.type.number" },
      { id: "msg", name: "响应消息", typeName: "vflow.type.string" }
    ]
  },
  "vflow.notification.find": {
    inputs: [
      { id: "app_filter", name: "应用包名", staticType: "string" },
      { id: "title_filter", name: "标题包含", staticType: "string" },
      { id: "content_filter", name: "内容包含", staticType: "string" }
    ],
    outputs: [{ id: "notifications", name: "找到的通知", typeName: "vflow.type.list", listElementType: "vflow.type.notification" }]
  },
  "vflow.notification.remove": {
    inputs: [{ id: "target", name: "目标通知", staticType: "any", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.notification", "vflow.type.list"] }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.system.systeminfo": {
    inputs: [{ id: "infotype", name: "信息类型", staticType: "enum", options: ["设备型号", "设备厂商", "安卓版本", "SDK版本", "安全补丁"], defaultValue: "设备型号" }],
    outputs: [{ id: "sysinfo", name: "系统信息", typeName: "vflow.type.string" }]
  }
};
