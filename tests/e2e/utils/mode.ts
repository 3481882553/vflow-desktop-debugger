import { checkDevice } from "./adb";

export type E2EMode = "auto" | "real" | "mock";
export type E2EDevicePolicy = "warn_skip" | "strict_fail";
export type E2ERequireDeviceFor = "none" | "release";

export interface E2ERuntime {
  mode: E2EMode;
  devicePolicy: E2EDevicePolicy;
  requireDeviceFor: E2ERequireDeviceFor;
  hasDevice: boolean;
  deviceError?: string;
  shouldRunRealFlow: boolean;
  shouldRunMockFlow: boolean;
  shouldFailWithoutDevice: boolean;
}

export function resolveMode(): E2EMode {
  const raw = (process.env.E2E_MODE || "auto").toLowerCase();
  if (raw === "real" || raw === "mock" || raw === "auto") {
    return raw;
  }
  return "auto";
}

export function resolveDevicePolicy(): E2EDevicePolicy {
  const raw = (process.env.E2E_DEVICE_POLICY || "warn_skip").toLowerCase();
  return raw === "strict_fail" ? "strict_fail" : "warn_skip";
}

export function resolveRequireDeviceFor(): E2ERequireDeviceFor {
  const raw = (process.env.E2E_REQUIRE_DEVICE_FOR || "none").toLowerCase();
  return raw === "release" ? "release" : "none";
}

export async function resolveRuntime(): Promise<E2ERuntime> {
  const mode = resolveMode();
  const devicePolicy = resolveDevicePolicy();
  const requireDeviceFor = resolveRequireDeviceFor();
  const device = await checkDevice();

  const shouldFailWithoutDevice =
    !device.ok &&
    (
      (mode === "real" && devicePolicy === "strict_fail") ||
      (requireDeviceFor === "release" && mode !== "mock")
    );

  const shouldRunRealFlow = mode !== "mock" && device.ok;
  const shouldRunMockFlow =
    mode === "mock" ||
    (!device.ok && (mode === "auto" || (mode === "real" && devicePolicy === "warn_skip")));

  return {
    mode,
    devicePolicy,
    requireDeviceFor,
    hasDevice: device.ok,
    deviceError: device.error,
    shouldRunRealFlow,
    shouldRunMockFlow,
    shouldFailWithoutDevice
  };
}

export function formatHighWarningBlock(args: {
  runtime: E2ERuntime;
  skippedTests: string[];
}): string {
  const { runtime, skippedTests } = args;
  const skippedText = skippedTests.length > 0 ? skippedTests.join(", ") : "none";
  return [
    "HIGH WARNING: REAL DEVICE NOT AVAILABLE, DEVICE-DEPENDENT E2E STEPS WILL BE SKIPPED.",
    `mode=${runtime.mode} policy=${runtime.devicePolicy} require_device_for=${runtime.requireDeviceFor}`,
    `device_status=${runtime.hasDevice ? "online" : "offline"} error=${runtime.deviceError || "none"}`,
    `skipped_tests=${skippedText}`,
    "next_steps=1) connect device by USB or network adb 2) authorize device 3) verify adb devices",
    "diagnostics=adb kill-server && adb start-server && adb devices",
    "debugserver_check=ensure device-side DebugServer is running on port 9999"
  ].join("\n");
}
