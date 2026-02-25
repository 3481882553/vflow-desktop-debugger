import { test, expect } from "@playwright/test";
import { launchElectronApp } from "./fixtures/electron";
import { toolbar, tabStrip, workspace, workflow, consolePanel, propsPanel, modulePanel, dragModuleToCanvas } from "./utils/ui";
import { resolveRuntime, formatHighWarningBlock } from "./utils/mode";

test.describe("vFlow Desktop Debugger E2E", () => {
  test("full device flow", async () => {
    const runtime = await resolveRuntime();

    if (runtime.shouldFailWithoutDevice) {
      expect(
        runtime.hasDevice,
        formatHighWarningBlock({
          runtime,
          skippedTests: ["full device flow"]
        })
      ).toBe(true);
    }

    if (!runtime.shouldRunRealFlow) {
      if (!runtime.hasDevice && runtime.mode !== "mock") {
        console.warn(formatHighWarningBlock({ runtime, skippedTests: ["full device flow"] }));
      }
      test.skip(true, "Real device flow skipped by runtime strategy");
    }

    const { app, window } = await launchElectronApp();

    try {
      const tb = toolbar(window);
      const tabs = tabStrip(window);
      const ws = workspace(window);
      const wf = workflow(window);
      const consoleUi = consolePanel(window);
      const props = propsPanel(window);
      const modules = modulePanel(window);

      await expect(tabs.root).toBeVisible();
      await expect(tabs.items).toHaveCount(1);

      await tb.newBtn.click();
      await expect(tabs.items).toHaveCount(2);

      const secondTab = tabs.items.nth(1);
      await secondTab.click();
      await expect(secondTab).toHaveClass(/active/);

      await tb.toggleLayoutBtn.click();
      await expect(window.getByText("次要视图 (只读参考)")).toBeVisible();
      await ws.splitSelect.selectOption({ index: 1 });

      await modules.search.fill("screen_operation");
      await expect(modules.item("vflow.interaction.screen_operation")).toBeVisible();

      await dragModuleToCanvas(window, "vflow.interaction.screen_operation");
      await expect(wf.blocks).toHaveCount(1);

      await wf.blocks.first().click();
      await expect(props.panel).toBeVisible();

      const operationField = props.field("operation_type");
      const operationSelect = operationField.locator("select");
      if (await operationSelect.count()) {
        await operationSelect.selectOption({ label: "滑动" });
      } else {
        await operationField.getByText("滑动", { exact: true }).click();
      }
      await expect(props.field("target_end")).toBeVisible();

      await tb.toggleViewBtn.click();
      await expect(ws.codeEditor).toBeVisible();

      await tb.runBtn.click();
      await expect(tb.stopBtn).toBeVisible({ timeout: 15000 });
      await expect(consoleUi.panel).toBeVisible();
      await expect(window.getByText("✅ 推送成功")).toBeVisible({ timeout: 15000 });

      await tb.stopBtn.click();
    } finally {
      await app.close();
    }
  });

  test("cloud fallback flow without real device", async () => {
    const runtime = await resolveRuntime();

    if (!runtime.shouldRunMockFlow) {
      test.skip(true, "Mock fallback flow skipped by runtime strategy");
    }

    if (!runtime.hasDevice) {
      console.warn(formatHighWarningBlock({ runtime, skippedTests: ["full device flow"] }));
    }

    const { app, window } = await launchElectronApp();

    try {
      const tb = toolbar(window);
      const tabs = tabStrip(window);
      const ws = workspace(window);
      const wf = workflow(window);
      const consoleUi = consolePanel(window);
      const props = propsPanel(window);
      const modules = modulePanel(window);

      await expect(tabs.root).toBeVisible();
      await expect(tabs.items).toHaveCount(1);

      await tb.newBtn.click();
      await expect(tabs.items).toHaveCount(2);

      const secondTab = tabs.items.nth(1);
      await secondTab.click();
      await expect(secondTab).toHaveClass(/active/);

      await tb.toggleLayoutBtn.click();
      await expect(window.getByText("次要视图 (只读参考)")).toBeVisible();
      await ws.splitSelect.selectOption({ index: 1 });

      await modules.search.fill("screen_operation");
      await expect(modules.item("vflow.interaction.screen_operation")).toBeVisible();

      await dragModuleToCanvas(window, "vflow.interaction.screen_operation");
      await expect(wf.blocks).toHaveCount(1);

      await wf.blocks.first().click();
      await expect(props.panel).toBeVisible();

      const operationField = props.field("operation_type");
      const operationSelect = operationField.locator("select");
      if (await operationSelect.count()) {
        await operationSelect.selectOption({ label: "滑动" });
      } else {
        await operationField.getByText("滑动", { exact: true }).click();
      }
      await expect(props.field("target_end")).toBeVisible();

      await tb.toggleViewBtn.click();
      await expect(ws.codeEditor).toBeVisible();

      await tb.runBtn.click();
      await expect(consoleUi.panel).toBeVisible();
      if (runtime.hasDevice) {
        await expect(window.getByText(/✅ 推送成功|推送失败|通信异常/)).toBeVisible({ timeout: 15000 });
      } else {
        await expect(window.getByText(/推送失败|通信异常/)).toBeVisible({ timeout: 15000 });
      }
    } finally {
      await app.close();
    }
  });
});
