import { describe, it, expect } from "vitest";
import type { WorkspaceState } from "../../src/renderer/hooks/useWorkflow";
import { workspaceReducer } from "../../src/renderer/hooks/useWorkflow";

function createState(overrides?: Partial<WorkspaceState>): WorkspaceState {
  return {
    tabs: [],
    activeTabId: null,
    secondaryTabId: null,
    layoutMode: "single",
    ...overrides
  };
}

describe("workspaceReducer", () => {
  it("CREATE_NEW creates a new tab and activates it", () => {
    const state = createState();
    const next = workspaceReducer(state, { type: "CREATE_NEW", tabId: "tab-1" });
    expect(next.tabs).toHaveLength(1);
    expect(next.activeTabId).toBe("tab-1");
    expect(next.tabs[0].workflow).not.toBeNull();
    expect(next.tabs[0].rawJson).toContain('"steps"');
  });

  it("UPDATE_WORKFLOW pushes undo and clears redo", () => {
    const wf = {
      id: "wf-1",
      name: "A",
      steps: [],
      isEnabled: true,
      isFavorite: false,
      wasEnabledBeforePermissionsLost: false,
      order: 0
    };
    const state = createState({
      tabs: [
        {
          id: "tab-1",
          workflow: wf,
          rawJson: JSON.stringify(wf),
          undoStack: [],
          redoStack: [{ ...wf, name: "redo" }],
          error: null
        }
      ],
      activeTabId: "tab-1"
    });

    const next = workspaceReducer(state, {
      type: "UPDATE_WORKFLOW",
      tabId: "tab-1",
      updater: (prev) => ({ ...prev, name: "B" })
    });

    const tab = next.tabs[0];
    expect(tab.workflow?.name).toBe("B");
    expect(tab.undoStack).toHaveLength(1);
    expect(tab.redoStack).toHaveLength(0);
  });

  it("EDIT_JSON updates workflow on valid json and sets error on invalid json", () => {
    const wf = {
      id: "wf-1",
      name: "A",
      steps: [],
      isEnabled: true,
      isFavorite: false,
      wasEnabledBeforePermissionsLost: false,
      order: 0
    };
    const state = createState({
      tabs: [
        {
          id: "tab-1",
          workflow: wf,
          rawJson: JSON.stringify(wf),
          undoStack: [],
          redoStack: [],
          error: null
        }
      ]
    });

    const validJson = JSON.stringify({ ...wf, name: "B" }, null, 2);
    const nextValid = workspaceReducer(state, {
      type: "EDIT_JSON",
      tabId: "tab-1",
      rawJson: validJson
    });
    expect(nextValid.tabs[0].workflow?.name).toBe("B");
    expect(nextValid.tabs[0].error).toBeNull();

    const nextInvalid = workspaceReducer(state, {
      type: "EDIT_JSON",
      tabId: "tab-1",
      rawJson: "{ invalid"
    });
    expect(nextInvalid.tabs[0].error).toBeTruthy();
  });

  it("UNDO and REDO moves through history", () => {
    const wfA = {
      id: "wf-1",
      name: "A",
      steps: [],
      isEnabled: true,
      isFavorite: false,
      wasEnabledBeforePermissionsLost: false,
      order: 0
    };
    const wfB = { ...wfA, name: "B" };
    const state = createState({
      tabs: [
        {
          id: "tab-1",
          workflow: wfB,
          rawJson: JSON.stringify(wfB),
          undoStack: [wfA],
          redoStack: [],
          error: null
        }
      ]
    });

    const undone = workspaceReducer(state, { type: "UNDO", tabId: "tab-1" });
    expect(undone.tabs[0].workflow?.name).toBe("A");
    expect(undone.tabs[0].redoStack).toHaveLength(1);

    const redone = workspaceReducer(undone, { type: "REDO", tabId: "tab-1" });
    expect(redone.tabs[0].workflow?.name).toBe("B");
  });

  it("CLOSE_TAB updates active and secondary", () => {
    const state = createState({
      tabs: [
        {
          id: "tab-1",
          workflow: null,
          rawJson: "",
          undoStack: [],
          redoStack: [],
          error: null
        },
        {
          id: "tab-2",
          workflow: null,
          rawJson: "",
          undoStack: [],
          redoStack: [],
          error: null
        }
      ],
      activeTabId: "tab-2",
      secondaryTabId: "tab-1",
      layoutMode: "split"
    });

    const next = workspaceReducer(state, { type: "CLOSE_TAB", tabId: "tab-2" });
    expect(next.activeTabId).toBe("tab-1");
    expect(next.secondaryTabId).toBe("tab-1");
  });

  it("SWITCH_TAB and TOGGLE_LAYOUT", () => {
    const state = createState();
    const switched = workspaceReducer(state, { type: "SWITCH_TAB", tabId: "tab-1", pane: "main" });
    expect(switched.activeTabId).toBe("tab-1");
    const layout = workspaceReducer(switched, { type: "TOGGLE_LAYOUT", mode: "split" });
    expect(layout.layoutMode).toBe("split");
  });

  it("caps undo stack to max 50 snapshots", () => {
    const wf = {
      id: "wf-1",
      name: "N0",
      steps: [],
      isEnabled: true,
      isFavorite: false,
      wasEnabledBeforePermissionsLost: false,
      order: 0
    };
    let state = createState({
      tabs: [
        {
          id: "tab-1",
          workflow: wf,
          rawJson: JSON.stringify(wf),
          undoStack: [],
          redoStack: [],
          error: null
        }
      ]
    });

    for (let i = 1; i <= 60; i += 1) {
      state = workspaceReducer(state, {
        type: "UPDATE_WORKFLOW",
        tabId: "tab-1",
        updater: (prev) => ({ ...prev, name: `N${i}` })
      });
    }

    const tab = state.tabs[0];
    expect(tab.undoStack).toHaveLength(50);
    expect(tab.undoStack[0].name).toBe("N10");
    expect(tab.workflow?.name).toBe("N60");
  });

  it("closes last tab and resets layout to single", () => {
    const state = createState({
      tabs: [
        {
          id: "tab-1",
          workflow: null,
          rawJson: "",
          undoStack: [],
          redoStack: [],
          error: null
        }
      ],
      activeTabId: "tab-1",
      secondaryTabId: "tab-1",
      layoutMode: "split"
    });

    const next = workspaceReducer(state, { type: "CLOSE_TAB", tabId: "tab-1" });
    expect(next.tabs).toHaveLength(0);
    expect(next.activeTabId).toBeNull();
    expect(next.secondaryTabId).toBeNull();
    expect(next.layoutMode).toBe("single");
  });

  it("keeps accumulating edit json history on rapid edits", () => {
    const wf = {
      id: "wf-1",
      name: "A",
      steps: [],
      isEnabled: true,
      isFavorite: false,
      wasEnabledBeforePermissionsLost: false,
      order: 0
    };
    let state = createState({
      tabs: [
        {
          id: "tab-1",
          workflow: wf,
          rawJson: JSON.stringify(wf),
          undoStack: [],
          redoStack: [],
          error: null
        }
      ]
    });

    state = workspaceReducer(state, {
      type: "EDIT_JSON",
      tabId: "tab-1",
      rawJson: JSON.stringify({ ...wf, name: "B" })
    });
    state = workspaceReducer(state, {
      type: "EDIT_JSON",
      tabId: "tab-1",
      rawJson: JSON.stringify({ ...wf, name: "C" })
    });

    expect(state.tabs[0].workflow?.name).toBe("C");
    expect(state.tabs[0].undoStack).toHaveLength(2);
  });
});
