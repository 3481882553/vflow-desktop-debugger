# 创建工作流修复实施说明

## 本次落地内容

1. 新增主项目契约导出脚本：`scripts/export_vflow_module_contracts.mjs`
2. 新增子项目契约生成脚本：`desktop-debugger/scripts/export-module-contracts.mjs`
3. 新增一致性校验脚本：`desktop-debugger/scripts/check-module-consistency.mjs`
4. 新增契约产物：`desktop-debugger/src/renderer/data/generated/module-contract-bundle.json`
5. 新增模块 ID 兼容层：`desktop-debugger/src/renderer/shared/moduleIdCompat.ts`
6. 新增 workflow 校验/规范化：`desktop-debugger/src/renderer/shared/workflowCompat.ts`
7. 修复创建流程 Blocker：
   - `LOAD_ERROR` 创建错误 tab
   - `EDIT_JSON` 结构校验，非法 JSON 不污染 workflow 状态
   - 图形视图防御性访问
8. 修复调试链路：
   - socket 粘包/半包缓冲
   - schema 请求 requestId/超时隔离
   - preload 事件订阅改为可取消
9. 模块面板改为契约驱动，并对无本地 schema 的模块显式禁用

## 兼容策略

- 标准化函数：`normalizeModuleId(id)`
- 历史别名映射来源：`module-contract-bundle.json > legacyAliasToCanonical`
- 旧 workflow 导入、代码视图编辑、运行前 payload 序列化均执行规范化

## 回归命令

在仓库根目录执行：

```bash
node scripts/export_vflow_module_contracts.mjs
```

在 `desktop-debugger` 目录执行：

```bash
npm run contracts:export
npm run contracts:check
npm run typecheck
npm run build-main
```

说明：`build-renderer` 在当前环境可能因 `esbuild spawn EPERM` 失败，需在可执行子进程权限正常的环境复验。

