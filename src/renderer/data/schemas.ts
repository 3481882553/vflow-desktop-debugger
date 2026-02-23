import { InputDefinition } from "../domain/vflowTypes";

export const PARAM_SCHEMAS: Record<string, InputDefinition[]> = {
  "vflow.device.delay": [{ id: "duration", name: "延迟时间(ms)", staticType: "number", required: true, min: 0 }],
  "vflow.interaction.screen_operation": [
    { id: "operation_type", name: "操作类型", staticType: "enum", options: ["点击", "长按", "滑动"], required: true },
    { id: "target", name: "目标/起点", staticType: "string", required: true, description: "支持坐标(x,y)或元素ID" },
    { id: "target_end", name: "滑动终点", staticType: "string", description: "仅在滑动操作时需要", visibility: { type: "eq", dependsOn: "operation_type", value: "滑动" } },
    { id: "duration", name: "持续时间(ms)", staticType: "number", min: 0, description: "0表示采用默认" },
    { id: "execution_mode", name: "执行方式", staticType: "enum", options: ["自动", "无障碍", "Shell"], isFolded: true }
  ],
  "vflow.interaction.input.text": [{ id: "text", name: "输入文本", staticType: "string", required: true }],
  "vflow.data.text.replace": [
    { id: "text", name: "原始文本", staticType: "string", required: true },
    { id: "target", name: "查找内容", staticType: "string", required: true },
    { id: "replacement", name: "替换为", staticType: "string" },
    { id: "is_regex", name: "正则表达式", staticType: "boolean" }
  ],
  "vflow.data.text.split": [
    { id: "text", name: "原始文本", staticType: "string", required: true },
    { id: "delimiter", name: "分隔符", staticType: "string", required: true }
  ],
  "vflow.logic.loop.start": [
    { id: "count", name: "循环次数", staticType: "number", min: 0, description: "0表示无限循环" }
  ],
  "vflow.logic.jump": [
    { id: "target_index", name: "跳转目标(索引)", staticType: "number", min: 0 }
  ],
  "vflow.network.get.ip": [
    { id: "type", name: "类型", staticType: "enum", required: true, options: ["本地", "外部"] },
    { id: "ip_version", name: "IP 版本", staticType: "enum", required: true, options: ["IPv4", "IPv6"] }
  ],
  "vflow.network.http.request": [
    { id: "url", name: "请求 URL", staticType: "string", required: true },
    { id: "method", name: "HTTP 方法", staticType: "enum", required: true, options: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
    { id: "headers", name: "请求头(JSON)", staticType: "string" },
    { id: "query_params", name: "查询参数(JSON)", staticType: "string" },
    { id: "timeout", name: "超时时间(秒)", staticType: "number", min: 0 },
    { id: "body_type", name: "请求体类型", staticType: "enum", options: ["无", "JSON", "表单", "原始文本", "文件"] },
    { id: "body", name: "请求体", staticType: "string" }
  ],
  "vflow.ai.completion": [
    { id: "provider", name: "服务商", staticType: "enum", options: ["OpenAI", "DeepSeek", "自定义"] },
    { id: "base_url", name: "Base URL", staticType: "string" },
    { id: "api_key", name: "API Key", staticType: "string", required: true },
    { id: "model", name: "模型", staticType: "string" },
    { id: "prompt", name: "提示词", staticType: "string" },
    { id: "temperature", name: "Temperature", staticType: "number", min: 0, max: 2 },
    { id: "system_prompt", name: "系统提示词", staticType: "string" }
  ],
  "vflow.network.feishu.upload": [
    { id: "access_token", name: "访问 Token", staticType: "string", required: true },
    { id: "file_name", name: "文件名", staticType: "string", required: true },
    { id: "file", name: "文件", staticType: "string" },
    { id: "parent_type", name: "父节点类型", staticType: "enum", options: ["doc_image", "docx_image", "sheet_image", "doc_file", "docx_file", "sheet_file", "bitable_image", "bitable_file"] },
    { id: "parent_node", name: "父节点 ID", staticType: "string" },
    { id: "extra", name: "额外参数(JSON)", staticType: "string" },
    { id: "timeout", name: "超时时间(秒)", staticType: "number", min: 0 }
  ],
  "vflow.system.wifi": [{ id: "state", name: "Wi-Fi 状态", staticType: "enum", required: true, options: ["开启", "关闭", "切换"] }],
  "vflow.system.bluetooth": [{ id: "state", name: "蓝牙状态", staticType: "enum", required: true, options: ["开启", "关闭", "切换"] }],
  "vflow.system.wake.screen": [],
  "vflow.system.sleep.screen": [],
  "vflow.system.share": [{ id: "content", name: "分享内容", staticType: "string" }],
  "vflow.system.set.clipboard": [{ id: "content", name: "内容", staticType: "string" }],
  "vflow.system.get.clipboard": [],
  "vflow.system.launch.app": [
    { id: "packageName", name: "应用包名", staticType: "string", required: true },
    { id: "activityName", name: "Activity 名称", staticType: "string" }
  ],
  "vflow.system.js": [
    { id: "script", name: "JavaScript 脚本", staticType: "string", required: true },
    { id: "inputs", name: "脚本输入(JSON)", staticType: "string" }
  ],
  "vflow.system.systeminfo": [{ id: "infotype", name: "信息类型", staticType: "enum", required: true, options: ["设备型号", "设备厂商", "安卓版本", "SDK版本", "安全补丁"] }],
  "vflow.system.read.sms": [
    { id: "filter_by", name: "筛选方式", staticType: "enum", required: true, options: ["最新一条", "来自发件人", "包含内容", "发件人与内容"] },
    { id: "sender", name: "发件人号码", staticType: "string" },
    { id: "content", name: "内容包含", staticType: "string" },
    { id: "max_scan", name: "扫描数量", staticType: "number", min: 1 },
    { id: "extract_code", name: "提取验证码", staticType: "boolean" }
  ],
  "vflow.system.delay": [{ id: "duration", name: "延迟时间(ms)", staticType: "number", required: true, min: 0 }],
  "vflow.system.close.app": [{ id: "packageName", name: "应用包名", staticType: "string", required: true }],
  "vflow.system.get.usage.stats": [
    { id: "interval", name: "时间范围", staticType: "enum", options: ["今天", "过去24小时", "本周", "本月", "本年"] },
    { id: "max_results", name: "最大结果数", staticType: "number", min: 1 }
  ],
  "vflow.system.brightness": [{ id: "brightness_level", name: "亮度值 (0-255)", staticType: "number", min: 0, max: 255, inputStyle: "slider", sliderConfig: [0, 255, 1] }],
  "vflow.system.capture.screen": [
    { id: "mode", name: "模式", staticType: "enum", options: ["自动", "screencap"] },
    { id: "region", name: "区域", staticType: "string" }
  ],
  "vflow.device.vibrate": [
    { id: "pattern", name: "模式", staticType: "enum", options: ["Short", "Long", "Double", "Tick"] },
    { id: "duration", name: "时长(ms)", staticType: "number", min: 0 }
  ],
  "vflow.data.input": [
    { id: "inputType", name: "输入类型", staticType: "string", required: true },
    { id: "prompt", name: "提示信息", staticType: "string", required: true }
  ],
  "vflow.device.toast": [
    { id: "message", name: "消息内容", staticType: "string", required: true },
    { id: "duration", name: "时长", staticType: "enum", options: ["Short", "Long"] },
    { id: "position", name: "位置", staticType: "enum", options: ["Bottom", "Center", "Top"] }
  ],
  "vflow.system.invoke": [
    { id: "mode", name: "调用方式", staticType: "enum", options: ["链接/Uri", "Activity", "Broadcast", "Service"] },
    { id: "uri", name: "链接/Data", staticType: "string" },
    { id: "action", name: "Action", staticType: "string" },
    { id: "package", name: "Package", staticType: "string" },
    { id: "class", name: "Class", staticType: "string" },
    { id: "type", name: "MIME Type", staticType: "string" },
    { id: "flags", name: "Flags (Int)", staticType: "string" },
    { id: "extras", name: "扩展参数(JSON)", staticType: "string" }
  ],
  "vflow.interaction.ocr": [
    { id: "region", name: "识别区域", staticType: "string", description: "默认全屏" },
    { id: "provider", name: "识别引擎", staticType: "enum", options: ["内置", "Google MLKit", "PaddleOCR"] }
  ],
  "vflow.interaction.find.element": [
    { id: "selector", name: "UI 选择器", staticType: "string", required: true, description: "支持 ID, Text, Desc 等" },
    { id: "timeout", name: "查找超时(ms)", staticType: "number", min: 0 }
  ],
  "vflow.interaction.ui.selector": [
    { id: "package", name: "应用包名", staticType: "string" },
    { id: "resource_id", name: "资源 ID", staticType: "string" },
    { id: "text", name: "文本内容", staticType: "string" },
    { id: "description", name: "描述内容", staticType: "string" },
    { id: "className", name: "类名", staticType: "string" }
  ],
  "vflow.system.lua": [
    { id: "script", name: "Lua 脚本", staticType: "string", required: true, inputStyle: "textarea" },
    { id: "inputs", name: "脚本输入(JSON)", staticType: "string", inputStyle: "textarea" }
  ],
  "vflow.device.play_audio": [
    { id: "audioType", name: "音频类型", staticType: "enum", options: ["system", "local"] },
    { id: "systemSound", name: "系统音频", staticType: "enum", options: ["notification", "alarm", "ringtone", "notification_2", "notification_3", "notification_4", "notification_5"] },
    { id: "localFile", name: "本地文件路径", staticType: "string", pickerType: "file" },
    { id: "volume", name: "音量 (%)", staticType: "number", min: 0, max: 100 },
    { id: "await", name: "等待播放完成", staticType: "boolean" }
  ],
  "vflow.data.file.operation": [
    { id: "operation", name: "操作", staticType: "enum", options: ["读取", "写入", "删除", "追加", "创建"], inputStyle: "chip_group", defaultValue: "读取" },
    { id: "file_path", name: "文件路径", staticType: "string", pickerType: "file", visibility: { type: "nin", dependsOn: "operation", values: ["创建"] } },
    { id: "directory_path", name: "目录路径", staticType: "string", pickerType: "directory", visibility: { type: "eq", dependsOn: "operation", value: "创建" } },
    { id: "content", name: "内容", staticType: "string", inputStyle: "textarea", visibility: { type: "in", dependsOn: "operation", values: ["写入", "追加", "创建"] } }
  ]
};
