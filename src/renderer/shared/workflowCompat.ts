import type { VflowActionStep, VflowWorkflow } from "../domain/vflowTypes";
import { normalizeModuleId } from "./moduleIdCompat";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeStep(step: VflowActionStep): VflowActionStep {
  return {
    ...step,
    moduleId: normalizeModuleId(step.moduleId),
    parameters: isObject(step.parameters) ? step.parameters : {},
    indentationLevel:
      typeof step.indentationLevel === "number" && Number.isFinite(step.indentationLevel)
        ? step.indentationLevel
        : 0
  };
}

export function normalizeWorkflow(workflow: VflowWorkflow): VflowWorkflow {
  return {
    ...workflow,
    steps: Array.isArray(workflow.steps) ? workflow.steps.map((s) => normalizeStep(s)) : []
  };
}

export function validateWorkflowShape(value: unknown): { ok: true; workflow: VflowWorkflow } | { ok: false; error: string } {
  if (!isObject(value)) return { ok: false, error: "JSON 根节点必须是对象" };
  if (typeof value.id !== "string" || value.id.trim() === "") {
    return { ok: false, error: "workflow.id 必须是非空字符串" };
  }
  if (typeof value.name !== "string") {
    return { ok: false, error: "workflow.name 必须是字符串" };
  }
  if (!Array.isArray(value.steps)) {
    return { ok: false, error: "workflow.steps 必须是数组" };
  }

  for (let i = 0; i < value.steps.length; i++) {
    const step = value.steps[i];
    if (!isObject(step)) return { ok: false, error: `steps[${i}] 必须是对象` };
    if (typeof step.id !== "string" || step.id.trim() === "") {
      return { ok: false, error: `steps[${i}].id 必须是非空字符串` };
    }
    if (typeof step.moduleId !== "string" || step.moduleId.trim() === "") {
      return { ok: false, error: `steps[${i}].moduleId 必须是非空字符串` };
    }
    if ("parameters" in step && step.parameters !== null && !isObject(step.parameters)) {
      return { ok: false, error: `steps[${i}].parameters 必须是对象或为空` };
    }
  }

  const raw = value as Record<string, unknown>;
  const wf: VflowWorkflow = {
    id: raw.id as string,
    name: raw.name as string,
    steps: raw.steps as VflowActionStep[],
    isEnabled: typeof raw.isEnabled === "boolean" ? raw.isEnabled : true,
    triggerConfig: (raw.triggerConfig as VflowWorkflow["triggerConfig"]) ?? null,
    isFavorite: typeof raw.isFavorite === "boolean" ? raw.isFavorite : false,
    wasEnabledBeforePermissionsLost:
      typeof raw.wasEnabledBeforePermissionsLost === "boolean" ? raw.wasEnabledBeforePermissionsLost : false,
    folderId: (raw.folderId as string | null | undefined) ?? null,
    order: typeof raw.order === "number" ? raw.order : 0,
    shortcutName: (raw.shortcutName as string | null | undefined) ?? null,
    shortcutIconRes: (raw.shortcutIconRes as string | null | undefined) ?? null
  };

  return { ok: true, workflow: normalizeWorkflow(wf) };
}
