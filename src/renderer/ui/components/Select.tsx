import React from "react";
import { ChevronDown } from "lucide-react";
import "./styles/Select.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  options: SelectOption[];
  error?: string;
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, label, options, ...props }, ref) => {
    return (
      <div className="base-select-wrapper">
        {label && <label className="base-select-label">{label}</label>}
        <div className="base-select-container">
          <select
            ref={ref}
            className={`base-select ${error ? "base-select-error" : ""} ${className}`}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="base-select-icon">
            <ChevronDown size={14} />
          </div>
        </div>
        {error && <div className="base-select-error-msg">{error}</div>}
      </div>
    );
  }
);

Select.displayName = "Select";
