import path from "node:path";
import { _electron as electron } from "@playwright/test";
import type { ElectronApplication, Page } from "@playwright/test";

export interface ElectronAppContext {
  app: ElectronApplication;
  window: Page;
}

export async function launchElectronApp(): Promise<ElectronAppContext> {
  const mainPath = path.join(process.cwd(), "dist", "main.js");
  const env = { ...process.env, VITE_DEV_SERVER_URL: "" } as NodeJS.ProcessEnv;
  delete env.ELECTRON_RUN_AS_NODE;
  if (process.platform === "linux" && process.env.CI) {
    env.ELECTRON_DISABLE_SANDBOX = "1";
    env.LIBGL_ALWAYS_SOFTWARE = "1";
  }
  const app = await electron.launch({
    args: [mainPath],
    env
  });

  const window = await app.firstWindow();
  await window.waitForLoadState("domcontentloaded");
  return { app, window };
}
