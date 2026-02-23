import React from "react";
import "./styles/Button.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "secondary", size = "md", icon, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`base-btn base-btn-${variant} base-btn-${size} ${className}`}
        {...props}
      >
        {icon && <span className="base-btn-icon">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
