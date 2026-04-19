# Astroncode TODO 管理

本文档收集并整理代码中的 TODO/FIXME 注释，便于追踪和管理技术债务。

## 1. 高优先级 (P0)

### 1.1 安全相关

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/services/mcp/auth.ts` | 1743 | TODO(xaa-ga): add cross-process lockfile before GA |
| `src/services/mcp/xaa.ts` | 133 | validation (mix-up protection — TODO: upstream to SDK) |
| `src/services/mcp/xaa.ts` | 176 | §3.3 issuer-mismatch validation (mix-up protection — TODO: upstream to SDK) |

### 1.2 性能相关

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/services/api/client.ts` | 232 | TODO: Cache either GoogleAuth instance or AuthClient to improve performance |
| `src/services/mcp/client.ts` | 589 | TODO (ollie): The memoization here increases complexity |

## 2. 中优先级 (P1)

### 2.1 架构改进

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/main.tsx` | 2356 | TODO: Consolidate other prefetches into a single bootstrap request |
| `src/state/AppState.tsx` | 23 | TODO: Remove these re-exports once all callers import directly |
| `src/cli/print.ts` | 1144 | TODO: Clean up this code to avoid passing around a mutable array |
| `src/utils/hooks.ts` | 1203 | TODO: Add tests for EPIPE handling |

### 2.2 类型安全

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/Tool.ts` | 398 | TODO: Make it required (TungstenTool) |
| `src/state/AppStateStore.ts` | 172 | TODO (ashwin): see if we can use utility-types DeepReadonly |

**已修复**:
- `src/QueryEngine.ts:545` - 移除了不必要的类型转换（创建了 `src/types/utils.ts` 定义 `DeepImmutable`）
- `src/hooks/useReplBridge.tsx:309` - 移除了不必要的类型转换
- `src/utils/promptCategory.ts:21` - 更新注释说明转换是必要的（创建了 `src/constants/querySource.ts`）

### 2.3 迁移任务

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/keybindings/useShortcutDisplay.ts` | 9 | TODO(keybindings-migration): Remove fallback parameter |
| `src/keybindings/shortcutFormat.ts` | 9 | TODO(keybindings-migration): Remove fallback parameter |
| `src/hooks/useSearchInput.ts` | 355 | TODO(onKeyDown-migration): remove once all consumers pass handleKeyDown |
| `src/hooks/useTypeahead.tsx` | 1367 | TODO(onKeyDown-migration): remove once PromptInput passes handleKeyDown |
| `src/hooks/useHistorySearch.ts` | 273 | TODO(onKeyDown-migration): remove once PromptInput passes handleKeyDown |
| `src/hooks/useVoiceIntegration.tsx` | 652 | TODO(onKeyDown-migration): remove once REPL passes handleKeyDown |
| `src/hooks/useBackgroundTaskNavigation.ts` | 245 | TODO(onKeyDown-migration): remove once REPL passes handleKeyDown |

## 3. 低优先级 (P2)

### 3.1 代码清理

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/utils/config.ts` | 176 | TODO: 'emacs' is kept for backward compatibility - remove after a few releases |
| `src/utils/messages/systemInit.ts` | 19 | TODO(next-minor): remove this translation once SDK consumers have migrated |
| `src/services/analytics/growthbook.ts` | 332 | TODO: Remove this once the API is fixed to return correct format |

### 3.2 功能增强

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/entrypoints/mcp.ts` | 62 | TODO: Also re-expose any MCP tools |
| `src/entrypoints/mcp.ts` | 103 | TODO: Also re-expose any MCP tools |
| `src/entrypoints/mcp.ts` | 136 | TODO: validate input types with zod |
| `src/services/lsp/LSPServerManager.ts` | 374 | TODO: Integrate with compact - call closeFile() when compact removes files |
| `src/ink/screen.ts` | 688 | TODO: When soft-wrapping is implemented, SpacerHead cells will be explicit |

### 3.3 文档和测试

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/utils/hooks.ts` | 3162 | TODO: Implement prompt stop hooks outside REPL |
| `src/utils/hooks.ts` | 3172 | TODO: Implement agent stop hooks outside REPL |
| `src/utils/processUserInput/processUserInput.ts` | 200 | TODO: Make this an attachment message |

## 4. 未来工作 (P3)

### 4.1 插件系统

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/utils/plugins/schemas.ts` | 461 | TODO (future work): allow globs? |
| `src/utils/plugins/schemas.ts` | 492 | TODO (future work): allow globs? |
| `src/utils/plugins/schemas.ts` | 1187 | TODO (future work) gist |
| `src/utils/plugins/schemas.ts` | 1188 | TODO (future work) single file? |

### 4.2 其他改进

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/utils/thinking.ts` | 88 | TODO(inigo): add support for probing unknown models via API error detection |
| `src/tools/FileEditTool/utils.ts` | 360 | TODO: Unify this with the other snippet logic |
| `src/tools/FileReadTool/UI.tsx` | 78 | TODO: Render recursively |
| `src/utils/auth.ts` | 1054 | TODO: migrate to SecureStorage |
| `src/utils/auth.ts` | 1106 | TODO: migrate to SecureStorage |

## 5. 已知问题

### 5.1 需要调查

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/services/api/errorUtils.ts` | 126 | TODO: figure out why |
| `src/services/mcp/utils.ts` | 357 | TODO: This fails an e2e test if the ?. is not present |
| `src/utils/processUserInput/processBashCommand.tsx` | 48 | TODO: Clean up this hack |

### 5.2 临时解决方案

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/services/api/withRetry.ts` | 94 | TODO(ANT-344): the keep-alive via SystemAPIErrorMessage yields is a stopgap |
| `src/services/api/withRetry.ts` | 597 | TODO: Replace with a response header check once the API adds a dedicated |

## 6. 公共发布前

| 文件 | 行号 | 内容 |
|------|------|------|
| `src/skills/bundled/scheduleRemoteAgents.ts` | 31 | TODO(public-ship): Before shipping publicly, the /v1/mcp_servers endpoint |
| `src/commands/ultraplan.tsx` | 20 | TODO(prod-hardening): OAuth token may go stale over the 30min poll |
| `src/commands/ultraplan.tsx` | 364 | TODO(#23985): replace registerRemoteAgentTask + startDetachedPoll with |

## 7. 统计

| 优先级 | 数量 |
|--------|------|
| P0 - 高 | 5 |
| P1 - 中 | 15 |
| P2 - 低 | 18 |
| P3 - 未来 | 10 |
| 已知问题 | 5 |
| 公共发布前 | 3 |
| **总计** | **56** |

## 8. 管理规则

### 8.1 添加新 TODO

```typescript
// 格式: TODO(<context>): <description>
// 示例:
// TODO(security): Add rate limiting to API endpoint
// TODO(perf): Cache computed results
```

### 8.2 解决 TODO

1. 在代码中删除 TODO 注释
2. 在本文档中标记为已完成
3. 提交时在 commit message 中引用

### 8.3 定期审查

- 每月审查一次 P0/P1 项目
- 每季度审查一次 P2/P3 项目
- 删除过时或不再相关的 TODO

## 9. 已完成项目

| 日期 | 文件 | 原内容 | 解决方案 |
|------|------|--------|----------|
| 2026-04-18 | src/utils/sliceAnsi.ts | 默认导出 | 改为命名导出 `export function sliceAnsi` |
| 2026-04-18 | src/components/CustomSelect/*.ts | JSX 文件使用 .ts 扩展名 | 重命名为 .tsx |
| 2026-04-18 | src/commands/plugin/usePagination.ts | JSX 文件使用 .ts 扩展名 | 重命名为 .tsx |
| 2026-04-18 | docs/ | 缺少架构和规范文档 | 创建 ARCHITECTURE.md, CONVENTIONS.md, TODO.md |
| 2026-04-18 | src/utils/ | 工具函数缺乏组织 | 创建分类索引 (core, fs, network, process, ui, validation) |
| 2026-04-18 | src/constants/ | 缺少系统限制常量 | 创建 limits.ts 统一管理阈值 |
| 2026-04-18 | src/constants/design.ts | 设计常量分散 | 创建统一入口文件 |
| 2026-04-18 | docs/DESIGN_SYSTEM.md | 缺少设计系统文档 | 创建完整设计系统规范 |
| 2026-04-18 | src/components/design-system/ | 组件规范不统一 | 分析并文档化组件模式 |

