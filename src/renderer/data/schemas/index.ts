import { ModuleSchema } from '../../domain/vflowTypes';
import { triggerSchemas } from './triggers';
import { logicSchemas } from './logics';
import { dataSchemas } from './data';
import { interactionSchemas, aiSchemas, uiSchemas } from './interactions';
import { sysSchemas } from './sys';
import { fileSchemas } from './files';
import { coreBetaSchemas } from './core_beta';
import { shizukuSchemas } from './shizuku';

export const MODULE_SCHEMAS: Record<string, ModuleSchema> = {
  ...triggerSchemas,
  ...logicSchemas,
  ...dataSchemas,
  ...interactionSchemas,
  ...aiSchemas,
  ...uiSchemas,
  ...sysSchemas,
  ...fileSchemas,
  ...coreBetaSchemas,
  ...shizukuSchemas
};
