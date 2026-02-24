import { ModuleSchema } from '../../domain/vflowTypes';

export const shizukuSchemas: Record<string, ModuleSchema> = {
  "vflow.shizuku.shell_command": {
    inputs: [{ id: "command", name: "命令内容", staticType: "string", required: true, acceptsMagicVariable: true }],
    outputs: [
      { id: "result", name: "输出结果", typeName: "vflow.type.string" },
      { id: "success", name: "是否成功", typeName: "vflow.type.boolean" }
    ]
  },
  "vflow.shizuku.alipay_shortcuts": {
    inputs: [{ id: "action", name: "快捷操作", staticType: "enum", options: ["扫一扫", "付钱", "收钱", "乘车码"] }],
    outputs: [{ id: "success", name: "是否启动成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.shizuku.wechat_shortcuts": {
    inputs: [{ id: "action", name: "快捷操作", staticType: "enum", options: ["扫一扫", "付款码", "我的二维码"] }],
    outputs: [{ id: "success", name: "是否启动成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.shizuku.coloros_shortcuts": {
    inputs: [{ id: "action", name: "功能", staticType: "enum", options: ["控制中心", "小布助手", "屏幕录制"] }],
    outputs: [{ id: "success", name: "是否执行成功", typeName: "vflow.type.boolean" }]
  },
  "vflow.shizuku.gemini_shortcut": {
    inputs: [{ id: "prompt", name: "提示词", staticType: "string" }],
    outputs: [{ id: "success", name: "是否吊起成功", typeName: "vflow.type.boolean" }]
  }
};
