import type { Page } from "@playwright/test";

export const toolbar = (page: Page) => ({
  newBtn: page.getByTestId("toolbar-new"),
  openBtn: page.getByTestId("toolbar-open"),
  undoBtn: page.getByTestId("toolbar-undo"),
  redoBtn: page.getByTestId("toolbar-redo"),
  saveBtn: page.getByTestId("toolbar-save"),
  runBtn: page.getByTestId("toolbar-run"),
  stopBtn: page.getByTestId("toolbar-stop"),
  syncBtn: page.getByTestId("toolbar-sync"),
  exportBtn: page.getByTestId("toolbar-export"),
  toggleViewBtn: page.getByTestId("toolbar-toggle-view"),
  toggleThemeBtn: page.getByTestId("toolbar-toggle-theme"),
  toggleLayoutBtn: page.getByTestId("toolbar-toggle-layout"),
  togglePropsBtn: page.getByTestId("toolbar-toggle-props")
});

export const tabStrip = (page: Page) => ({
  root: page.getByTestId("tab-strip"),
  items: page.getByTestId("tab-item"),
  closeButtons: page.getByTestId("tab-close")
});

export const workspace = (page: Page) => ({
  root: page.getByTestId("app-workspace"),
  splitSelect: page.getByTestId("split-select"),
  codeEditor: page.getByTestId("code-editor"),
  jsonError: page.getByTestId("json-error")
});

export const workflow = (page: Page) => ({
  canvas: page.getByTestId("workflow-canvas"),
  empty: page.getByTestId("workflow-empty"),
  blocks: page.getByTestId("workflow-block")
});

export const consolePanel = (page: Page) => ({
  panel: page.getByTestId("console-panel"),
  toggle: page.getByTestId("console-toggle"),
  clear: page.getByTestId("console-clear"),
  logs: page.getByTestId("console-log")
});

export const propsPanel = (page: Page) => ({
  panel: page.getByTestId("props-panel"),
  empty: page.getByTestId("props-empty"),
  advancedToggle: page.getByTestId("props-advanced-toggle"),
  field: (id: string) => page.getByTestId(`props-field-${id}`)
});

export const modulePanel = (page: Page) => ({
  search: page.getByTestId("module-search"),
  item: (moduleId: string) => page.locator(`[data-testid="module-item"][data-module-id="${moduleId}"]`).first()
});

export async function dragModuleToCanvas(page: Page, moduleId: string): Promise<void> {
  const sourceSelector = `[data-testid="module-item"][data-module-id="${moduleId}"]`;
  const targetSelector = `[data-testid="workflow-canvas"]`;
  await page.evaluate(({ sourceSelector, targetSelector, moduleId }) => {
    const source = document.querySelector(sourceSelector) as HTMLElement | null;
    const target = document.querySelector(targetSelector) as HTMLElement | null;
    if (!source || !target) {
      throw new Error("Drag source or target not found");
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.setData("application/reactflow-module", moduleId);

    source.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer }));
    target.dispatchEvent(new DragEvent("dragover", { bubbles: true, dataTransfer }));
    target.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer }));
    source.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer }));
  }, { sourceSelector, targetSelector, moduleId });
}
