import { useReducer, useCallback, useRef, ChangeEvent } from "react";
import type { VflowWorkflow, VflowActionStep } from "../domain/vflowTypes";

/* ---------- State & Action 类型 ---------- */

export interface TabState {
  id: string; // 内部页签唯一 ID
  workflow: VflowWorkflow | null;
  rawJson: string;
  undoStack: VflowWorkflow[];
  redoStack: VflowWorkflow[];
  error: string | null;
  filename?: string;
}

export interface WorkspaceState {
  tabs: TabState[];
  activeTabId: string | null;      // 主视图激活的页签
  secondaryTabId: string | null;   // 分屏视图激活的页签
  layoutMode: "single" | "split";
}

type WorkflowAction =
  | { type: "CREATE_NEW"; tabId: string }
  | { type: "LOAD_FILE"; tabId: string; workflow: VflowWorkflow; rawJson: string; filename: string }
  | { type: "LOAD_ERROR"; tabId: string; error: string; rawJson: string; filename: string }
  | { type: "CLOSE_TAB"; tabId: string }
  | { type: "SWITCH_TAB"; tabId: string; pane: "main" | "secondary" }
  | { type: "TOGGLE_LAYOUT"; mode: "single" | "split" }
  | { type: "UPDATE_WORKFLOW"; tabId: string; updater: (wf: VflowWorkflow) => VflowWorkflow }
  | { type: "EDIT_JSON"; tabId: string; rawJson: string }
  | { type: "UNDO"; tabId: string }
  | { type: "REDO"; tabId: string };

/* ---------- Reducer（纯函数） ---------- */

const MAX_UNDO = 50;

function capStack<T>(arr: T[]): T[] {
  if (arr.length > MAX_UNDO) return arr.slice(arr.length - MAX_UNDO);
  return arr;
}

function createEmptyWorkflow(id: string, name: string): VflowWorkflow {
  return {
    id,
    name,
    steps: [],
    isEnabled: true,
    isFavorite: false,
    wasEnabledBeforePermissionsLost: false,
    order: 0
  };
}

function createNewTab(id: string, name: string = "未命名工作流"): TabState {
  const wf = createEmptyWorkflow(crypto.randomUUID(), name);
  return {
    id,
    workflow: wf,
    rawJson: JSON.stringify(wf, null, 2),
    undoStack: [],
    redoStack: [],
    error: null,
    filename: name + ".json"
  };
}

export function workspaceReducer(state: WorkspaceState, action: WorkflowAction): WorkspaceState {
  const updateTab = (tabId: string, updater: (tab: TabState) => TabState): TabState[] => {
    return state.tabs.map(t => t.id === tabId ? updater(t) : t);
  };

  switch (action.type) {
    case "CREATE_NEW": {
      const newTab = createNewTab(action.tabId);
      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id
      };
    }

    case "LOAD_FILE": {
      const existingTab = state.tabs.find(t => t.id === action.tabId);
      const newTab: TabState = {
        id: action.tabId,
        workflow: action.workflow,
        rawJson: action.rawJson,
        undoStack: [],
        redoStack: [],
        error: null,
        filename: action.filename
      };

      if (existingTab) {
        return {
          ...state,
          tabs: updateTab(action.tabId, () => newTab)
        };
      } else {
        return {
          ...state,
          tabs: [...state.tabs, newTab],
          activeTabId: action.tabId
        };
      }
    }

    case "LOAD_ERROR":
      return {
        ...state,
        tabs: updateTab(action.tabId, t => ({
          ...t,
          workflow: null,
          rawJson: action.rawJson,
          error: action.error,
          filename: action.filename
        }))
      };

    case "CLOSE_TAB": {
      const newTabs = state.tabs.filter(t => t.id !== action.tabId);
      let newActive = state.activeTabId;
      let newSecondary = state.secondaryTabId;

      if (state.activeTabId === action.tabId) {
        newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      }
      if (state.secondaryTabId === action.tabId) {
        newSecondary = null;
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: newActive,
        secondaryTabId: newSecondary,
        layoutMode: newTabs.length === 0 ? "single" : state.layoutMode
      };
    }

    case "SWITCH_TAB":
      return action.pane === "main" 
        ? { ...state, activeTabId: action.tabId }
        : { ...state, secondaryTabId: action.tabId };

    case "TOGGLE_LAYOUT":
      return { ...state, layoutMode: action.mode };

    case "UPDATE_WORKFLOW": {
      return {
        ...state,
        tabs: updateTab(action.tabId, tab => {
          if (!tab.workflow) return tab;
          const next = action.updater(tab.workflow);
          if (next === tab.workflow) return tab;
          return {
            ...tab,
            workflow: next,
            rawJson: JSON.stringify(next, null, 2),
            undoStack: capStack([...tab.undoStack, tab.workflow]),
            redoStack: [],
            error: null
          };
        })
      };
    }

    case "EDIT_JSON": {
      return {
        ...state,
        tabs: updateTab(action.tabId, tab => {
          try {
            const parsed = JSON.parse(action.rawJson) as VflowWorkflow;
            return {
              ...tab,
              workflow: parsed,
              rawJson: action.rawJson,
              undoStack: capStack(tab.workflow ? [...tab.undoStack, tab.workflow] : [...tab.undoStack]),
              redoStack: [],
              error: null
            };
          } catch (e) {
            return {
              ...tab,
              rawJson: action.rawJson,
              error: (e as Error).message
            };
          }
        })
      };
    }

    case "UNDO": {
      return {
        ...state,
        tabs: updateTab(action.tabId, tab => {
          if (!tab.workflow || tab.undoStack.length === 0) return tab;
          const prev = tab.undoStack[tab.undoStack.length - 1];
          return {
            ...tab,
            workflow: prev,
            rawJson: JSON.stringify(prev, null, 2),
            undoStack: tab.undoStack.slice(0, -1),
            redoStack: [...tab.redoStack, tab.workflow],
            error: null
          };
        })
      };
    }

    case "REDO": {
      return {
        ...state,
        tabs: updateTab(action.tabId, tab => {
          if (!tab.workflow || tab.redoStack.length === 0) return tab;
          const next = tab.redoStack[tab.redoStack.length - 1];
          return {
            ...tab,
            workflow: next,
            rawJson: JSON.stringify(next, null, 2),
            undoStack: [...tab.undoStack, tab.workflow],
            redoStack: tab.redoStack.slice(0, -1),
            error: null
          };
        })
      };
    }

    default:
      return state;
  }
}

const initialState: WorkspaceState = {
  tabs: [],
  activeTabId: null,
  secondaryTabId: null,
  layoutMode: "single"
};

/* ---------- Hook ---------- */

export function useWorkflow() {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  const jsonEditTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUndo = useCallback((tabId: string) => dispatch({ type: "UNDO", tabId }), []);
  const handleRedo = useCallback((tabId: string) => dispatch({ type: "REDO", tabId }), []);

  const applyWorkflowUpdate = useCallback(
    (tabId: string, updater: (wf: VflowWorkflow) => VflowWorkflow) => {
      dispatch({ type: "UPDATE_WORKFLOW", tabId, updater });
    },
    []
  );

  const handleAddStepFromModule = useCallback((tabId: string, moduleId: string, insertIndex?: number) => {
    const newStep: VflowActionStep = {
      id: crypto.randomUUID(),
      moduleId,
      parameters: {},
      indentationLevel: 0
    };
    dispatch({
      type: "UPDATE_WORKFLOW",
      tabId,
      updater: (prev: VflowWorkflow) => {
        const newSteps = [...prev.steps];
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= newSteps.length) {
          newSteps.splice(insertIndex, 0, newStep);
        } else {
          newSteps.push(newStep);
        }
        return { ...prev, steps: newSteps };
      }
    });
  }, []);

  const handleStepParamsChange = useCallback(
    (tabId: string, stepId: string, params: Record<string, any>) => {
      dispatch({
        type: "UPDATE_WORKFLOW",
        tabId,
        updater: (prev: VflowWorkflow) => ({
          ...prev,
          steps: prev.steps.map(s => (s.id === stepId ? { ...s, parameters: params } : s))
        })
      });
    },
    []
  );

  const handleDeleteSteps = useCallback((tabId: string, stepIds: string[]) => {
    dispatch({
      type: "UPDATE_WORKFLOW",
      tabId,
      updater: (prev: VflowWorkflow) => {
        const toDelete = new Set(stepIds);
        return { ...prev, steps: prev.steps.filter(s => !toDelete.has(s.id)) };
      }
    });
  }, []);

  const handleOpenWorkflow = useCallback((workflow: VflowWorkflow, filename: string) => {
    const tabId = crypto.randomUUID();
    dispatch({
      type: "LOAD_FILE",
      tabId,
      workflow,
      rawJson: JSON.stringify(workflow, null, 2),
      filename
    });
  }, []);

  const handleCreateNew = useCallback(() => {
    dispatch({ type: "CREATE_NEW", tabId: crypto.randomUUID() });
  }, []);

  const handleCloseTab = useCallback((tabId: string) => {
    dispatch({ type: "CLOSE_TAB", tabId });
  }, []);

  const handleSwitchTab = useCallback((tabId: string, pane: "main" | "secondary" = "main") => {
    dispatch({ type: "SWITCH_TAB", tabId, pane });
  }, []);

  const handleToggleLayout = useCallback((mode: "single" | "split") => {
    dispatch({ type: "TOGGLE_LAYOUT", mode });
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed.id !== "string" || !Array.isArray(parsed.steps)) {
          throw new Error("JSON 结构不是有效的 vFlow Workflow");
        }
        const wf = parsed as VflowWorkflow;
        handleOpenWorkflow(wf, file.name);
      } catch (e) {
        // 对于直接上传的文件错误，我们目前无法轻易将其放入一个尚未创建的 tab，
        // 这里简化处理：创建一个新的出错 tab
        const tabId = crypto.randomUUID();
        const message = e instanceof Error ? e.message : "解析 JSON 失败";
        dispatch({ type: "LOAD_ERROR", tabId, error: message, rawJson: String(reader.result ?? ""), filename: file.name });
      }
    };
    reader.onerror = () => {
      const tabId = crypto.randomUUID();
      dispatch({ type: "LOAD_ERROR", tabId, error: "读取文件失败", rawJson: "", filename: file.name });
    };
    reader.readAsText(file, "utf-8");
  }, [handleOpenWorkflow]);

  const handleDebouncedJsonEdit = useCallback((tabId: string, val: string | undefined) => {
    if (val === undefined) return;
    if (jsonEditTimerRef.current) clearTimeout(jsonEditTimerRef.current);
    jsonEditTimerRef.current = setTimeout(() => {
      dispatch({ type: "EDIT_JSON", tabId, rawJson: val });
    }, 500);
  }, []);

  /** 获取 timer ref 供外部清理 */
  const getJsonEditTimerRef = useCallback(() => jsonEditTimerRef, []);

  return {
    state,
    dispatch,
    handleUndo,
    handleRedo,
    applyWorkflowUpdate,
    handleAddStepFromModule,
    handleStepParamsChange,
    handleDeleteSteps,
    handleFileChange,
    handleOpenWorkflow,
    handleCreateNew,
    handleCloseTab,
    handleSwitchTab,
    handleToggleLayout,
    handleDebouncedJsonEdit,
    getJsonEditTimerRef
  } as const;
}
