import { describe, it, expect, vi, afterEach } from "vitest";

describe("moduleUtils", () => {
  afterEach(() => {
    vi.doUnmock("../../src/renderer/data/generated/module-contract-bundle.json");
    // @ts-expect-error - cleanup test injection
    window.vflowDesktop = undefined;
  });

  it("guessCategory maps by prefix", async () => {
    const { guessCategory } = await import("../../src/renderer/shared/moduleUtils");
    expect(guessCategory("vflow.trigger.foo")).toBe("触发器");
    expect(guessCategory("vflow.device.click")).toBe("界面交互");
    expect(guessCategory("vflow.logic.if")).toBe("逻辑控制");
    expect(guessCategory("vflow.data.set")).toBe("数据");
    expect(guessCategory("vflow.file.read")).toBe("文件");
    expect(guessCategory("vflow.network.http")).toBe("网络");
    expect(guessCategory("vflow.system.wifi")).toBe("应用与系统");
    expect(guessCategory("vflow.core.beta")).toBe("Core (Beta)");
    expect(guessCategory("custom.unknown")).toBe("其他");
  });

  it("getColorByCategory returns expected colors", async () => {
    const { getColorByCategory } = await import("../../src/renderer/shared/moduleUtils");
    expect(getColorByCategory("逻辑控制")).toBe("#7b1fa2");
    expect(getColorByCategory("未知")).toBe("#607d8b");
  });

  it("loadModuleOptions uses modules_zh first and normalizes fields", async () => {
    vi.resetModules();
    vi.doMock("../../src/renderer/data/generated/module-contract-bundle.json", () => ({
      default: { defaultLocale: "zh-CN", availableLocales: ["zh-CN"], contracts: [] }
    }));
    vi.doMock("../../src/renderer/data/modules_zh.json", () => ({
      default: [{ id: "vflow.device.delay", name: "延迟" }]
    }));
    vi.doMock("../../src/renderer/data/modules.json", () => ({
      default: [{ id: "vflow.network.http_request", name: "HTTP 请求" }]
    }));

    const { loadModuleOptions } = await import("../../src/renderer/shared/moduleUtils");
    const list = await loadModuleOptions();
    expect(list[0].id).toBe("vflow.device.delay");
    expect(list[0].category).toBe("界面交互");
    expect(list[0].color).toBe("#1976d2");
  });

  it("loadModuleOptions falls back to IPC when built-ins are empty", async () => {
    vi.resetModules();
    vi.doMock("../../src/renderer/data/generated/module-contract-bundle.json", () => ({
      default: { defaultLocale: "zh-CN", availableLocales: ["zh-CN"], contracts: [] }
    }));
    vi.doMock("../../src/renderer/data/modules_zh.json", () => ({ default: [] }));
    vi.doMock("../../src/renderer/data/modules.json", () => ({ default: [] }));
    // @ts-expect-error - test-only injection
    window.vflowDesktop = {
      getModules: async () => [{ id: "vflow.logic.if", name: "条件判断" }]
    };

    const { loadModuleOptions } = await import("../../src/renderer/shared/moduleUtils");
    const list = await loadModuleOptions();
    expect(list[0].id).toBe("vflow.logic.if");
    expect(list[0].category).toBe("逻辑控制");
  });

  it("usage count persistence works", async () => {
    const { saveUsageCounts, loadUsageCounts, applyUsageCounts } = await import("../../src/renderer/shared/moduleUtils");
    const modules = [{ id: "a", name: "A", category: "数据", color: "#388e3c", usageCount: 2 }];
    saveUsageCounts(modules);
    const counts = loadUsageCounts();
    const applied = applyUsageCounts(modules, counts);
    expect(applied[0].usageCount).toBe(2);
  });
});
