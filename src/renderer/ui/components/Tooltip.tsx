import React, { ReactNode } from "react";
import "./styles/Tooltip.css";

interface TooltipProps {
  content: ReactNode;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = "bottom" }) => {
  if (!content) return children;

  return (
    <div className="base-tooltip-container">
      {children}
      <div className={`base-tooltip-popup base-tooltip-${position}`}>
        {content}
      </div>
    </div>
  );
};
