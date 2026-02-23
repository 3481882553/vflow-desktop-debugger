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
  color: string;
  description?: string; // Added
  icon?: string; // Added
  usageCount?: number;
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
  | { type: "not"; condition: InputVisibility };

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

export interface ActionMetadata {
  name: string;
  description: string;
  iconRes?: string;
  category: string;
}

// Alias for backward compatibility during refactoring, but eventually should be removed
export type ParamFieldSchema = InputDefinition;
