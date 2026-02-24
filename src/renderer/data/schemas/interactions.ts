import { ModuleSchema } from '../../domain/vflowTypes';

export const interactionSchemas: Record<string, ModuleSchema> = {
  "vflow.device.click": {
    inputs: [
      { id: "target", name: "目标 (控件ID或坐标)", staticType: "string", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.screen_element", "vflow.type.coordinate", "vflow.type.string"], hint: "控件ID, 或 x,y 坐标" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.device.find.text": {
    inputs: [
      { id: "matchMode", name: "匹配模式", staticType: "enum", options: ["完全匹配", "包含", "正则"], defaultValue: "完全匹配", inputStyle: "chip_group" },
      { id: "targetText", name: "目标文本", staticType: "string", required: true, acceptsMagicVariable: true, supportsRichText: true, hint: "支持引用变量或直接输入" },
      { id: "outputFormat", name: "输出格式", staticType: "enum", options: ["元素", "坐标", "视图ID"], defaultValue: "元素", inputStyle: "chip_group" }
    ],
    outputs: [
      { id: "first_result", name: "第一个结果", typeName: "vflow.type.any" },
      { id: "all_results", name: "所有结果", typeName: "vflow.type.list" },
      { id: "count", name: "结果数量", typeName: "vflow.type.number" }
    ]
  },
  "vflow.device.send_key_event": {
    inputs: [{ id: "key_action", name: "全局操作", staticType: "enum", options: ["返回", "主屏幕", "最近任务", "通知中心", "快速设置", "电源菜单"], defaultValue: "返回", inputStyle: "chip_group" }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.interaction.screen_operation": {
    inputs: [
      { id: "operation_type", name: "操作类型", staticType: "enum", options: ["点击", "长按", "滑动", "双击"], required: true, defaultValue: "点击", inputStyle: "chip_group" },
      { id: "target", name: "目标/起点", staticType: "string", required: true, hint: "x,y 或 控件ID" },
      { id: "target_end", name: "滑动终点", staticType: "string", visibility: { type: "eq", dependsOn: "operation_type", value: "滑动" }, hint: "x,y 终点坐标" },
      { id: "duration", name: "持续时间(ms)", staticType: "number", min: 0, defaultValue: 0, hint: "0 表示自动时长" },
      { id: "execution_mode", name: "执行方式", staticType: "enum", options: ["自动", "无障碍", "Shell"], defaultValue: "自动", isFolded: true, inputStyle: "dropdown" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.interaction.input_text": {
    inputs: [
      { id: "text", name: "输入文本", staticType: "string", required: true, acceptsMagicVariable: true, supportsRichText: true },
      { id: "input_method", name: "输入方式", staticType: "enum", options: ["自动", "模拟输入", "直接赋值"], defaultValue: "自动", inputStyle: "chip_group" },
      { id: "clear_first", name: "先清除内容", staticType: "boolean", defaultValue: false, inputStyle: "switch" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.interaction.find_element": {
    inputs: [
      { id: "selector", name: "UI 选择器", staticType: "string", required: true, hint: "CSS-like 或 ID 选择器" },
      { id: "timeout", name: "查找超时(ms)", staticType: "number", defaultValue: 5000, sliderConfig: [0, 30000, 500] },
      { id: "match_strategy", name: "匹配策略", staticType: "enum", options: ["精确匹配", "模糊匹配", "正则匹配"], defaultValue: "精确匹配", inputStyle: "chip_group" }
    ],
    outputs: [
      { id: "element", name: "找到的元素", typeName: "vflow.type.screen_element" },
      { id: "found", name: "是否找到", typeName: "vflow.type.boolean" }
    ]
  },
  "vflow.interaction.ui_selector": {
    inputs: [
      { id: "package", name: "应用包名", staticType: "string", pickerType: "app" },
      { id: "resource_id", name: "资源 ID", staticType: "string" },
      { id: "text", name: "文本内容", staticType: "string", acceptsMagicVariable: true },
      { id: "description", name: "描述内容", staticType: "string" },
      { id: "className", name: "类名", staticType: "string" }
    ],
    outputs: [
      { id: "elements", name: "匹配元素列表", typeName: "vflow.type.list" },
      { id: "match_count", name: "匹配数量", typeName: "vflow.type.number" }
    ]
  },
  "vflow.interaction.ocr": {
    inputs: [
      { id: "image", name: "输入图片", staticType: "any", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"], hint: "必填，建议引用上游截图模块输出" },
      { id: "mode", name: "模式", staticType: "enum", options: ["识别全文", "查找文本"], defaultValue: "识别全文", inputStyle: "chip_group" },
      { id: "target_text", name: "查找内容", staticType: "string", acceptsMagicVariable: true, supportsRichText: true, visibility: { type: "eq", dependsOn: "mode", value: "查找文本" } },
      { id: "language", name: "识别语言", staticType: "enum", options: ["中英混合", "中文", "英文"], defaultValue: "中英混合", isFolded: true, inputStyle: "chip_group" },
      { id: "search_strategy", name: "查找策略", staticType: "enum", options: ["默认 (从上到下)", "最接近中心", "置信度最高"], defaultValue: "默认 (从上到下)", isFolded: true, inputStyle: "dropdown" },
      { id: "region", name: "识别区域", staticType: "any", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.coordinate_region"], isFolded: true }
    ],
    outputs: [
      { id: "success", name: "是否成功", typeName: "vflow.type.boolean" },
      { id: "full_text", name: "识别到的文字", typeName: "vflow.type.string" },
      { id: "found", name: "是否找到", typeName: "vflow.type.boolean" },
      { id: "count", name: "找到数量", typeName: "vflow.type.number" },
      { id: "first_match", name: "结果区域", typeName: "vflow.type.coordinate_region" },
      { id: "first_center", name: "结果中心", typeName: "vflow.type.coordinate" }
    ]
  },
  "vflow.interaction.get_current_activity": {
    inputs: [],
    outputs: [{ id: "package_name", name: "包名", typeName: "vflow.type.string" }, { id: "activity_name", name: "Activity名称", typeName: "vflow.type.string" }]
  },
  "vflow.interaction.operit": {
    inputs: [{ id: "prompt", name: "指令", staticType: "string", required: true, acceptsMagicVariable: true, supportsRichText: true, hint: "描述你希望 AI 执行的操作" }, { id: "max_steps", name: "最大步数", staticType: "number", defaultValue: 20, isFolded: true }],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.device.delay": {
    inputs: [
      {
        id: "duration",
        name: "延迟时间",
        staticType: "number",
        defaultValue: 1000,
        acceptsMagicVariable: true,
        acceptedMagicVariableTypes: ["vflow.type.number"]
      }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.device.toast": {
    inputs: [
      {
        id: "message",
        name: "消息内容",
        staticType: "string",
        defaultValue: "Hello, vFlow!",
        acceptsMagicVariable: true,
        acceptsNamedVariable: true,
        acceptedMagicVariableTypes: ["vflow.type.string"],
        supportsRichText: true
      }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.device.play_audio": {
    inputs: [
      { id: "audioType", name: "音频类型", staticType: "enum", options: ["system", "local"], defaultValue: "system" },
      { id: "systemSound", name: "系统音频", staticType: "enum", defaultValue: "notification", options: ["notification", "alarm", "ringtone", "notification_2", "notification_3", "notification_4", "notification_5"], visibility: { type: "eq", dependsOn: "audioType", value: "system" } },
      { id: "localFile", name: "本地文件路径", staticType: "string", defaultValue: "", acceptsMagicVariable: true, acceptsNamedVariable: true, acceptedMagicVariableTypes: ["vflow.type.string"], visibility: { type: "eq", dependsOn: "audioType", value: "local" } },
      { id: "volume", name: "音量 (%)", staticType: "number", defaultValue: 100 },
      { id: "await", name: "等待播放完成", staticType: "boolean", defaultValue: true, inputStyle: "switch" }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.interaction.find_image": {
    inputs: [
      { id: "template_uri", name: "模板图片", staticType: "string", defaultValue: "" },
      { id: "threshold", name: "匹配相似度", staticType: "enum", defaultValue: "80% (推荐)", options: ["90% (精确)", "80% (推荐)", "70% (宽松)", "60% (模糊)"] },
      { id: "screenshot_uri", name: "输入截图 (可选)", staticType: "any", defaultValue: null, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.image"], hint: "留空则使用自动截图，或连接图片变量", isFolded: true }
    ],
    outputs: [
      { id: "first_result", name: "最相似坐标", typeName: "vflow.type.coordinate", conditionalOptions: [{ displayName: "找到", value: "找到" }, { displayName: "未找到", value: "未找到" }] },
      { id: "all_results", name: "所有结果", typeName: "vflow.type.list", listElementType: "vflow.type.coordinate", conditionalOptions: [{ displayName: "找到", value: "找到" }, { displayName: "未找到", value: "未找到" }] },
      { id: "count", name: "结果数量", typeName: "vflow.type.number", conditionalOptions: [{ displayName: "找到", value: "找到" }, { displayName: "未找到", value: "未找到" }] }
    ]
  },
  "vflow.interaction.find_until": {
    inputs: [
      { id: "targetText", name: "目标文本", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true },
      { id: "matchMode", name: "匹配模式", staticType: "enum", defaultValue: "包含", options: ["包含", "完全匹配", "正则"] },
      { id: "timeout", name: "超时时间(秒)", staticType: "number", defaultValue: 10, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"] },
      { id: "searchMode", name: "查找模式", staticType: "enum", defaultValue: "自动", options: ["自动", "无障碍", "OCR"], isFolded: true },
      { id: "interval", name: "轮询间隔(ms)", staticType: "number", defaultValue: 1000, acceptsMagicVariable: true, isFolded: true }
    ],
    outputs: [
      { id: "success", name: "是否找到", typeName: "vflow.type.boolean" },
      { id: "element", name: "找到的元素", typeName: "vflow.type.screen_element" },
      { id: "coordinate", name: "中心坐标", typeName: "vflow.type.coordinate" }
    ]
  },
  "vflow.snippet.find_until": {
    inputs: [
      { id: "targetText", name: "目标文本", staticType: "string", defaultValue: "", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.string"] },
      { id: "delay", name: "延迟（毫秒）", staticType: "number", defaultValue: 1000 }
    ],
    outputs: [{ id: "result", name: "找到的元素", typeName: "vflow.type.screen_element" }]
  }
};

export const uiSchemas: Record<string, ModuleSchema> = {
  "vflow.ui.activity.start": {
    inputs: [
      { id: "title", name: "标题", staticType: "string", defaultValue: "用户界面", acceptsMagicVariable: true, supportsRichText: true },
      { id: "destroy_on_exit", name: "退出随即销毁", staticType: "boolean", defaultValue: true, inputStyle: "switch" }
    ],
    outputs: []
  },
  "vflow.ui.activity.show": { inputs: [], outputs: [] },
  "vflow.ui.activity.end": { inputs: [], outputs: [] },
  "vflow.ui.float.start": {
    inputs: [{ id: "title", name: "标题", staticType: "string", defaultValue: "悬浮窗", acceptsMagicVariable: true, supportsRichText: true }],
    outputs: []
  },
  "vflow.ui.float.show": { inputs: [], outputs: [] },
  "vflow.ui.float.end": { inputs: [], outputs: [] },
  "vflow.ui.component.text": {
    inputs: [{ id: "content", name: "内容", staticType: "string", required: true, acceptsMagicVariable: true, supportsRichText: true, hint: "支持富文本和变量引用" }, { id: "key", name: "组件 ID", staticType: "string", isHidden: true }],
    outputs: [{ id: "id", name: "组件 ID", typeName: "vflow.type.string" }]
  },
  "vflow.ui.component.button": {
    inputs: [
      { id: "key", name: "ID (事件源)", staticType: "string", defaultValue: "btn1", required: true, hint: "用于在监听到点击时区分来源" },
      { id: "text", name: "按钮文字", staticType: "string", defaultValue: "确定", acceptsMagicVariable: true },
      { id: "trigger_event", name: "仅触发事件 (不关闭)", staticType: "boolean", defaultValue: true, inputStyle: "switch" }
    ],
    outputs: [{ id: "id", name: "组件 ID", typeName: "vflow.type.string" }]
  },
  "vflow.ui.component.input": {
    inputs: [{ id: "key", name: "ID (数据键名)", staticType: "string", required: true, hint: "提交后将通过此键名获取用户输入" }, { id: "label", name: "标签文字", staticType: "string" }, { id: "placeholder", name: "占位文字", staticType: "string", hint: "输入前的提示语" }],
    outputs: [{ id: "id", name: "组件 ID", typeName: "vflow.type.string" }]
  },
  "vflow.ui.component.switch": {
    inputs: [{ id: "key", name: "ID (数据键名)", staticType: "string", required: true }, { id: "label", name: "标签文字", staticType: "string" }, { id: "default_value", name: "默认状态", staticType: "boolean", defaultValue: false, inputStyle: "switch" }],
    outputs: [{ id: "id", name: "组件 ID", typeName: "vflow.type.string" }]
  },
  "vflow.ui.on_event.start": {
    inputs: [{ id: "event_source", name: "组件 ID", staticType: "string", required: true, hint: "填写按钮或输入的 ID" }, { id: "event_type", name: "事件类型", staticType: "enum", options: ["点击", "值改变"], defaultValue: "点击", inputStyle: "chip_group" }],
    outputs: []
  },
  "vflow.ui.on_event.end": { inputs: [], outputs: [] },
  "vflow.ui.interaction.update": {
    inputs: [
      { id: "key", name: "组件 ID", staticType: "string", required: true },
      { id: "property", name: "属性名", staticType: "string", required: true, hint: "如: text, enabled, visibility" },
      { id: "value", name: "新值", staticType: "any", required: true, acceptsMagicVariable: true }
    ],
    outputs: [{ id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.ui.interaction.get_value": {
    inputs: [{ id: "key", name: "组件 ID", staticType: "string", required: true }],
    outputs: [{ id: "value", name: "当前值", typeName: "vflow.type.any" }]
  },
  "vflow.ui.interaction.exit": {
    inputs: [],
    outputs: []
  }
};

export const aiSchemas: Record<string, ModuleSchema> = {
  "vflow.ai.completion": {
    inputs: [
      { id: "provider", name: "服务商", staticType: "enum", options: ["OpenAI", "DeepSeek", "自定义"], defaultValue: "DeepSeek", inputStyle: "chip_group" },
      { id: "api_key", name: "API Key", staticType: "string", required: true, hint: "密钥信息会被加密保存" },
      { id: "model", name: "模型", staticType: "string", defaultValue: "deepseek-chat" },
      { id: "prompt", name: "提示词", staticType: "string", required: true, acceptsMagicVariable: true, supportsRichText: true, hint: "描述任务，支持嵌入上游 OCR 结果" }
    ],
    outputs: [{ id: "result", name: "回答内容", typeName: "vflow.type.string" }, { id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.ai.agent": {
    inputs: [
      { id: "provider", name: "服务商", staticType: "enum", options: ["智谱", "阿里云百炼", "自定义"], defaultValue: "智谱", inputStyle: "chip_group" },
      { id: "api_key", name: "API Key", staticType: "string", required: true },
      { id: "instruction", name: "任务指令", staticType: "string", required: true, acceptsMagicVariable: true, supportsRichText: true },
      { id: "max_steps", name: "最大步数", staticType: "number", defaultValue: 15, isFolded: true }
    ],
    outputs: [{ id: "result", name: "最终结果", typeName: "vflow.type.string" }, { id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.ai.autoglm": {
    inputs: [
      { id: "provider", name: "服务商", staticType: "enum", defaultValue: "智谱", options: ["智谱", "自定义"] },
      { id: "base_url", name: "Base URL", staticType: "string", defaultValue: "https://open.bigmodel.cn/api/paas/v4" },
      { id: "api_key", name: "API Key", staticType: "string", defaultValue: "" },
      { id: "model", name: "模型", staticType: "string", defaultValue: "autoglm-phone" },
      { id: "instruction", name: "指令", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true },
      { id: "max_steps", name: "最大步数", staticType: "number", defaultValue: 30 },
      { id: "display_mode", name: "执行环境", staticType: "enum", defaultValue: "主屏幕", options: ["主屏幕", "虚拟屏幕 (后台)"] }
    ],
    outputs: [{ id: "result", name: "最终结果", typeName: "vflow.type.string" }, { id: "success", name: "是否成功", typeName: "vflow.type.boolean" }]
  }
};
