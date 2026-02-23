import React from "react";
import "./styles/Input.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, label, ...props }, ref) => {
    return (
      <div className="base-input-wrapper">
        {label && <label className="base-input-label">{label}</label>}
        <input
          ref={ref}
          className={`base-input ${error ? "base-input-error" : ""} ${className}`}
          {...props}
        />
        {error && <div className="base-input-error-msg">{error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";
