# Astroncode 架构文档

本文档描述 Astroncode 的系统架构、模块关系和设计决策。

## 1. 系统概述

Astroncode 是一个本地编码助手系统，提供 AI 辅助的代码编辑、调试和开发功能。

### 1.1 核心特性

- **CLI 界面**: 基于 Ink (React for CLI) 的终端 UI
- **MCP 协议**: 支持 Model Context Protocol 工具集成
- **多模型支持**: 可配置的 AI 模型后端
- **插件系统**: 可扩展的命令和工具架构

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| 语言 | TypeScript |
| 运行时 | Node.js 18+ / Bun |
| UI 框架 | Ink (React) |
| 打包 | Bun Bundle |
| 测试 | Node.js Test Runner |

## 2. 目录结构

```
/Applications/Astroncode/
├── cli.js                    # 打包后的单文件入口 (~13MB)
├── package.json              # 项目配置
├── README.md                 # 项目说明
│
├── src/                      # 源代码
│   ├── main.tsx              # 主入口，CLI 解析和启动
│   ├── commands.ts           # 命令注册表
│   ├── tools.ts              # 工具注册表
│   ├── Tool.ts               # 工具基类和类型定义
│   ├── QueryEngine.ts        # 查询处理引擎
│   │
│   ├── commands/             # 命令实现 (~100个)
│   │   ├── add-dir/          # 添加目录
│   │   ├── config/           # 配置管理
│   │   ├── doctor/           # 诊断工具
│   │   ├── mcp/              # MCP 管理
│   │   ├── setup/            # 设置向导
│   │   └── ...               # 其他命令
│   │
│   ├── tools/                # 工具实现 (~45个)
│   │   ├── AgentTool/        # 子代理工具
│   │   ├── BashTool/         # Shell 执行
│   │   ├── FileEditTool/     # 文件编辑
│   │   ├── FileReadTool/     # 文件读取
│   │   ├── GlobTool/         # 文件搜索
│   │   ├── GrepTool/         # 内容搜索
│   │   ├── SkillTool/        # 技能执行
│   │   └── ...               # 其他工具
│   │
│   ├── components/           # React 组件 (~147个)
│   │   ├── design-system/    # 设计系统组件
│   │   ├── agents/           # 代理相关组件
│   │   └── ...               # 功能组件
│   │
│   ├── utils/                # 工具函数 (分类组织)
│   │   ├── index.ts          # 主索引入口
│   │   ├── core/             # 核心工具 (errors, config, env, log)
│   │   ├── fs/               # 文件系统 (file, path, glob, diff)
│   │   ├── network/          # 网络工具 (http, api, proxy, ws)
│   │   ├── process/          # 进程管理 (shell, exec, signal)
│   │   ├── ui/               # UI工具 (format, theme, terminal)
│   │   ├── validation/       # 验证工具 (json, yaml, type-guards)
│   │   ├── bash/             # Bash 相关
│   │   ├── settings/         # 设置管理
│   │   ├── permissions/      # 权限控制
│   │   └── ...               # 其他专用工具
│   │
│   ├── services/             # 服务层 (~38个)
│   │   ├── api/              # API 客户端
│   │   ├── mcp/              # MCP 服务
│   │   ├── analytics/        # 分析服务
│   │   └── ...               # 其他服务
│   │
│   ├── state/                # 状态管理
│   │   ├── AppStateStore.ts  # 全局状态
│   │   └── store.ts          # Store 实现
│   │
│   ├── context/              # React Context
│   ├── hooks/                # React Hooks
│   ├── types/                # 类型定义
│   ├── constants/            # 常量定义 (分类组织)
│   │   ├── design.ts         # 设计系统常量
│   │   ├── limits.ts         # 系统限制和阈值
│   │   ├── files.ts          # 文件类型常量
│   │   ├── product.ts        # 产品信息
│   │   ├── betas.ts          # Beta 功能头
│   │   └── ...               # 其他常量
│   └── entrypoints/          # 入口点
│
├── scripts/                  # 运行时脚本
│   ├── start.mjs             # 启动脚本
│   ├── runtime-branding.mjs  # 品牌定制
│   ├── astron-env.mjs        # 环境配置
│   └── ...                   # 其他脚本
│
└── tests/                    # 测试文件
    ├── design-system.test.mjs
    ├── integration-*.test.mjs
    └── ...                   # 其他测试
```

## 3. 核心模块

### 3.1 入口流程

```
scripts/start.mjs
    │
    ├── loadAstronEnvFile()     # 加载环境配置
    ├── applyAstronEnv()        # 应用环境变量
    ├── spawnDetachedStartupSync() # 启动同步
    ├── runLocalAstronCommand() # 处理本地命令
    ├── shouldAutoLaunchSetup() # 检查是否需要设置
    ├── ensureRuntimeBrandingBundle() # 确保品牌包
    └── spawn(cli.js)           # 启动主程序
            │
            └── src/main.tsx
                    │
                    ├── profileCheckpoint() # 性能分析
                    ├── startMdmRawRead()   # MDM 配置
                    ├── startKeychainPrefetch() # 密钥预取
                    ├── init()              # 初始化
                    └── launchRepl()        # 启动 REPL
```

### 3.2 命令系统

```typescript
// src/commands.ts - 命令注册
import addDir from './commands/add-dir/index.js'
import config from './commands/config/index.js'
import doctor from './commands/doctor/index.js'
// ... 更多命令

export function getCommands() {
  return [
    addDir,
    config,
    doctor,
    // ...
  ]
}
```

**命令结构**:
```
src/commands/<name>/
├── index.ts      # 命令入口
├── <name>.ts     # 核心逻辑
└── types.ts      # 类型定义 (可选)
```

### 3.3 工具系统

```typescript
// src/tools.ts - 工具注册
import { BashTool } from './tools/BashTool/BashTool.js'
import { FileEditTool } from './tools/FileEditTool/FileEditTool.js'
// ... 更多工具

export function getTools() {
  return [
    BashTool,
    FileEditTool,
    // ...
  ]
}
```

**工具结构**:
```
src/tools/<Name>Tool/
├── <Name>Tool.ts     # 工具实现
├── <Name>Tool.test.ts # 测试 (可选)
└── prompt.ts         # 提示模板 (可选)
```

### 3.4 状态管理

```typescript
// src/state/AppStateStore.ts
interface AppState {
  // 模型状态
  mainLoopModel: string
  
  // 权限状态
  toolPermissionContext: PermissionContext
  
  // UI 状态
  isCompactMode: boolean
  isFastModeEnabled: boolean
  
  // 会话状态
  sessionId: string
  messages: Message[]
}
```

**状态更新流程**:
```
用户操作 → Event Handler → store.setState() → React Re-render
```

## 4. 设计模式

### 4.1 条件编译

使用 `feature()` 函数实现编译时特性开关:

```typescript
import { feature } from 'bun:bundle'

// 条件导入
const voiceModule = feature('VOICE_MODE')
  ? require('./voice.js')
  : null

// 条件代码
if (feature('COORDINATOR_MODE')) {
  // 协调器模式特定代码
}
```

**特性标志**:
- `VOICE_MODE`: 语音模式
- `KAIROS`: 助手模式
- `BRIDGE_MODE`: 桥接模式
- `COORDINATOR_MODE`: 协调器模式
- `AGENT_TRIGGERS`: 代理触发器

### 4.2 懒加载

打破循环依赖的懒加载模式:

```typescript
// 延迟 require 打破循环依赖
const getTeammateUtils = () =>
  require('./utils/teammate.js') as typeof import('./utils/teammate.js')

// 使用时才加载
function someFunction() {
  const { helper } = getTeammateUtils()
  return helper()
}
```

### 4.3 Provider 模式

React Context 状态管理:

```typescript
// 创建 Context
export const AppStoreContext = React.createContext<AppStateStore | null>(null)

// Provider 组件
export function AppStateProvider({ children }: Props) {
  const [store] = useState(() => createStore())
  return (
    <AppStoreContext.Provider value={store}>
      {children}
    </AppStoreContext.Provider>
  )
}

// 使用 Hook
export function useAppState() {
  const store = useContext(AppStoreContext)
  if (!store) throw new Error('Missing AppStateProvider')
  return store
}
```

### 4.4 工厂模式

工具和命令的创建:

```typescript
// 工具定义
export const BashTool: Tool = {
  name: 'Bash',
  inputSchema: { /* ... */ },
  async execute({ command }, context) {
    // 执行逻辑
  }
}
```

## 5. 数据流

### 5.1 用户输入流程

```
用户输入
    │
    ▼
REPL.tsx (输入处理)
    │
    ▼
QueryEngine.ts (查询处理)
    │
    ├── 解析命令/问题
    │
    ▼
Tool Execution (工具执行)
    │
    ├── 权限检查
    ├── 执行工具
    └── 返回结果
    │
    ▼
Response Rendering (响应渲染)
```

### 5.2 MCP 数据流

```
MCP Server
    │
    ▼
src/services/mcp/client.ts
    │
    ├── 连接管理
    ├── 工具发现
    └── 资源访问
    │
    ▼
MCPTool (工具包装)
    │
    ▼
Tool Execution
```

## 6. 配置系统

### 6.1 配置层次

```
1. 环境变量 (.env.astroncode)
2. 全局配置 (~/.config/astroncode/)
3. 项目配置 (.astroncode/)
4. MDM 配置 (企业策略)
5. 远程配置 (云端同步)
```

### 6.2 配置加载

```typescript
// src/utils/config.ts
export function getGlobalConfig(): GlobalConfig {
  // 1. 加载默认配置
  // 2. 合并用户配置
  // 3. 应用环境变量覆盖
  // 4. 验证配置
  return config
}
```

## 7. 插件系统

### 7.1 插件结构

```
.astroncode/plugins/<plugin-name>/
├── plugin.json       # 插件清单
├── commands/         # 命令扩展
├── tools/            # 工具扩展
├── hooks/            # 钩子扩展
└── skills/           # 技能扩展
```

### 7.2 插件加载

```typescript
// src/utils/plugins/pluginLoader.ts
export async function loadPlugin(pluginPath: string): Promise<Plugin> {
  const manifest = await readPluginManifest(pluginPath)
  const commands = await loadCommands(manifest.commands)
  const tools = await loadTools(manifest.tools)
  return { manifest, commands, tools }
}
```

## 8. 测试策略

### 8.1 测试类型

| 类型 | 位置 | 工具 |
|------|------|------|
| 单元测试 | `tests/*.test.mjs` | Node.js Test Runner |
| 集成测试 | `tests/integration-*.test.mjs` | Node.js Test Runner |
| 组件测试 | `tests/*.test.mjs` | 手动验证 |

### 8.2 测试命令

```bash
# 运行所有测试
npm test

# 运行特定测试
node --test tests/design-system.test.mjs
```

## 9. 构建和部署

### 9.1 本地开发

```bash
# 启动开发
astroncode

# 运行设置
astroncode setup

# 诊断问题
astroncode doctor
```

### 9.2 构建流程

```
源代码 (src/)
    │
    ▼
Bun Bundle
    │
    ├── TypeScript 编译
    ├── 死代码消除
    ├── 代码压缩
    └── 单文件打包
    │
    ▼
cli.js (~13MB)
```

### 9.3 部署流程

```bash
# 检查同步状态
npm run sync:check

# 本地部署
npm run sync:local

# 云端同步
npm run sync:cloud
```

## 10. 性能优化

### 10.1 启动优化

- **并行预取**: MDM 配置、密钥预取并行执行
- **懒加载**: 非关键模块延迟加载
- **缓存**: 配置和状态缓存

### 10.2 运行时优化

- **React Compiler**: 使用 React 编译器优化
- **Memoization**: 使用 `useMemo` 和 `useCallback`
- **Virtual Scrolling**: 大列表虚拟滚动

## 11. 安全考虑

### 11.1 权限控制

```typescript
// src/utils/permissions/
├── PermissionMode.ts      # 权限模式
├── permissionSetup.ts     # 权限初始化
└── denialTracking.ts      # 拒绝跟踪
```

### 11.2 敏感信息

- 环境变量不记录日志
- API 密钥安全存储
- 文件路径脱敏上报

## 12. 已知限制

### 12.1 循环依赖

以下模块存在已知循环依赖，使用懒加载解决:

- `tools.ts` ↔ `TeamCreateTool`
- `main.tsx` ↔ `teammate.ts`

### 12.2 性能瓶颈

- `main.tsx` 导入过多，启动时间较长
- `utils/` 目录庞大，查找效率低

## 13. 未来改进

1. **模块化重构**: 拆分 `utils/` 目录
2. **类型安全**: 减少类型断言
3. **测试覆盖**: 提升测试覆盖率
4. **文档完善**: 补充 API 文档
