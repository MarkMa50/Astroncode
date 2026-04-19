# main.tsx 简化策略

本文档描述 `src/main.tsx` 的简化策略和实施计划。

## 当前状态

- **总行数**: 4685 行
- **主要函数**:
  - `main()` (585行) - 主入口
  - `run()` (884行) - CLI 解析和执行
  - 辅助函数: `logManagedSettings`, `prefetchSystemContextIfSafe` 等

## 结构分析

### 1. 顶部导入 (1-100行)

```typescript
// 性能优化: 并行预取
import { profileCheckpoint } from './utils/startupProfiler.js';
import { startMdmRawRead } from './utils/settings/mdm/rawRead.js';
import { startKeychainPrefetch } from './utils/secureStorage/keychainPrefetch.js';

// 条件导入 (死代码消除)
const coordinatorModeModule = feature('COORDINATOR_MODE') 
  ? require('./coordinator/coordinatorMode.js') 
  : null;
```

**问题**: 导入过多 (~100行)，启动时间长

**策略**: 
- 保持性能关键导入 (profileCheckpoint, startMdmRawRead)
- 非关键导入移至懒加载

### 2. CLI 命令定义 (884-3500行)

```typescript
program
  .name('astroncode')
  .option('-d, --debug', 'Enable debug mode')
  .option('-p, --print', 'Print response and exit')
  // ... ~100 个选项
```

**问题**: CLI 选项定义与业务逻辑混合

**策略**:
- 提取 CLI 选项定义到 `src/entrypoints/cliOptions.ts`
- 提取子命令定义到 `src/entrypoints/cliCommands.ts`

### 3. 命令处理逻辑 (3500-4500行)

**问题**: 处理逻辑内联，难以维护

**策略**:
- 每个主要命令已有独立目录 (`src/commands/*/`)
- 确保所有命令处理逻辑都在对应目录中

## 简化计划

### Phase 1: 提取 CLI 选项定义

创建 `src/entrypoints/cliOptions.ts`:

```typescript
import { Option } from '@commander-js/extra-typings';
import type { CommanderCommand } from '@commander-js/extra-typings';

export function addGlobalOptions(program: CommanderCommand): CommanderCommand {
  return program
    .option('-d, --debug [filter]', 'Enable debug mode')
    .option('-p, --print', 'Print response and exit')
    // ... 其他选项
}
```

### Phase 2: 提取子命令注册

创建 `src/entrypoints/cliCommands.ts`:

```typescript
import type { CommanderCommand } from '@commander-js/extra-typings';

export function registerSubcommands(program: CommanderCommand): void {
  // 注册 mcp 子命令
  // 注册 plugin 子命令
  // 注册 auth 子命令
  // ...
}
```

### Phase 3: 提取初始化逻辑

创建 `src/entrypoints/startup.ts`:

```typescript
export async function initializeApp(): Promise<void> {
  // MDM 设置加载
  // 密钥预取
  // 遥测初始化
  // 迁移运行
}
```

### Phase 4: 简化 main.tsx

重构后的 main.tsx:

```typescript
// 性能关键导入
import { profileCheckpoint } from './utils/startupProfiler.js';
import { startMdmRawRead } from './utils/settings/mdm/rawRead.js';
import { startKeychainPrefetch } from './utils/secureStorage/keychainPrefetch.js';

// 入口点导入
import { addGlobalOptions } from './entrypoints/cliOptions.js';
import { registerSubcommands } from './entrypoints/cliCommands.js';
import { initializeApp } from './entrypoints/startup.js';

// 启动预取
profileCheckpoint('main_tsx_entry');
startMdmRawRead();
startKeychainPrefetch();

// 主函数
export async function main() {
  await initializeApp();
  const program = createProgram();
  await program.parseAsync(process.argv);
}

function createProgram() {
  const program = new CommanderCommand();
  addGlobalOptions(program);
  registerSubcommands(program);
  return program;
}
```

## 风险评估

| 操作 | 风险 | 缓解措施 |
|------|------|----------|
| 提取 CLI 选项 | 低 | 选项定义独立，无副作用 |
| 提取子命令 | 中 | 需验证所有命令路径 |
| 提取初始化逻辑 | 高 | 初始化顺序敏感 |
| 修改导入顺序 | 高 | 影响启动性能 |

## 实施建议

1. **渐进式重构**: 一次提取一个模块
2. **保持向后兼容**: 不改变公共 API
3. **性能测试**: 每次重构后测量启动时间
4. **回归测试**: 运行完整测试套件

## 当前优先级

由于 main.tsx 是系统核心入口，建议:
- **短期**: 添加更多文档和注释
- **中期**: 提取 CLI 选项定义
- **长期**: 完整重构初始化流程
