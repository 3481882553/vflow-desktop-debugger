import { ModuleSchema } from '../../domain/vflowTypes';

export const dataSchemas: Record<string, ModuleSchema> = {
  "vflow.variable.create": {
    inputs: [
      { id: "variableName", name: "基础变量名", staticType: "string", required: true, hint: "变量唯一标识" },
      { id: "initialValue", name: "初始值", staticType: "any", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true, hint: "支持文本、数字或变量引用" },
      { id: "isPersistent", name: "持久化存储", staticType: "boolean", defaultValue: false, inputStyle: "switch", hint: "重启应用后是否保留" }
    ],
    outputs: []
  },
  "vflow.variable.get": {
    inputs: [{ id: "variableName", name: "变量名", staticType: "string", required: true, acceptsNamedVariable: true, hint: "选择已定义的变量" }],
    outputs: [{ id: "value", name: "变量值", typeName: "vflow.type.any" }]
  },
  "vflow.variable.modify": {
    inputs: [
      { id: "variable", name: "变量", staticType: "string", required: true, acceptsNamedVariable: true, hint: "选择要通过此处修改的变量" },
      { id: "newValue", name: "新值", staticType: "any", required: true, acceptsMagicVariable: true, acceptsNamedVariable: true, supportsRichText: true, hint: "新值内容" }
    ],
    outputs: []
  },
  "vflow.data.calculation": {
    inputs: [
      { id: "operand1", name: "数字1", staticType: "string", defaultValue: "0", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"], hint: "左操作数" },
      { id: "operator", name: "运算符号", staticType: "enum", options: ["+", "-", "*", "/", "%"], defaultValue: "+", inputStyle: "chip_group" },
      { id: "operand2", name: "数字2", staticType: "string", defaultValue: "0", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"], hint: "右操作数" }
    ],
    outputs: [{ id: "result", name: "计算结果", typeName: "vflow.type.number" }]
  },
  "vflow.data.text_processing": {
    inputs: [
      { id: "operation", name: "操作类型", staticType: "enum", options: ["拼接", "分割", "替换", "正则提取"], defaultValue: "拼接", inputStyle: "chip_group" },
      { id: "join_prefix", name: "前缀", staticType: "string", visibility: { type: "eq", dependsOn: "operation", value: "拼接" }, acceptsMagicVariable: true, supportsRichText: true },
      { id: "join_list", name: "列表", staticType: "any", visibility: { type: "eq", dependsOn: "operation", value: "拼接" }, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.list"] },
      { id: "join_delimiter", name: "分隔符", staticType: "string", defaultValue: ",", visibility: { type: "eq", dependsOn: "operation", value: "拼接" }, acceptsMagicVariable: true },
      { id: "join_suffix", name: "后缀", staticType: "string", visibility: { type: "eq", dependsOn: "operation", value: "拼接" }, acceptsMagicVariable: true, supportsRichText: true },
      { id: "source_text", name: "源文本", staticType: "string", visibility: { type: "in", dependsOn: "operation", values: ["分割", "替换", "正则提取"] }, acceptsMagicVariable: true, supportsRichText: true },
      { id: "split_delimiter", name: "分割符", staticType: "string", defaultValue: ",", visibility: { type: "eq", dependsOn: "operation", value: "分割" }, acceptsMagicVariable: true },
      { id: "replace_from", name: "查找内容", staticType: "string", visibility: { type: "eq", dependsOn: "operation", value: "替换" }, acceptsMagicVariable: true },
      { id: "replace_to", name: "替换为", staticType: "string", visibility: { type: "eq", dependsOn: "operation", value: "替换" }, acceptsMagicVariable: true },
      { id: "regex_pattern", name: "正则模式", staticType: "string", visibility: { type: "eq", dependsOn: "operation", value: "正则提取" }, acceptsMagicVariable: true },
      { id: "regex_group", name: "匹配组号", staticType: "number", defaultValue: 0, visibility: { type: "eq", dependsOn: "operation", value: "正则提取" }, acceptsMagicVariable: true }
    ],
    outputs: [
      { id: "result_text", name: "文本结果", typeName: "vflow.type.string" },
      { id: "result_list", name: "列表结果", typeName: "vflow.type.list" }
    ]
  },
  "vflow.data.file_operation": {
    inputs: [
      { id: "operation", name: "操作", staticType: "enum", options: ["读取", "写入", "删除", "追加", "创建"], defaultValue: "读取", inputStyle: "chip_group" },
      { id: "file_path", name: "文件路径", staticType: "string", pickerType: "file", hint: "点击图标选择本地文件", visibility: { type: "nin", dependsOn: "operation", values: ["创建"] } },
      { id: "directory_path", name: "目录路径", staticType: "string", pickerType: "directory", hint: "选择存放目录", visibility: { type: "eq", dependsOn: "operation", value: "创建" } },
      { id: "file_name", name: "文件名", staticType: "string", acceptsMagicVariable: true, supportsRichText: true, visibility: { type: "eq", dependsOn: "operation", value: "创建" } },
      { id: "encoding", name: "编码格式", staticType: "enum", options: ["UTF-8", "GBK", "GB2312", "ISO-8859-1"], defaultValue: "UTF-8", visibility: { type: "eq", dependsOn: "operation", value: "创建" }, inputStyle: "chip_group" },
      { id: "encoding_read", name: "读取编码", staticType: "enum", options: ["UTF-8", "GBK", "GB2312", "ISO-8859-1"], defaultValue: "UTF-8", visibility: { type: "eq", dependsOn: "operation", value: "读取" }, inputStyle: "chip_group" },
      { id: "content", name: "写入内容", staticType: "string", acceptsMagicVariable: true, supportsRichText: true, visibility: { type: "in", dependsOn: "operation", values: ["写入", "追加"] } },
      { id: "create_content", name: "初始内容", staticType: "string", acceptsMagicVariable: true, supportsRichText: true, visibility: { type: "eq", dependsOn: "operation", value: "创建" } },
      { id: "overwrite", name: "覆盖模式", staticType: "boolean", defaultValue: true, inputStyle: "switch", isFolded: true, visibility: { type: "eq", dependsOn: "operation", value: "写入" } },
      { id: "buffer_size", name: "缓冲区大小", staticType: "number", defaultValue: 8192, sliderConfig: [1024, 65536, 1024], isFolded: true }
    ],
    outputs: [
      { id: "content", name: "读取到的内容", typeName: "vflow.type.string" },
      { id: "success", name: "是否成功", typeName: "vflow.type.boolean" },
      { id: "file_path", name: "最终文件路径", typeName: "vflow.type.string" }
    ]
  },
  "vflow.data.parse_json": {
    inputs: [
      { id: "json_string", name: "JSON 字符串", staticType: "string", required: true, acceptsMagicVariable: true, hint: "待解析的 JSON 原文" },
      { id: "path", name: "提取路径", staticType: "string", hint: "JSONPath, 如 $.data.items[0]", acceptsMagicVariable: true }
    ],
    outputs: [
      { id: "result", name: "解析结果", typeName: "vflow.type.any" },
      { id: "success", name: "是否成功", typeName: "vflow.type.boolean" }
    ]
  },
  "vflow.data.random": {
    inputs: [
      { id: "type", name: "随机类型", staticType: "enum", options: ["数字", "文本", "列表元素", "UUID"], defaultValue: "数字", inputStyle: "chip_group" },
      { id: "min", name: "最小值", staticType: "number", defaultValue: 0, visibility: { type: "eq", dependsOn: "type", value: "数字" } },
      { id: "max", name: "最大值", staticType: "number", defaultValue: 100, visibility: { type: "eq", dependsOn: "type", value: "数字" } },
      { id: "length", name: "文本长度", staticType: "number", defaultValue: 8, visibility: { type: "eq", dependsOn: "type", value: "文本" } },
      { id: "list", name: "源列表", staticType: "any", visibility: { type: "eq", dependsOn: "type", value: "列表元素" }, acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.list"] }
    ],
    outputs: [{ id: "result", name: "随机结果", typeName: "vflow.type.any" }]
  },
  "vflow.data.time.get_current": {
    inputs: [{ id: "format", name: "日期格式", staticType: "string", defaultValue: "yyyy-MM-dd HH:mm:ss", hint: "Java SimpleDateFormat 格式" }],
    outputs: [
      { id: "timestamp", name: "毫秒时间戳", typeName: "vflow.type.number" },
      { id: "formatted", name: "格式化日期", typeName: "vflow.type.string" }
    ]
  },
  "vflow.data.base64": {
    inputs: [
      { id: "action", name: "操作", staticType: "enum", options: ["编码", "解码"], defaultValue: "编码", inputStyle: "chip_group" },
      { id: "content", name: "内容", staticType: "string", required: true, acceptsMagicVariable: true }
    ],
    outputs: [{ id: "result", name: "处理结果", typeName: "vflow.type.string" }]
  },
  "vflow.data.comment": {
    inputs: [
      {
        id: "content",
        name: "注释内容",
        staticType: "string",
        defaultValue: "",
        acceptsMagicVariable: true,
        acceptsNamedVariable: true,
        supportsRichText: true
      }
    ],
    outputs: []
  },
  "vflow.data.get_current_time": {
    inputs: [
      {
        id: "format",
        name: "时间格式",
        staticType: "enum",
        options: [
          "时间戳 (毫秒)",
          "时间戳 (秒)",
          "ISO 8601",
          "yyyy-MM-dd HH:mm:ss",
          "yyyy-MM-dd",
          "HH:mm:ss",
          "yyyy年MM月dd日",
          "MM月dd日 HH:mm"
        ],
        defaultValue: "yyyy-MM-dd HH:mm:ss"
      },
      {
        id: "timezone",
        name: "时区 (可选)",
        staticType: "string",
        defaultValue: "",
        hint: "例如: Asia/Shanghai, 留空使用系统默认时区"
      }
    ],
    outputs: [
      { id: "time", name: "时间", typeName: "vflow.type.string" },
      { id: "timestamp", name: "时间戳 (毫秒)", typeName: "vflow.type.number" },
      { id: "year", name: "年份", typeName: "vflow.type.number" },
      { id: "month", name: "月份", typeName: "vflow.type.number" },
      { id: "day", name: "日期", typeName: "vflow.type.number" },
      { id: "hour", name: "小时", typeName: "vflow.type.number" },
      { id: "minute", name: "分钟", typeName: "vflow.type.number" },
      { id: "second", name: "秒", typeName: "vflow.type.number" },
      { id: "weekday", name: "星期", typeName: "vflow.type.string" },
      { id: "weekday_number", name: "星期数字", typeName: "vflow.type.number" }
    ]
  },
  "vflow.data.text_extract": {
    inputs: [
      { id: "text", name: "源文本", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true },
      { id: "mode", name: "提取方式", staticType: "enum", options: ["提取中间", "提取前缀", "提取后缀", "提取字符"], defaultValue: "提取中间" },
      { id: "start", name: "起始位置", staticType: "number", defaultValue: 0, acceptsMagicVariable: true, visibility: { type: "eq", dependsOn: "mode", value: "提取中间" } },
      { id: "end", name: "结束位置", staticType: "number", defaultValue: 0, acceptsMagicVariable: true, visibility: { type: "eq", dependsOn: "mode", value: "提取中间" } },
      { id: "index", name: "字符位置", staticType: "number", defaultValue: 0, acceptsMagicVariable: true, visibility: { type: "eq", dependsOn: "mode", value: "提取字符" } },
      { id: "count", name: "字符数量", staticType: "number", defaultValue: 1, acceptsMagicVariable: true, visibility: { type: "neq", dependsOn: "mode", value: "提取中间" } }
    ],
    outputs: [{ id: "result", name: "结果文本", typeName: "vflow.type.string" }]
  },
  "vflow.data.text_replace": {
    inputs: [
      { id: "text", name: "源文本", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true },
      { id: "find", name: "查找", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true },
      { id: "replace", name: "替换为", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true }
    ],
    outputs: [{ id: "result", name: "结果文本", typeName: "vflow.type.string" }]
  },
  "vflow.data.text_split": {
    inputs: [
      { id: "text", name: "源文本", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true },
      { id: "delimiter", name: "分隔符", staticType: "string", defaultValue: "", acceptsMagicVariable: true, supportsRichText: true }
    ],
    outputs: [{ id: "result", name: "结果列表", typeName: "vflow.type.list", listElementType: "vflow.type.string" }]
  },
  "vflow.variable.load": {
    inputs: [
      { id: "workflow_id", name: "工作流", staticType: "string" },
      { id: "variable_names", name: "变量", staticType: "string" },
      { id: "mode", name: "模式", staticType: "enum", options: ["share", "copy"], defaultValue: "share" }
    ],
    outputs: []
  },
  "vflow.variable.random": {
    inputs: [
      { id: "type", name: "变量类型", staticType: "enum", options: ["数字", "文本"], defaultValue: "数字" },
      { id: "variableName", name: "变量名称 (可选)", staticType: "string", defaultValue: "" },
      { id: "min", name: "随机数最小值 (默认为 0)", staticType: "number", defaultValue: "", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"], isFolded: true },
      { id: "max", name: "随机数最大值 (默认为 100)", staticType: "number", defaultValue: "", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"], isFolded: true },
      { id: "step", name: "步长 (默认为 1)", staticType: "number", defaultValue: "", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"], isFolded: true },
      { id: "length", name: "随机文本长度 (默认为 8)", staticType: "number", defaultValue: "", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.number"], isFolded: true },
      { id: "custom_chars", name: "随机文本符集 (默认为 a-zA-Z0-9)", staticType: "string", defaultValue: "", acceptsMagicVariable: true, acceptedMagicVariableTypes: ["vflow.type.string"], isFolded: true }
    ],
    outputs: [{ id: "randomVariable", name: "随机变量", typeName: "vflow.type.any" }]
  }
};
