import React from "react";
import {
  Undo2,
  Redo2,
  Save,
  Play,
  Download,
  CloudDownload,
  Loader2,
  Sun,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  FilePlus,
  FolderOpen,
  Columns
} from "lucide-react";
import { Button } from "./components/Button";
import { Tooltip } from "./components/Tooltip";
import "./styles/TopToolbar.css";

interface TopToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onRun: () => void;
  onStop: () => void;
  isRunning: boolean;
  onSync: () => void;
  isSyncing: boolean;
  onExport: () => void;
  onNew: () => void;
  onImport: () => void;
  darkMode: boolean;
  toggleDark: () => void;
  viewMode: "graph" | "code";
  onToggleView: () => void;
  isPropsPanelOpen: boolean;
  onTogglePropsPanel: () => void;
  layoutMode: "single" | "split";
  onToggleLayout: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onRun,
  onStop,
  isRunning,
  onSync,
  isSyncing,
  onExport,
  onNew,
  onImport,
  darkMode,
  toggleDark,
  viewMode,
  onToggleView,
  isPropsPanelOpen,
  onTogglePropsPanel,
  layoutMode,
  onToggleLayout
}) => {
  const iconProps = { size: 16, strokeWidth: 1.8 };

  return (
    <header className="toolbar-container">
      <div className="toolbar-group">
        <h1 className="toolbar-title">vFlow Desktop</h1>
        <div className="toolbar-actions">
          <Tooltip content="新建工作流">
            <Button
              onClick={onNew}
              variant="secondary"
              data-testid="toolbar-new"
              icon={<FilePlus {...iconProps} />}
            />
          </Tooltip>

          <Tooltip content="打开本地工作流">
            <Button
              onClick={onImport}
              variant="secondary"
              data-testid="toolbar-open"
              icon={<FolderOpen {...iconProps} />}
            />
          </Tooltip>

          <div className="toolbar-separator" />

          <Tooltip content="撤销 (Ctrl+Z)">
            <Button
              onClick={onUndo}
              disabled={!canUndo || isRunning}
              variant="secondary"
              data-testid="toolbar-undo"
              icon={<Undo2 {...iconProps} />}
            />
          </Tooltip>

          <Tooltip content="重做 (Ctrl+Y)">
            <Button
              onClick={onRedo}
              disabled={!canRedo || isRunning}
              variant="secondary"
              data-testid="toolbar-redo"
              icon={<Redo2 {...iconProps} />}
            />
          </Tooltip>
        </div>
      </div>

      <div className="toolbar-actions">
        <Tooltip content="保存 (Ctrl+S)">
          <Button
            onClick={onSave}
            variant="secondary"
            disabled={isRunning}
            data-testid="toolbar-save"
            icon={<Save {...iconProps} />}
          >
            保存
          </Button>
        </Tooltip>

        {!isRunning ? (
          <Tooltip content="运行到 Android 设备 (Ctrl+R)">
            <Button
              onClick={onRun}
              variant="danger"
              style={{ backgroundColor: "var(--color-success)" }}
              data-testid="toolbar-run"
              icon={<Play {...iconProps} />}
            >
              运行
            </Button>
          </Tooltip>
        ) : (
          <Tooltip content="停止运行">
            <Button
              onClick={onStop}
              variant="danger"
              data-testid="toolbar-stop"
              icon={<Play {...iconProps} style={{ transform: "rotate(90deg)" }} />}
            >
              停止
            </Button>
          </Tooltip>
        )}

        <Tooltip content="从设备同步全量模块定义 (需连结手机)">
          <Button
            onClick={onSync}
            variant="secondary"
            disabled={isSyncing}
            data-testid="toolbar-sync"
            icon={isSyncing ? <Loader2 {...iconProps} className="toolbar-spinner" /> : <CloudDownload {...iconProps} />}
          >
            {isSyncing ? "同步中" : "同步模块"}
          </Button>
        </Tooltip>

        <Tooltip content="导出 (Ctrl+E)">
          <Button
            onClick={onExport}
            variant="secondary"
            data-testid="toolbar-export"
            icon={<Download {...iconProps} />}
          >
            导出
          </Button>
        </Tooltip>

        <div className="toolbar-separator" />

        <Tooltip content="切换视图">
          <Button
            onClick={onToggleView}
            variant="secondary"
            className="toolbar-btn-view"
            data-testid="toolbar-toggle-view"
          >
            {viewMode === "graph" ? "</> 代码" : "◎ 图形"}
          </Button>
        </Tooltip>

        <div className="toolbar-separator" />

        <Tooltip content="切换主题">
          <Button
            onClick={toggleDark}
            variant="secondary"
            data-testid="toolbar-toggle-theme"
            icon={darkMode ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
          >
            {darkMode ? "浅色" : "深色"}
          </Button>
        </Tooltip>

        <div className="toolbar-separator" />

        <div className="toolbar-separator" />

        <Tooltip content={layoutMode === "single" ? "开启分屏对比" : "关闭分屏对比"}>
          <Button
            onClick={onToggleLayout}
            variant={layoutMode === "split" ? "secondary" : "ghost"}
            data-testid="toolbar-toggle-layout"
            icon={<Columns {...iconProps} />}
          />
        </Tooltip>

        <div className="toolbar-separator" />

        <Tooltip content={isPropsPanelOpen ? "隐藏属性面板" : "显示属性面板"}>
          <Button
            onClick={onTogglePropsPanel}
            variant={isPropsPanelOpen ? "secondary" : "ghost"}
            data-testid="toolbar-toggle-props"
            icon={isPropsPanelOpen ? <PanelRightClose {...iconProps} /> : <PanelRightOpen {...iconProps} />}
          />
        </Tooltip>
      </div>
    </header>
  );
};
