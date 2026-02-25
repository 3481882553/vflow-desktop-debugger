import React from "react";
import { X, FileCode } from "lucide-react";
import "./styles/TabStrip.css";

interface Tab {
  id: string;
  name: string;
  isModified?: boolean;
}

interface TabStripProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string, e: React.MouseEvent) => void;
}

export const TabStrip: React.FC<TabStripProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose
}) => {
  return (
    <div className="tab-strip-container" data-testid="tab-strip">
      <div className="tab-strip-scroll">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab-item ${tab.id === activeTabId ? "active" : ""}`}
            data-testid="tab-item"
            onClick={() => onTabClick(tab.id)}
          >
            <FileCode size={14} className="tab-icon" />
            <span className="tab-name" title={tab.name}>
              {tab.name}
            </span>
            {tab.isModified && <div className="tab-modified-dot" />}
            <button
              className="tab-close-btn"
              data-testid="tab-close"
              onClick={(e) => onTabClose(tab.id, e)}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
