import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { VflowWorkflow, VflowModuleOption, VflowActionStep } from "../domain/vflowTypes";
import { getModuleName, getModuleColor } from "../shared/moduleUtils";
import "./styles/WorkflowGraph.css";
import "./styles/JsonOutline.css";

interface WorkflowGraphProps {
  workflow: VflowWorkflow | null;
  selectedStepId: string | null;
  selectedStepIds: Set<string>;
  moduleOptions: VflowModuleOption[];
  onStepClick: (stepId: string, ctrlKey: boolean, shiftKey: boolean) => void;
  onReorder: (orderedIds: string[]) => void;
  onAddStepFromModule: (moduleId: string, insertIndex?: number) => void;
  onEditStep: (stepId: string) => void;
  onUpdateWorkflow: (updater: (wf: VflowWorkflow) => VflowWorkflow) => void;
  onSetSelectedStepId: (id: string | null) => void;
  onDeleteSteps: (stepIds: string[]) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onModuleUsageUpdate: (moduleId: string) => void;
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  workflow,
  selectedStepId,
  selectedStepIds,
  moduleOptions,
  onStepClick,
  onReorder,
  onAddStepFromModule,
  onEditStep,
  onDeleteSteps,
  onModuleUsageUpdate
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | null>(null);
  const [dropHint, setDropHint] = useState<string | null>(null);
  const dropHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // 用于点击目录后滚动到对应的 block
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedStepIds.size > 0) {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        onDeleteSteps(Array.from(selectedStepIds));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStepIds, onDeleteSteps]);

  const showDropHint = useCallback((msg: string) => {
    setDropHint(msg);
    if (dropHintTimerRef.current) clearTimeout(dropHintTimerRef.current);
    dropHintTimerRef.current = setTimeout(() => setDropHint(null), 3000);
  }, []);

  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    e.dataTransfer.setData("application/vflow-step", stepId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedId(stepId);
  };

  const handleDragOver = (e: React.DragEvent, stepId?: string) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止冒泡到外层容器，否则会被立刻清空
    if (stepId) {
      setDropTargetId(stepId);
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const isTop = e.clientY - rect.top < rect.height / 2;
      setDropPosition(isTop ? "top" : "bottom");
    } else {
      setDropTargetId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStepId?: string) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止冒泡
    setDropTargetId(null);
    setDraggedId(null);
    const position = dropPosition;
    setDropPosition(null);

    if (!workflow) {
      showDropHint("请先在左侧加载一个 Workflow JSON。");
      return;
    }

    // 处理内部重新排序
    const stepId = e.dataTransfer.getData("application/vflow-step");
    if (stepId && targetStepId && stepId !== targetStepId) {
      const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
      if (stepIndex >= 0) {
        const newIds = workflow.steps.map(s => s.id);
        newIds.splice(stepIndex, 1);
        const newTargetIndex = newIds.indexOf(targetStepId);
        
        if (newTargetIndex >= 0) {
          const insertIndex = position === "bottom" ? newTargetIndex + 1 : newTargetIndex;
          newIds.splice(insertIndex, 0, stepId);
          onReorder(newIds);
        }
      }
      return;
    }

    // 处理外部模块拖入
    const moduleId = e.dataTransfer.getData("application/reactflow-module");
    if (moduleId) {
      const exists = moduleOptions.some(m => m.id === moduleId);
      if (!exists) {
        showDropHint("当前模块列表中不存在该模块，可能与 vFlow 版本不匹配");
        return;
      }
      onModuleUsageUpdate(moduleId);
      
      let insertIndex = workflow.steps.length;
      if (targetStepId) {
        const targetIndex = workflow.steps.findIndex(s => s.id === targetStepId);
        if (targetIndex >= 0) {
          insertIndex = position === "bottom" ? targetIndex + 1 : targetIndex;
        }
      }
      onAddStepFromModule(moduleId, insertIndex);
    }
  };

  // 渲染每个步骤的“积木”
  const renderBlocks = () => {
    if (!workflow || workflow.steps.length === 0) {
      return (
        <div 
          className="workflow-empty-hint"
          onDragOver={e => handleDragOver(e)}
          onDrop={e => handleDrop(e)}
        >
          请先在左侧加载一个 Workflow JSON，或从左侧拖拽模块到此处。
        </div>
      );
    }

    return workflow.steps.map((step, index) => {
      const displayName = getModuleName(moduleOptions, step.moduleId);
      const color = getModuleColor(moduleOptions, step.moduleId);
      const isSelected = selectedStepIds.has(step.id);
      const isPrimarySelected = step.id === selectedStepId;
      const isDropTarget = dropTargetId === step.id;
      const isDragged = draggedId === step.id;

      let summary = "";
      const params = step.parameters as any;
      if (params) {
        if (step.moduleId === "vflow.device.delay" && params.duration) summary = `${params.duration}ms`;
        else if (step.moduleId === "vflow.device.click" && params.target) summary = String(params.target);
        else if (step.moduleId === "vflow.interaction.input_text" && params.text) summary = String(params.text);
        else if (params.url) summary = String(params.url);
        else if (params.path) summary = String(params.path);
        if (summary.length > 30) summary = summary.slice(0, 30) + "...";
      }

      return (
        <React.Fragment key={step.id}>
          {isDropTarget && !isDragged && dropPosition === "top" && <div className="workflow-drop-indicator" />}
          <div
            ref={el => { if (el) blockRefs.current.set(step.id, el); }}
            className={`workflow-block ${isSelected ? "selected" : ""} ${isPrimarySelected && selectedStepIds.size > 1 ? "primary-selected" : ""} ${isDragged ? "dragged" : ""}`}
            style={{ borderLeftColor: color }}
            draggable
            onDragStart={e => handleDragStart(e, step.id)}
            onDragOver={e => handleDragOver(e, step.id)}
            onDrop={e => handleDrop(e, step.id)}
            onClick={(e) => onStepClick(step.id, e.ctrlKey || e.metaKey, e.shiftKey)}
            onDoubleClick={() => onEditStep(step.id)}
            data-step-id={step.id}
          >
            <div className="workflow-block-header">
              <span className="workflow-block-index">#{index + 1}</span>
              <span className="workflow-block-title">{displayName}</span>
              <span className="workflow-block-subtitle">{summary || displayName}</span>
            </div>
          </div>
          {isDropTarget && !isDragged && dropPosition === "bottom" && <div className="workflow-drop-indicator" />}
        </React.Fragment>
      );
    });
  };

  // 生成右侧目录
  const renderOutline = () => {
    if (!workflow || workflow.steps.length === 0) return null;
    
    return (
      <div className="json-outline" style={{ right: 8, top: 8, bottom: 8 }}>
        <div className="json-outline-title">执行目录</div>
        <div className="json-outline-list">
          {workflow.steps.map((step, index) => {
            const displayName = getModuleName(moduleOptions, step.moduleId);
            const isActive = step.id === selectedStepId;
            return (
              <button
                key={step.id}
                className={`json-outline-item depth-1 kind-step ${isActive ? "active" : ""}`}
                onClick={(e) => {
                  onStepClick(step.id, e.ctrlKey || e.metaKey, e.shiftKey);
                  const el = blockRefs.current.get(step.id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                <span className="json-outline-icon">◆</span>
                <span className="json-outline-label">#{index + 1} {displayName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="workflow-container">
      <div 
        className="workflow-blocks-wrapper"
        onDragOver={e => {
          e.preventDefault();
          setDropTargetId(null);
        }}
        onDrop={e => handleDrop(e)}
      >
        <div className="workflow-blocks-list">
          {renderBlocks()}
        </div>
        
        {/* 多选 / 快捷键反馈提示 */}
        {selectedStepIds.size === 1 && (
          <div className="workflow-selection-hint">
            💡 按住 <kbd>Ctrl</kbd> 或 <kbd>Shift</kbd> 点击节点可多选，选中后按 <kbd>Ctrl+C</kbd> 可复制
          </div>
        )}
        {selectedStepIds.size > 1 && (
          <div className="workflow-selection-hint active">
            ✅ 已批量选中 <strong>{selectedStepIds.size}</strong> 个节点。按 <kbd>Ctrl+C</kbd> 复制，按 <kbd>Delete</kbd> 删除
          </div>
        )}

        {dropHint && (
          <div className="workflow-drop-hint">
            {dropHint}
          </div>
        )}
      </div>
      {renderOutline()}
    </div>
  );
};
