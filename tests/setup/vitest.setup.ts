import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

if (!globalThis.crypto) {
  // Minimal crypto for tests that rely on randomUUID
  (globalThis as typeof globalThis & { crypto: Crypto }).crypto = {
    randomUUID: () => "test-uuid"
  } as Crypto;
} else if (!("randomUUID" in globalThis.crypto)) {
  // @ts-expect-error - add randomUUID when missing
  globalThis.crypto.randomUUID = () => "test-uuid";
}

// Keep a stable UUID for deterministic tests
vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("test-uuid");
