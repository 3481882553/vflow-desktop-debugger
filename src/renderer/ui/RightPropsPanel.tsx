import React, { useState, useEffect, useMemo } from "react";
import { VflowActionStep, InputDefinition } from "../domain/vflowTypes";
import { ChevronDown, ChevronRight, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "./components/Input";
import { Select } from "./components/Select";
import { Button } from "./components/Button";
import { isInputVisible } from "../utils/visibilityHelper";
import "./styles/RightPropsPanel.css";

interface RightPropsPanelProps {
  step: VflowActionStep | null;
  schema: InputDefinition[];
  onChange: (params: Record<string, any>) => void;
}

export const RightPropsPanel: React.FC<RightPropsPanelProps> = ({
  step,
  schema,
  onChange
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // 当选中的 step 变化时（含参数变化），重置校验状态
  useEffect(() => {
    setErrors({});
    setTouched({});
    setAdvancedOpen(false);
  }, [step]);

  // 过滤可见字段
  const visibleSchema = useMemo(() => {
    if (!step) return [];
    return schema.filter(f => isInputVisible(f.visibility, step.parameters));
  }, [schema, step?.parameters]);

  // 分组逻辑
  const { basicFields, advancedFields } = useMemo(() => {
    const basic: InputDefinition[] = [];
    const advanced: InputDefinition[] = [];
    visibleSchema.forEach(f => {
      if (f.id.startsWith("show_") || f.isFolded) {
        advanced.push(f);
      } else {
        basic.push(f);
      }
    });
    return { basicFields: basic, advancedFields: advanced };
  }, [visibleSchema]);

  const validateField = (field: InputDefinition, value: any): string => {
    if (field.required && (value === undefined || value === null || value === "")) {
      return "此项为必填项";
    }
    if (field.staticType === "number") {
      const num = Number(value);
      if (isNaN(num)) return "请输入有效的数字";
      const min = field.sliderConfig?.[0] ?? field.min;
      const max = field.sliderConfig?.[1] ?? field.max;
      if (min !== undefined && num < min) return `最小值不能低于 ${min}`;
      if (max !== undefined && num > max) return `最大值不能超过 ${max}`;
    }
    if (field.pattern && typeof value === "string") {
      if (!new RegExp(field.pattern).test(value)) return "格式不符合要求";
    }
    return "";
  };

  const handleFieldChange = (id: string, value: any) => {
    if (!step) return;
    
    // 更新值
    const newParams = { ...step.parameters, [id]: value };
    onChange(newParams);

    // 实时校验
    const field = schema.find(f => f.id === id);
    if (field) {
      const errorMsg = validateField(field, value);
      setErrors(prev => ({ ...prev, [id]: errorMsg }));
    }
  };

  const handleBlur = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
    const field = schema.find(f => f.id === id);
    if (field && step) {
      const val = step.parameters[id];
      const errorMsg = validateField(field, val);
      setErrors(prev => ({ ...prev, [id]: errorMsg }));
    }
  };

  const renderFieldInput = (f: InputDefinition) => {
    if (!step) return null;
    const value = step.parameters[f.id];
    const error = touched[f.id] ? errors[f.id] : undefined;
    
    // 针对不同类型的渲染
    if (f.staticType === "boolean") {
      const checked = Boolean(value);
      return (
        <div 
          onClick={() => handleFieldChange(f.id, !checked)}
          className="props-switch"
        >
          <span className="props-switch-label">启用</span>
          <div 
            className="props-switch-track"
            style={{
              backgroundColor: checked ? "var(--color-primary)" : "var(--color-text-disabled)"
            }}
          >
            <div 
              className="props-switch-thumb"
              style={{
                left: checked ? 18 : 2
              }}
            />
          </div>
        </div>
      );
    }

    if (f.inputStyle === "slider" && f.staticType === "number") {
      const min = f.sliderConfig?.[0] ?? f.min ?? 0;
      const max = f.sliderConfig?.[1] ?? f.max ?? 100;
      const sliderStep = f.sliderConfig?.[2] ?? 1;
      const val = Number(value ?? min);
      
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min={min}
            max={max}
            step={sliderStep}
            value={val}
            onChange={e => handleFieldChange(f.id, Number(e.target.value))}
            style={{ flex: 1, cursor: "pointer" }}
          />
          <div style={{ width: 60 }}>
            <Input
              type="number"
              value={String(val)}
              onChange={e => handleFieldChange(f.id, Number(e.target.value))}
            />
          </div>
        </div>
      );
    }

    if (f.inputStyle === "chip_group" && f.options) {
      return (
        <div className="props-chip-group">
          {f.options.map(opt => (
            <div 
              key={opt} 
              className={`props-chip ${value === opt ? "selected" : ""}`}
              onClick={() => handleFieldChange(f.id, opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      );
    }

    if (f.pickerType === "file" || f.pickerType === "directory") {
       const isDirectory = f.pickerType === "directory";
       return (
         <div style={{ display: "flex", gap: 4 }}>
           <div style={{ flex: 1 }}>
             <Input
               value={String(value ?? "")}
               onChange={e => handleFieldChange(f.id, e.target.value)}
               placeholder={f.hint || (isDirectory ? "请选择目录" : "请选择文件")}
             />
           </div>
           <Button 
             size="sm" 
             onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                if (isDirectory) {
                  input.setAttribute("webkitdirectory", "");
                  input.setAttribute("directory", "");
                }
                input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                        handleFieldChange(f.id, file.path || file.name);
                    }
                };
                input.click();
             }}
           >
             浏览
           </Button>
         </div>
       )
    }

    if (f.staticType === "enum") {
      const options = [
        { label: "请选择...", value: "" },
        ...(f.options || []).map(opt => ({ label: opt, value: opt }))
      ];
      return (
        <Select
          value={String(value ?? "")}
          onChange={e => handleFieldChange(f.id, e.target.value)}
          onBlur={() => handleBlur(f.id)}
          options={options}
          error={error}
        />
      );
    }

    if (f.inputStyle === "textarea" || (f.staticType === "string" && (f.id.includes("script") || f.id.includes("code") || f.id.includes("content")))) {
      // 简易多行文本框优化
      return (
        <textarea
          value={String(value ?? "")}
          onChange={e => handleFieldChange(f.id, e.target.value)}
          onBlur={() => handleBlur(f.id)}
          className={`props-input props-textarea ${error ? "error" : ""}`}
          placeholder={f.hint || "请输入内容..."}
        />
      );
    }

    // 默认文本/数字输入
    return (
      <Input
        type={f.staticType === "number" ? "number" : "text"}
        value={String(value ?? "")}
        onChange={e => handleFieldChange(f.id, f.staticType === "number" ? Number(e.target.value) : e.target.value)}
        onBlur={() => handleBlur(f.id)}
        error={error}
        placeholder={f.hint || (f.staticType === "number" ? "0" : "请输入")}
      />
    );
  };

  if (!step) {
    return (
      <div className="props-empty-state">
        <div className="props-empty-icon">
          <Info size={24} color="var(--color-text-disabled)" />
        </div>
        <p style={{ fontSize: "var(--font-size-sm)" }}>请选择一个节点以编辑属性</p>
      </div>
    );
  }

  return (
    <div className="props-panel-container">
      {/* 头部 */}
      <div className="props-panel-header">
        <h2 className="props-panel-title">
          {step.name || "未命名节点"}
        </h2>
        <div className="props-panel-meta">
          <span className="props-panel-badge">
            {step.moduleId}
          </span>
          <span className="props-panel-id">ID: {step.id}</span>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="props-panel-form">
        <div className="props-form-layout">
          {basicFields.map(f => (
            <div key={f.id} className="props-field-group">
              <label className="props-label">
                {f.name}
                {f.required && <span className="props-label-req">*</span>}
                {f.description && (
                  <span title={f.description} className="props-label-info">
                    <Info size={12} />
                  </span>
                )}
              </label>
              {renderFieldInput(f)}
              {touched[f.id] && errors[f.id] && (
                <div className="props-error-msg">
                  <AlertCircle size={12} />
                  <span>{errors[f.id]}</span>
                </div>
              )}
            </div>
          ))}

          {advancedFields.length > 0 && (
            <div className="props-advanced-section">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="props-advanced-toggle"
                icon={advancedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              >
                高级选项
              </Button>
              
              <div 
                className="props-advanced-content"
                style={{ 
                  height: advancedOpen ? "auto" : 0, 
                  opacity: advancedOpen ? 1 : 0
                }}
              >
                <div className="props-advanced-inner">
                  {advancedFields.map(f => (
                    <div key={f.id}>
                      <label className="props-label">
                        {f.name}
                        {f.description && (
                          <span title={f.description} className="props-label-info">
                            <Info size={12} />
                          </span>
                        )}
                      </label>
                      {renderFieldInput(f)}
                      {touched[f.id] && errors[f.id] && (
                        <div className="props-error-msg">
                          <AlertCircle size={12} />
                          <span>{errors[f.id]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 全局异常处理策略区块 */}
          <div className="props-advanced-section" style={{ marginTop: 16, borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
            <h3 className="props-label" style={{ fontSize: "13px", fontWeight: "bold", marginBottom: 12 }}>
              执行异常处理策略
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["STOP", "SKIP", "RETRY"].map(policy => {
                const checked = (step.parameters.__error_policy || "STOP") === policy;
                const labels: any = { STOP: "停止运行", SKIP: "跳过此步骤继续", RETRY: "重试" };
                return (
                  <label key={policy} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name="error_policy" 
                      checked={checked} 
                      onChange={() => handleFieldChange("__error_policy", policy)}
                    />
                    {labels[policy]}
                  </label>
                );
              })}
            </div>

            {step.parameters.__error_policy === "RETRY" && (
              <div style={{ marginTop: 12, padding: "12px", background: "var(--bg-color-secondary)", borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="props-field-group" style={{ marginBottom: 0 }}>
                  <label className="props-label">重试次数</label>
                  <Input 
                    type="number" 
                    value={String(step.parameters.__retry_count ?? 3)}
                    onChange={e => handleFieldChange("__retry_count", Number(e.target.value))}
                  />
                </div>
                <div className="props-field-group" style={{ marginBottom: 0 }}>
                  <label className="props-label">重试间隔(ms)</label>
                  <Input 
                    type="number" 
                    value={String(step.parameters.__retry_interval ?? 1000)}
                    onChange={e => handleFieldChange("__retry_interval", Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 底部状态栏 */}
      <div className="props-panel-footer">
        <span>
          {Object.keys(errors).filter(k => errors[k]).length > 0 
            ? <span style={{ color: "var(--color-warning)" }}>存在校验错误</span> 
            : <span style={{ color: "var(--color-success)", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12}/> 参数有效</span>
          }
        </span>
      </div>
    </div>
  );
};
