import { describe, it, expect } from "vitest";
import { formatHighWarningBlock } from "../e2e/utils/mode";

describe("E2E warning block", () => {
  it("includes onboarding guidance and diagnostics commands", () => {
    const text = formatHighWarningBlock({
      runtime: {
        mode: "auto",
        devicePolicy: "warn_skip",
        requireDeviceFor: "none",
        hasDevice: false,
        deviceError: "adb not found",
        shouldRunRealFlow: false,
        shouldRunMockFlow: true,
        shouldFailWithoutDevice: false
      },
      skippedTests: ["full device flow"]
    });

    expect(text).toContain("HIGH WARNING");
    expect(text).toContain("skipped_tests=full device flow");
    expect(text).toContain("adb kill-server");
    expect(text).toContain("adb start-server");
    expect(text).toContain("adb devices");
    expect(text).toContain("port 9999");
  });
});
