export type VflowParameterValue = string | number | boolean | null | VflowParameterValue[] | { [key: string]: VflowParameterValue };

export interface VflowActionStep {
  moduleId: string;
  parameters: { [key: string]: VflowParameterValue };
  indentationLevel: number;
  id: string;
  name?: string;
}

export interface VflowModuleOption {
  id: string;
  name: string;
  category: string;
  categoryKey?: string | null;
  color: string;
  description?: string; // Added
  icon?: string; // Added
  usageCount?: number;
  isDisabled?: boolean;
  disabledReason?: string;
}

export interface VflowWorkflow {
  id: string;
  name: string;
  steps: VflowActionStep[];
  isEnabled: boolean;
  triggerConfig?: { [key: string]: VflowParameterValue } | null;
  isFavorite: boolean;
  wasEnabledBeforePermissionsLost: boolean;
  folderId?: string | null;
  order: number;
  shortcutName?: string | null;
  shortcutIconRes?: string | null;
}

export type InputStyle = "default" | "chip_group" | "dropdown" | "switch" | "slider" | "textarea";
export type PickerType = "none" | "file" | "directory" | "app" | "activity" | "media" | "date" | "time" | "datetime";

export type InputVisibility =
  | { type: "always" }
  | { type: "eq"; dependsOn: string; value: any }
  | { type: "neq"; dependsOn: string; value: any }
  | { type: "in"; dependsOn: string; values: any[] }
  | { type: "nin"; dependsOn: string; values: any[] }
  | { type: "true"; dependsOn: string }
  | { type: "false"; dependsOn: string }
  | { type: "and"; conditions: InputVisibility[] }
  | { type: "or"; conditions: InputVisibility[] }
  | { type: "not"; condition: InputVisibility }
  // 扩展的可见性条件类型
  | { type: "range"; dependsOn: string; min: number; max: number }
  | { type: "contains"; dependsOn: string; value: any }
  | { type: "length"; dependsOn: string; operator: ">" | "<" | "=" | ">=" | "<="; length: number }
  | { type: "matches"; dependsOn: string; pattern: string }
  | { type: "empty"; dependsOn: string }
  | { type: "notEmpty"; dependsOn: string };

export interface InputDefinition {
  id: string;
  name: string; // Android: name, Desktop previously: label
  staticType: "string" | "number" | "boolean" | "enum" | "any"; // Android: staticType, Desktop previously: type
  defaultValue?: any;
  options?: string[]; // Android: options, Desktop previously: enumValues
  
  acceptsMagicVariable?: boolean;
  acceptsNamedVariable?: boolean;
  acceptedMagicVariableTypes?: string[];
  supportsRichText?: boolean;
  
  isHidden?: boolean;
  isFolded?: boolean; // Android: isFolded, Desktop previously: advanced
  
  inputStyle?: InputStyle;
  sliderConfig?: [number, number, number]; // min, max, step
  pickerType?: PickerType;
  
  visibility?: InputVisibility;
  
  hint?: string; // Android: hint, Desktop previously: placeholder
  description?: string;
  
  // Validation constraints (Desktop legacy, kept for utility)
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface OutputDefinition {
  id: string;
  name: string;
  typeName: string;
  conditionalOptions?: Array<{ displayName: string; value: string }>;
  listElementType?: string;
}

export interface ActionMetadata {
  name: string;
  description: string;
  iconRes?: string;
  category: string;
}

// Alias for backward compatibility during refactoring, but eventually should be removed
export type ParamFieldSchema = InputDefinition;

// 魔法变量类型常量
export const MAGIC_VARIABLE_TYPES = {
  STRING: "vflow.type.string",
  NUMBER: "vflow.type.number",
  BOOLEAN: "vflow.type.boolean",
  LIST: "vflow.type.list",
  DICTIONARY: "vflow.type.dictionary",
  IMAGE: "vflow.type.image",
  SCREEN_ELEMENT: "vflow.type.screen_element"
};

// 魔法变量类型验证工具
// 可见性条件评估器
export class VisibilityEvaluator {
  static evaluate(condition: InputVisibility, context: Record<string, any>): boolean {
    switch (condition.type) {
      case "always":
        return true;
      case "eq":
        return context[condition.dependsOn] === condition.value;
      case "neq":
        return context[condition.dependsOn] !== condition.value;
      case "in":
        return condition.values.includes(context[condition.dependsOn]);
      case "nin":
        return !condition.values.includes(context[condition.dependsOn]);
      case "true":
        return Boolean(context[condition.dependsOn]);
      case "false":
        return !Boolean(context[condition.dependsOn]);
      case "and":
        return condition.conditions.every(c => this.evaluate(c, context));
      case "or":
        return condition.conditions.some(c => this.evaluate(c, context));
      case "not":
        return !this.evaluate(condition.condition, context);
      case "range":
        const value = Number(context[condition.dependsOn]);
        return !isNaN(value) && value >= condition.min && value <= condition.max;
      case "contains":
        const container = context[condition.dependsOn];
        if (Array.isArray(container)) {
          return container.includes(condition.value);
        } else if (typeof container === "string") {
          return container.includes(String(condition.value));
        }
        return false;
      case "length":
        const target = context[condition.dependsOn];
        let length: number;
        if (Array.isArray(target) || typeof target === "string") {
          length = target.length;
        } else {
          length = String(target).length;
        }
        switch (condition.operator) {
          case ">": return length > condition.length;
          case "<": return length < condition.length;
          case "=": return length === condition.length;
          case ">=": return length >= condition.length;
          case "<=": return length <= condition.length;
          default: return false;
        }
      case "matches":
        const text = String(context[condition.dependsOn] || "");
        try {
          const regex = new RegExp(condition.pattern);
          return regex.test(text);
        } catch {
          return false;
        }
      case "empty":
        const emptyTarget = context[condition.dependsOn];
        return emptyTarget === undefined || emptyTarget === null || emptyTarget === "" || 
               (Array.isArray(emptyTarget) && emptyTarget.length === 0);
      case "notEmpty":
        return !this.evaluate({ type: "empty", dependsOn: condition.dependsOn }, context);
      default:
        return true;
    }
  }

  static getDescription(condition: InputVisibility): string {
    switch (condition.type) {
      case "eq": return `当 ${condition.dependsOn} 等于 ${condition.value} 时显示`;
      case "neq": return `当 ${condition.dependsOn} 不等于 ${condition.value} 时显示`;
      case "in": return `当 ${condition.dependsOn} 在 [${condition.values.join(", ")}] 中时显示`;
      case "range": return `当 ${condition.dependsOn} 在 ${condition.min}-${condition.max} 范围内时显示`;
      case "contains": return `当 ${condition.dependsOn} 包含 ${condition.value} 时显示`;
      case "length": return `当 ${condition.dependsOn} 长度 ${condition.operator} ${condition.length} 时显示`;
      default: return "根据条件显示";
    }
  }
}

export class MagicVariableValidator {
  static isValidType(variableType: string, acceptedTypes: string[]): boolean {
    return acceptedTypes.includes(variableType);
  }

  static getTypeDisplayName(type: string): string {
    const typeMap: Record<string, string> = {
      [MAGIC_VARIABLE_TYPES.STRING]: "文本",
      [MAGIC_VARIABLE_TYPES.NUMBER]: "数字",
      [MAGIC_VARIABLE_TYPES.BOOLEAN]: "布尔值",
      [MAGIC_VARIABLE_TYPES.LIST]: "列表",
      [MAGIC_VARIABLE_TYPES.DICTIONARY]: "字典",
      [MAGIC_VARIABLE_TYPES.IMAGE]: "图片",
      [MAGIC_VARIABLE_TYPES.SCREEN_ELEMENT]: "屏幕元素"
    };
    return typeMap[type] || type;
  }

  static getAcceptedTypesDescription(acceptedTypes: string[]): string {
    if (!acceptedTypes || acceptedTypes.length === 0) {
      return "任意类型";
    }
    return acceptedTypes.map(type => this.getTypeDisplayName(type)).join(", ");
  }
}

// 参数验证工具类
export class ParameterValidator {
  static validateNumber(value: any, min?: number, max?: number): boolean {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  }
  
  static validateEnum(value: any, options: string[]): boolean {
    return options.includes(String(value));
  }
  
  static validateString(value: any, minLength?: number, maxLength?: number, pattern?: string): boolean {
    if (typeof value !== 'string') return false;
    if (minLength !== undefined && value.length < minLength) return false;
    if (maxLength !== undefined && value.length > maxLength) return false;
    if (pattern) {
      try {
        const regex = new RegExp(pattern);
        return regex.test(value);
      } catch {
        return false;
      }
    }
    return true;
  }
  
  static validateBoolean(value: any): boolean {
    return typeof value === 'boolean' || value === 'true' || value === 'false';
  }
  
  static getValidationError(param: InputDefinition, value: any): string | null {
    // 检查必填项
    if (param.required && (value === undefined || value === null || value === "")) {
      return `${param.name}是必填项`;
    }
    
    // 检查类型
    switch (param.staticType) {
      case "number": {
        if (value !== undefined && value !== null && value !== "") {
          const num = Number(value);
          if (isNaN(num)) {
            return `${param.name}必须是数字`;
          }
          if (param.min !== undefined && num < param.min) {
            return `${param.name}不能小于${param.min}`;
          }
          if (param.max !== undefined && num > param.max) {
            return `${param.name}不能大于${param.max}`;
          }
        }
        break;
      }
      case "string": {
        if (value !== undefined && value !== null) {
          const str = String(value);
          if (param.min !== undefined && str.length < param.min) {
            return `${param.name}长度不能少于${param.min}个字符`;
          }
          if (param.max !== undefined && str.length > param.max) {
            return `${param.name}长度不能超过${param.max}个字符`;
          }
          if (param.pattern) {
            try {
              const regex = new RegExp(param.pattern);
              if (!regex.test(str)) {
                return `${param.name}格式不正确`;
              }
            } catch {
              // 正则表达式无效，跳过验证
            }
          }
        }
        break;
      }
      case "enum": {
        if (value !== undefined && value !== null && value !== "" && param.options) {
          if (!param.options.includes(String(value))) {
            return `${param.name}必须是以下选项之一: ${param.options.join(", ")}`;
          }
        }
        break;
      }
      case "boolean": {
        if (value !== undefined && value !== null && value !== "") {
          if (!(typeof value === 'boolean' || value === 'true' || value === 'false')) {
            return `${param.name}必须是布尔值(true/false)`;
          }
        }
        break;
      }
    }
    
    return null;
  }
  
  static validateAll(params: InputDefinition[], values: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};
    
    params.forEach(param => {
      const value = values[param.id];
      const error = this.getValidationError(param, value);
      if (error) {
        errors[param.id] = error;
      }
    });
    
    return errors;
  }
}

// 标准化参数描述模板
export const STANDARD_DESCRIPTIONS = {
  // 通用描述
  REQUIRED: "此参数为必填项",
  OPTIONAL: "此参数为可选项",
  DEFAULT_VALUE: (value: any) => `默认值: ${value}`,
  
  // 数据类型相关
  STRING_INPUT: "请输入文本内容",
  NUMBER_INPUT: "请输入数字",
  BOOLEAN_INPUT: "请选择是/否",
  ENUM_INPUT: "请选择选项",
  
  // 魔法变量相关
  MAGIC_VARIABLE_SUPPORTED: "支持引用其他模块的输出变量",
  MAGIC_VARIABLE_RESTRICTED: (types: string[]) => `仅支持以下类型的变量: ${types.join(', ')}`,
  
  // 时间相关
  TIMEOUT_SECONDS: "超时时间(秒)",
  DELAY_MILLISECONDS: "延迟时间(毫秒)",
  INTERVAL_SECONDS: "间隔时间(秒)",
  CHECK_INTERVAL_MS: "检查间隔(毫秒)",
  
  // 网络相关
  URL_INPUT: "请输入完整的URL地址",
  IP_ADDRESS: "请输入IP地址",
  PORT_NUMBER: "端口号(1-65535)",
  HTTP_METHOD: "HTTP请求方法",
  REQUEST_HEADERS: "请求头信息(JSON格式)",
  QUERY_PARAMETERS: "查询参数(JSON格式)",
  
  // 文件相关
  FILE_PATH: "文件路径",
  DIRECTORY_PATH: "目录路径",
  FILE_CONTENT: "文件内容",
  ENCODING_FORMAT: "文件编码格式",
  FILE_OPERATION: "文件操作类型",
  
  // 系统相关
  PACKAGE_NAME: "应用包名(如: com.example.app)",
  ACTIVITY_NAME: "Activity名称",
  PERMISSION_NAME: "权限名称",
  SYSTEM_SERVICE: "系统服务名称",
  DEVICE_ID: "设备标识符",
  
  // 安全相关
  PASSWORD_INPUT: "密码输入(内容会被隐藏)",
  API_KEY: "API密钥",
  ACCESS_TOKEN: "访问令牌",
  SSL_VERIFICATION: "SSL证书验证",
  
  // 逻辑控制相关
  CONDITION_EXPRESSION: "条件表达式(支持JavaScript语法)",
  LOOP_CONDITION: "循环继续条件",
  COMPARISON_OPERATOR: "比较运算符",
  LOGICAL_OPERATOR: "逻辑运算符",
  
  // 数据处理相关
  SEARCH_PATTERN: "查找模式",
  REPLACEMENT_TEXT: "替换文本",
  SPLIT_DELIMITER: "分割符",
  REGEX_PATTERN: "正则表达式模式",
  
  // 变量相关
  VARIABLE_NAME: "变量名称",
  VARIABLE_VALUE: "变量值",
  VARIABLE_SCOPE: "变量作用域",
  VARIABLE_TYPE: "变量数据类型",
  
  // 函数相关
  FUNCTION_NAME: "函数名称",
  FUNCTION_ARGUMENTS: "函数参数(JSON格式)",
  ASYNC_EXECUTION: "异步执行",
  
  // 错误处理相关
  ERROR_TYPE: "错误类型",
  RETRY_COUNT: "失败重试次数",
  RETRY_DELAY: "重试延迟时间(毫秒)",
  ERROR_HANDLER: "错误处理方式",
  FALLBACK_ACTION: "降级处理动作",
  
  // 用户界面相关
  INPUT_PROMPT: "输入提示信息",
  PLACEHOLDER_TEXT: "占位符文本",
  BUTTON_LABEL: "按钮标签",
  DISPLAY_MESSAGE: "显示消息",
  
  // 高级功能
  CUSTOM_EXPRESSION: "自定义表达式",
  JSON_FORMAT: "JSON格式数据",
  SCRIPT_CODE: "脚本代码",
  CONFIGURATION: "配置信息",
  
  // 性能相关
  MAX_ITERATIONS: "最大迭代次数",
  EXECUTION_TIMEOUT: "执行超时时间",
  MEMORY_LIMIT: "内存使用限制",
  CONCURRENT_TASKS: "并发任务数",
  
  // 调试相关
  DEBUG_MODE: "调试模式",
  LOG_LEVEL: "日志级别",
  VERBOSE_OUTPUT: "详细输出",
  PROFILING_ENABLED: "性能分析启用"
};

// Module schema including both inputs and outputs
export interface ModuleSchema {
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
}

export interface InputContract {
  id: string;
  staticType?: string;
  required?: boolean;
}

export interface OutputContract {
  id: string;
  typeName?: string;
}

export interface ModuleContract {
  moduleId: string;
  inputs: InputContract[];
  outputs: OutputContract[];
  hasLocalSchema: boolean;
  schemaId: string | null;
  deprecatedAliases: string[];
  categoryKey?: string | null;
  display: {
    name: string;
    category: string;
    description?: string;
  };
  displayByLocale?: Record<string, {
    name: string;
    category: string;
    description?: string;
  }>;
}

export interface ContractBundleMeta {
  generatedAt: string;
  source: string;
  version: number;
  appModuleCount: number;
  schemaModuleCount: number;
}
