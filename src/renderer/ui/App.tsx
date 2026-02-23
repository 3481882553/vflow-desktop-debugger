import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import type { VflowActionStep } from "../domain/vflowTypes";
import { JsonOutline } from "./JsonOutline";
import { WorkflowGraph } from "./WorkflowGraph";
import { TopToolbar } from "./TopToolbar";
import { LeftModulePanel } from "./LeftModulePanel";
import { RightPropsPanel } from "./RightPropsPanel";
import { useWorkflow } from "../hooks/useWorkflow";
import { useSchemas } from "../hooks/useSchemas";
import { useKeyboard } from "../hooks/useKeyboard";
import { useModules } from "../hooks/useModules";
import { useTheme } from "../hooks/useTheme";
import { ConsolePanel, type LogEntry } from "./ConsolePanel";
import { TabStrip } from "./TabStrip";
import "./styles/App.css";

/* ---------- 主组件 ---------- */
export const App: React.FC = () => {
  /* ----- Hooks ----- */
  const {
    state,
    handleUndo,
    handleRedo,
    applyWorkflowUpdate,
    handleAddStepFromModule,
    handleStepParamsChange,
    handleDeleteSteps,
    handleFileChange: _handleFileChange,
    handleOpenWorkflow: _handleOpenWorkflow,
    handleCreateNew,
    handleCloseTab,
    handleSwitchTab,
    handleToggleLayout,
    handleDebouncedJsonEdit,
    getJsonEditTimerRef
  } = useWorkflow();


  const { tabs, activeTabId, secondaryTabId, layoutMode } = state;

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || null, [tabs, activeTabId]);
  const secondaryTab = useMemo(() => tabs.find(t => t.id === secondaryTabId) || null, [tabs, secondaryTabId]);


  const { moduleOptions, handleModuleUsageUpdate } = useModules();
  const { darkMode, toggleDark } = useTheme();
  const { schemas, isSyncing, syncSchemas } = useSchemas();

  /* ----- 本地 UI 状态 ----- */
  const [viewMode, setViewMode] = useState<"code" | "graph">("graph");
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedStepIds, setSelectedStepIds] = useState<Set<string>>(new Set());
  const [copiedSteps, setCopiedSteps] = useState<VflowActionStep[]>([]);
  const [monacoEditor, setMonacoEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [activeLine, setActiveLine] = useState<number>(1);

  /* ----- 面板宽度状态 ----- */
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(320);
  const [isPropsPanelOpen, setIsPropsPanelOpen] = useState(true);

  /* ----- 调试状态 ----- */
  const [debugState, setDebugState] = useState<"idle" | "running" | "stopped">("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  // 自动创建第一个工作流
  useEffect(() => {
    if (tabs.length === 0) {
      handleCreateNew();
    }
  }, [tabs.length, handleCreateNew]);


  useEffect(() => {
    if (window.vflowDesktop?.onDebugLog) {
      window.vflowDesktop.onDebugLog((log) => {
        setLogs(prev => [...prev, log]);
      });
    }
    if (window.vflowDesktop?.onDebugStateChanged) {
      window.vflowDesktop.onDebugStateChanged((state) => {
        setDebugState(state);
      });
    }
  }, []);

  const handleLeftResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMove = (moveEvent: PointerEvent) => {
      const newWidth = Math.max(150, Math.min(600, startWidth + (moveEvent.clientX - startX)));
      setLeftWidth(newWidth);
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [leftWidth]);

  const handleRightResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightWidth;

    const onMove = (moveEvent: PointerEvent) => {
      const newWidth = Math.max(200, Math.min(800, startWidth - (moveEvent.clientX - startX)));
      setRightWidth(newWidth);
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [rightWidth]);

  /* ----- Monaco Editor 挂载 ----- */
  const handleEditorMount: OnMount = useCallback((editor) => {
    setMonacoEditor(editor);
    editor.onDidChangeCursorPosition(e => {
      setActiveLine(e.position.lineNumber);
    });
  }, []);

  /* ----- 清理 JSON 编辑 timer ----- */
  useEffect(() => {
    const timerRef = getJsonEditTimerRef();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [getJsonEditTimerRef]);

  /* ----- 文件加载（需要额外清空选中） ----- */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      _handleFileChange(event);
      setSelectedStepId(null);
      setSelectedStepIds(new Set());
    },
    [_handleFileChange]
  );

  /* ----- 保存 / 导出 / 运行 ----- */
  const handleSave = useCallback(() => {
    if (!activeTab?.workflow) return;
    const { workflow } = activeTab;
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name || "workflow"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTab]);

  const handleExport = useCallback(() => {
    if (!activeTab?.workflow) return;
    const { workflow } = activeTab;
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflow.name || "workflow"}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTab]);

  const handleRun = useCallback(async () => {
    if (!activeTab?.workflow) return;
    setLogs(prev => [...prev, { timestamp: Date.now(), level: "INFO", message: "🚀 正在推送流程到安卓端..." }]);
    try {
      if (window.vflowDesktop?.runDebugWorkflow) {
        const result = await window.vflowDesktop.runDebugWorkflow(JSON.stringify(activeTab.workflow));
        if (result?.success) {
          setLogs(prev => [...prev, { timestamp: Date.now(), level: "INFO", message: "✅ 推送成功，由于安卓端尚未实现 Server，手机端暂不会有反应。" }]);
        } else {
          setLogs(prev => [...prev, { timestamp: Date.now(), level: "ERROR", message: `❌ 推送失败: ${result?.error || "未知错误"}` }]);
        }
      }
    } catch (e) {
      setLogs(prev => [...prev, { timestamp: Date.now(), level: "ERROR", message: `❌ 通信异常: ${(e as Error).message}` }]);
    }
  }, [activeTab]);



  const handleStop = useCallback(async () => {
    if (!window.vflowDesktop?.stopDebugWorkflow) return;
    setLogs(prev => [...prev, { timestamp: Date.now(), level: "WARN", message: "⏹ 用户主动中断运行。" }]);
    await window.vflowDesktop.stopDebugWorkflow();
    setDebugState("stopped");
  }, []);

  const handleSyncSchemas = useCallback(async () => {
    setLogs(prev => [...prev, { timestamp: Date.now(), level: "INFO", message: "🔄 开始拉取云端动态 UI 协议..." }]);
    setIsConsoleOpen(true);
    const res = await syncSchemas();
    if (res.success) {
      setLogs(prev => [...prev, { timestamp: Date.now(), level: "INFO", message: "✅ UI 协议全量拉取成功并已生效。" }]);
    } else {
      setLogs(prev => [...prev, { timestamp: Date.now(), level: "ERROR", message: `❌ UI 协议拉取失败: ${res.error}` }]);
    }
  }, [syncSchemas]);

  /* ----- 节点处理（带 tabId） ----- */
  const handleDeleteStepAndClear = useCallback(
    (tabId: string, stepId: string) => {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab?.workflow) return;
      const toDelete = selectedStepIds.has(stepId) ? Array.from(selectedStepIds) : [stepId];
      handleDeleteSteps(tabId, toDelete);
      setSelectedStepId(null);
      setSelectedStepIds(new Set());
    },
    [selectedStepIds, handleDeleteSteps, tabs]
  );

  const handleStepClick = useCallback((tabId: string, workflow: any, stepId: string, ctrlKey: boolean, shiftKey: boolean) => {
    if (!workflow) return;
    if (ctrlKey) {
      const newSet = new Set(selectedStepIds);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
        setSelectedStepIds(newSet);
        if (selectedStepId === stepId) {
          setSelectedStepId(newSet.size > 0 ? Array.from(newSet)[newSet.size - 1] : null);
        }
      } else {
        newSet.add(stepId);
        setSelectedStepIds(newSet);
        setSelectedStepId(stepId);
      }
    } else if (shiftKey && selectedStepId) {
      const steps = workflow.steps as VflowActionStep[];
      const startIndex = steps.findIndex(s => s.id === selectedStepId);
      const endIndex = steps.findIndex(s => s.id === stepId);
      if (startIndex >= 0 && endIndex >= 0) {
        const minIndex = Math.min(startIndex, endIndex);
        const maxIndex = Math.max(startIndex, endIndex);
        const newSet = new Set(selectedStepIds);
        for (let i = minIndex; i <= maxIndex; i++) {
          newSet.add(steps[i].id);
        }
        setSelectedStepIds(newSet);
      }
    } else {
      setSelectedStepIds(new Set([stepId]));
      setSelectedStepId(stepId);
    }
  }, [selectedStepIds, selectedStepId]);

  const handleCopy = useCallback(() => {
    if (!activeTab?.workflow || selectedStepIds.size === 0) return;
    const stepsToCopy = activeTab.workflow.steps.filter(s => selectedStepIds.has(s.id));
    setCopiedSteps(stepsToCopy);
  }, [activeTab, selectedStepIds]);

  const handlePaste = useCallback((tabId: string) => {
    if (copiedSteps.length === 0) return;
    applyWorkflowUpdate(tabId, prev => {
      const newSteps = [...prev.steps];
      let insertIndex = newSteps.length;
      if (selectedStepId) {
        const targetIndex = newSteps.findIndex(s => s.id === selectedStepId);
        if (targetIndex >= 0) insertIndex = targetIndex + 1;
      }
      const pasted = copiedSteps.map(s => ({ ...s, id: crypto.randomUUID() }));
      newSteps.splice(insertIndex, 0, ...pasted);
      return { ...prev, steps: newSteps };
    });
  }, [copiedSteps, selectedStepId, applyWorkflowUpdate]);

  const handleReorder = useCallback((tabId: string, orderedIds: string[]) => {
    applyWorkflowUpdate(tabId, prev => {
      const idToStep = new Map(prev.steps.map(s => [s.id, s]));
      const reordered = orderedIds.map(id => idToStep.get(id)).filter(Boolean) as VflowActionStep[];
      const tail = prev.steps.filter(s => !orderedIds.includes(s.id));
      return { ...prev, steps: [...reordered, ...tail] };
    });
  }, [applyWorkflowUpdate]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ----- 全局快捷键 ----- */
  const saveRef = useRef<() => void>(() => {});
  saveRef.current = handleSave;
  const copyRef = useRef<() => void>(() => {});
  copyRef.current = handleCopy;
  const pasteRef = useRef<() => void>(() => {});
  pasteRef.current = () => activeTabId && handlePaste(activeTabId);

  useKeyboard({
    onUndo: () => activeTabId && handleUndo(activeTabId),
    onRedo: () => activeTabId && handleRedo(activeTabId),
    saveRef, copyRef, pasteRef
  });

  /* ----- 计算当前选中节点的 schema ----- */
  const selectedStep = useMemo(
    () => activeTab?.workflow?.steps.find(s => s.id === selectedStepId) ?? null,
    [activeTab, selectedStepId]
  );
  const currentSchema = useMemo(
    () => (selectedStep ? schemas[selectedStep.moduleId] ?? [] : []),
    [selectedStep, schemas]
  );

  /* ---------- 渲染辅助 ---------- */
  const renderWorkspace = (tab: typeof activeTab, isSecondary = false) => {
    if (!tab) return <div className="app-main-placeholder">未打开工作流</div>;
    const { workflow, rawJson, error, id } = tab;

    return (
      <div className={`app-canvas-container ${isSecondary ? "secondary" : ""}`}>
        {viewMode === "graph" && (
          <WorkflowGraph
            workflow={workflow}
            selectedStepId={selectedStepId}
            selectedStepIds={selectedStepIds}
            moduleOptions={moduleOptions}
            onStepClick={(sid, ctrl, shift) => handleStepClick(id, workflow, sid, ctrl, shift)}
            onReorder={(ids) => handleReorder(id, ids)}
            onAddStepFromModule={(mid, idx) => handleAddStepFromModule(id, mid, idx)}
            onEditStep={sid => setSelectedStepId(sid)}
            onUpdateWorkflow={updater => applyWorkflowUpdate(id, updater)}
            onSetSelectedStepId={(sid) => {
              setSelectedStepId(sid);
              setSelectedStepIds(sid ? new Set([sid]) : new Set());
            }}
            onDeleteSteps={(ids) => handleDeleteSteps(id, ids)}
            onUndo={() => handleUndo(id)}
            onRedo={() => handleRedo(id)}
            onSave={handleSave}
            onModuleUsageUpdate={handleModuleUsageUpdate}
          />
        )}
        {viewMode === "code" && (
          <div className="app-code-editor">
            <Editor
              language="json"
              theme={darkMode ? "vs-dark" : "vs"}
              value={rawJson}
              onChange={val => handleDebouncedJsonEdit(id, val)}
              onMount={handleEditorMount}
              options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: "on", automaticLayout: true }}
            />
            <JsonOutline rawJson={rawJson} editorRef={monacoEditor} activeLine={activeLine} moduleOptions={moduleOptions} />
            {error && <div className="app-error-msg">{error}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <TopToolbar
        canUndo={!!(activeTab && activeTab.undoStack.length > 0)}
        canRedo={!!(activeTab && activeTab.redoStack.length > 0)}
        onUndo={() => activeTabId && handleUndo(activeTabId)}
        onRedo={() => activeTabId && handleRedo(activeTabId)}
        onSave={handleSave}
        onRun={handleRun}
        onStop={handleStop}
        isRunning={debugState === "running"}
        onSync={handleSyncSchemas}
        isSyncing={isSyncing}
        onExport={handleExport}
        onNew={handleCreateNew}
        onImport={() => fileInputRef.current?.click()}
        darkMode={darkMode}
        toggleDark={toggleDark}
        viewMode={viewMode}
        onToggleView={() => setViewMode(v => v === "graph" ? "code" : "graph")}
        isPropsPanelOpen={isPropsPanelOpen}
        onTogglePropsPanel={() => setIsPropsPanelOpen(o => !o)}
        layoutMode={layoutMode}
        onToggleLayout={() => handleToggleLayout(layoutMode === "single" ? "split" : "single")}
      />

      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept=".json" />

      <div className="app-body">
        <aside className="app-sidebar" style={{ width: leftWidth }}>
          <LeftModulePanel
            modules={moduleOptions}
            onDragStart={(e, moduleId) => {
              e.dataTransfer.setData("application/reactflow-module", moduleId);
              e.dataTransfer.effectAllowed = "move";
            }}
          />
        </aside>

        <div className="app-resizer" onPointerDown={handleLeftResize} />

        <main className="app-main">
          <TabStrip
            tabs={tabs.map(t => ({ id: t.id, name: t.filename || "Untitled", isModified: t.undoStack.length > 0 }))}
            activeTabId={activeTabId}
            onTabClick={id => handleSwitchTab(id, "main")}
            onTabClose={(id, e) => { e.stopPropagation(); handleCloseTab(id); }}
          />

          <div className={`app-workspace-layout ${layoutMode}`}>
            {renderWorkspace(activeTab)}
            {layoutMode === "split" && (
              <div className="app-split-pane">
                <div className="app-split-header">
                  <span>次要视图 (只读参考)</span>
                  <select 
                    value={secondaryTabId || ""} 
                    onChange={e => handleSwitchTab(e.target.value, "secondary")}
                  >
                    <option value="">选择要对比的页签...</option>
                    {tabs.map(t => <option key={t.id} value={t.id}>{t.filename}</option>)}
                  </select>
                </div>
                {renderWorkspace(secondaryTab, true)}
              </div>
            )}
          </div>

          <ConsolePanel logs={logs} isOpen={isConsoleOpen} onToggle={() => setIsConsoleOpen(o => !o)} onClear={() => setLogs([])} />
        </main>

        {isPropsPanelOpen && <div className="app-resizer" onPointerDown={handleRightResize} />}

        <aside className="app-props-panel" style={{ width: isPropsPanelOpen ? rightWidth : 0, overflow: "hidden", borderLeftWidth: isPropsPanelOpen ? 1 : 0 }}>
          <RightPropsPanel
            step={selectedStep}
            schema={currentSchema}
            onChange={params => {
              if (selectedStepId && activeTabId) handleStepParamsChange(activeTabId, selectedStepId, params);
            }}
          />
        </aside>
      </div>
    </div>
  );
};

