import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSchemas } from "../../src/renderer/hooks/useSchemas";

describe("useSchemas", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads and migrates cached schemas from localStorage", async () => {
    const cached = {
      "vflow.logic.jump": [
        {
          label: "条件",
          type: "string",
          enumValues: ["a", "b"],
          placeholder: "输入",
          advanced: true
        }
      ]
    };
    window.localStorage.setItem("vflowDesktop.dynamicSchemas", JSON.stringify(cached));

    const { result } = renderHook(() => useSchemas());
    await waitFor(() => {
      const schema = result.current.schemas["vflow.logic.jump"][0];
      expect(schema.name).toBe("条件");
      expect(schema.staticType).toBe("string");
      expect(schema.options).toEqual(["a", "b"]);
      expect(schema.hint).toBe("输入");
      expect(schema.isFolded).toBe(true);
    });
  });

  it("syncSchemas returns error when bridge is missing", async () => {
    // @ts-expect-error - remove bridge for test
    window.vflowDesktop = undefined;
    const { result } = renderHook(() => useSchemas());
    let res!: { success: boolean; error?: string };
    await act(async () => {
      res = await result.current.syncSchemas();
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("不支持同步");
  });

  it("syncSchemas stores schemas and updates localStorage", async () => {
    // @ts-expect-error - test-only injection
    window.vflowDesktop = {
      syncSchemas: vi.fn().mockResolvedValue({
        success: true,
        schemas: {
          "vflow.data.input": [{ label: "值", type: "string" }]
        }
      })
    };

    const { result } = renderHook(() => useSchemas());
    let res!: { success: boolean; error?: string };
    await act(async () => {
      res = await result.current.syncSchemas();
    });
    expect(res.success).toBe(true);
    expect(result.current.schemas["vflow.data.input"]).toBeDefined();

    const stored = window.localStorage.getItem("vflowDesktop.dynamicSchemas");
    expect(stored).toContain("vflow.data.input");
  });
});
