import { InputVisibility } from "../domain/vflowTypes";

export function isInputVisible(visibility: InputVisibility | undefined | null, params: Record<string, any>): boolean {
  if (!visibility) return true;

  switch (visibility.type) {
    case "always": return true;
    case "eq": return params[visibility.dependsOn] === visibility.value;
    case "neq": return params[visibility.dependsOn] !== visibility.value;
    case "in": return visibility.values.includes(params[visibility.dependsOn]);
    case "nin": return !visibility.values.includes(params[visibility.dependsOn]);
    case "true": return params[visibility.dependsOn] === true;
    case "false": return params[visibility.dependsOn] === false;
    case "and": return visibility.conditions.every(c => isInputVisible(c, params));
    case "or": return visibility.conditions.some(c => isInputVisible(c, params));
    case "not": return !isInputVisible(visibility.condition, params);
    default: return true;
  }
}
