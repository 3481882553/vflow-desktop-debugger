import { ModuleSchema } from '../../domain/vflowTypes';

export const triggerSchemas: Record<string, ModuleSchema> = {
  "vflow.trigger.manual": { inputs: [], outputs: [] },
  "vflow.trigger.receive_share": { 
    inputs: [{ id: "mime_type", name: "匹配类型", staticType: "string", defaultValue: "*/*", hint: "如 text/plain, image/*" }], 
    outputs: [{ id: "shared_content", name: "分享内容", typeName: "vflow.type.any" }] 
  },
  "vflow.trigger.app_start": {
    inputs: [
      { id: "event", name: "事件", staticType: "enum", options: ["打开时", "关闭时"], defaultValue: "打开时", inputStyle: "chip_group" },
      { id: "packageNames", name: "应用列表", staticType: "any", pickerType: "app", hint: "可选择多个应用" }
    ],
    outputs: [{ id: "package_name", name: "触发应用包名", typeName: "vflow.type.string" }]
  },
  "vflow.trigger.key_event": {
    inputs: [{ id: "key_code", name: "按键", staticType: "enum", options: ["音量上", "音量下", "电源键"], defaultValue: "音量上", inputStyle: "chip_group" }],
    outputs: []
  },
  "vflow.trigger.time": {
    inputs: [
      { id: "time", name: "触发时间", staticType: "string", defaultValue: "09:00", pickerType: "time", hint: "时:分" },
      { id: "days", name: "重复周期", staticType: "any", defaultValue: [1, 2, 3, 4, 5, 6, 7], hint: "选择星期" }
    ],
    outputs: []
  },
  "vflow.trigger.battery": {
    inputs: [
      { id: "above_or_below", name: "触发条件", staticType: "enum", options: ["below", "above"], defaultValue: "below", inputStyle: "chip_group" },
      { id: "level", name: "电量阈值", staticType: "number", defaultValue: 50, sliderConfig: [0, 100, 1] }
    ],
    outputs: [{ id: "current_level", name: "当前电量", typeName: "vflow.type.number" }]
  },
  "vflow.trigger.wifi": {
    inputs: [
      { id: "state", name: "Wi-Fi 状态", staticType: "enum", options: ["已连接", "已断开"], defaultValue: "已连接", inputStyle: "chip_group" },
      { id: "ssid", name: "指定 SSID", staticType: "string", hint: "可选，匹配特定 WiFi" }
    ],
    outputs: [{ id: "current_ssid", name: "当前 SSID", typeName: "vflow.type.string" }]
  },
  "vflow.trigger.bluetooth": {
    inputs: [{ id: "state", name: "蓝牙状态", staticType: "enum", options: ["已连接", "已断开"], defaultValue: "已连接", inputStyle: "chip_group" }],
    outputs: [{ id: "device_name", name: "设备名称", typeName: "vflow.type.string" }]
  },
  "vflow.trigger.sms": {
    inputs: [{ id: "sender", name: "来自号码", staticType: "string", hint: "可选" }, { id: "keyword", name: "包含关键字", staticType: "string", hint: "可选" }],
    outputs: [{ id: "content", name: "短信内容", typeName: "vflow.type.string" }, { id: "sender", name: "发件人", typeName: "vflow.type.string" }]
  },
  "vflow.trigger.call": {
    inputs: [{ id: "event", name: "通话事件", staticType: "enum", options: ["来电", "挂断", "接通"], defaultValue: "来电", inputStyle: "chip_group" }],
    outputs: [{ id: "number", name: "对方号码", typeName: "vflow.type.string" }]
  },
  "vflow.trigger.notification": {
    inputs: [{ id: "packageName", name: "应用筛选", staticType: "string", pickerType: "app" }, { id: "keyword", name: "内容关键字", staticType: "string" }],
    outputs: [{ id: "title", name: "通知标题", typeName: "vflow.type.string" }, { id: "text", name: "通知正文", typeName: "vflow.type.string" }]
  },
  "vflow.trigger.element": {
    inputs: [{ id: "selector", name: "UI 选择器", staticType: "string", required: true }, { id: "action_type", name: "监听动作", staticType: "enum", options: ["出现", "消失", "点击"], defaultValue: "出现", inputStyle: "chip_group" }],
    outputs: [{ id: "element", name: "触发元素", typeName: "vflow.type.screen_element" }]
  },
  "vflow.trigger.gkd": {
    inputs: [{ id: "rule", name: "GKD 规则 ID", staticType: "string", required: true }],
    outputs: [{ id: "match_info", name: "匹配详情", typeName: "vflow.type.string" }]
  },
  "vflow.trigger.location": {
    inputs: [
      { id: "event", name: "事件", staticType: "enum", options: ["进入区域", "离开区域"], defaultValue: "进入区域", inputStyle: "chip_group" },
      { id: "latitude", name: "纬度", staticType: "number" },
      { id: "longitude", name: "经度", staticType: "number" },
      { id: "radius", name: "半径 (米)", staticType: "number", defaultValue: 500 }
    ],
    outputs: []
  },
  "vflow.trigger.share": {
    inputs: [
      {
        id: "acceptedType",
        name: "接收内容类型",
        staticType: "enum",
        options: ["任意", "文本", "链接", "图片", "文件"],
        defaultValue: "任意"
      }
    ],
    outputs: [
      {
        id: "shared_content",
        name: "分享的内容",
        typeName: "vflow.type.any",
        conditionalOptions: [
          { displayName: "文本", value: "文本" },
          { displayName: "链接", value: "链接" },
          { displayName: "图片", value: "图片" },
          { displayName: "文件", value: "文件" },
          { displayName: "任意", value: "任意" }
        ]
      }
    ]
  }
};
