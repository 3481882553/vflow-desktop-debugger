import { ModuleSchema } from '../../domain/vflowTypes';

export const logicSchemas: Record<string, ModuleSchema> = {
  "vflow.logic.if.start": {
    inputs: [
      { id: "input1", name: "输入值", staticType: "any", required: true, acceptsMagicVariable: true, acceptsNamedVariable: true, hint: "待判断的变量或输出" },
      { id: "operator", name: "比较条件", staticType: "enum", options: ["存在", "不存在", "为空", "不为空", "等于", "严格等于", "不等于", "包含", "不包含", "开头是", "结尾是", "匹配正则", "大于", "大于等于", "小于", "小于等于", "介于", "为真", "为假"], defaultValue: "存在", inputStyle: "dropdown" },
      { id: "value1", name: "比较值 1", staticType: "any", visibility: { type: "nin", dependsOn: "operator", values: ["存在", "不存在", "为空", "不为空", "为真", "为假"] }, acceptsMagicVariable: true, acceptsNamedVariable: true },
      { id: "value2", name: "比较值 2", staticType: "number", visibility: { type: "eq", dependsOn: "operator", value: "介于" }, acceptsMagicVariable: true }
    ],
    outputs: [{ id: "result", name: "判断结果", typeName: "vflow.type.boolean" }]
  },
  "vflow.logic.if.middle": { inputs: [], outputs: [] },
  "vflow.logic.if.end": { inputs: [], outputs: [] },
  "vflow.logic.for_each": {
    inputs: [
      { id: "list", name: "遍历列表", staticType: "any", required: true, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.list"], hint: "选择一个列表变量" },
      { id: "item_var", name: "当前项变量名", staticType: "string", defaultValue: "item", hint: "循环内通过此名称访问当前元素" }
    ],
    outputs: [
      { id: "current_item", name: "当前元素", typeName: "vflow.type.any" },
      { id: "current_index", name: "当前索引", typeName: "vflow.type.number" }
    ]
  },
  "vflow.logic.for_each.end": { inputs: [], outputs: [] },
  "vflow.logic.loop": {
    inputs: [{ id: "count", name: "循环次数", staticType: "number", defaultValue: 10, min: 1, hint: "执行多少次" }],
    outputs: [{ id: "index", name: "当前索引", typeName: "vflow.type.number" }]
  },
  "vflow.logic.loop.end": { inputs: [], outputs: [] },
  "vflow.logic.while": {
    inputs: [
      { id: "input1", name: "监测变量", staticType: "any", required: true, acceptsMagicVariable: true },
      { id: "operator", name: "持续条件", staticType: "enum", options: ["等于", "不等于", "大于", "小于", "为真"], defaultValue: "为真", inputStyle: "chip_group" },
      { id: "value1", name: "比较值", staticType: "any", visibility: { type: "neq", dependsOn: "operator", value: "为真" }, acceptsMagicVariable: true }
    ],
    outputs: []
  },
  "vflow.logic.while.end": { inputs: [], outputs: [] },
  "vflow.logic.break": { inputs: [], outputs: [] },
  "vflow.logic.continue": { inputs: [], outputs: [] },
  "vflow.logic.stop": { inputs: [], outputs: [] },
  "vflow.logic.return": { 
    inputs: [{ id: "result", name: "返回值", staticType: "any", acceptsMagicVariable: true }], 
    outputs: [] 
  },
  "vflow.logic.call_workflow": {
    inputs: [
      { id: "workflow_id", name: "目标工作流", staticType: "string", required: true, hint: "输入工作流 ID 或路径" },
      { id: "wait_for_completion", name: "等待执行结果", staticType: "boolean", defaultValue: true, inputStyle: "switch" }
    ],
    outputs: [{ id: "result", name: "子工作流返回值", typeName: "vflow.type.any" }]
  },
  "vflow.logic.jump": {
    inputs: [{ id: "target_step_id", name: "跳转目标步骤 ID", staticType: "string", required: true }],
    outputs: []
  },
  "vflow.logic.comment": {
    inputs: [{ id: "comment", name: "注释内容", staticType: "string", inputStyle: "textarea", hint: "记录积木逻辑，不影响执行" }],
    outputs: []
  },
  "vflow.logic.break_loop": { inputs: [], outputs: [] },
  "vflow.logic.continue_loop": { inputs: [], outputs: [] },
  "vflow.logic.stop_workflow": { inputs: [], outputs: [] }
};
