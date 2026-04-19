# 循环依赖分析与解决策略

本文档分析 Astroncode 代码库中的循环依赖问题，并提供解决方案。

## 当前状态

### 统计

- **动态 require() 调用**: 100+ 处
- **明确标注循环依赖**: 2 处
- **主要涉及文件**: main.tsx, AppState.tsx, teammate.ts, tools.ts

## 主要循环依赖链

### 1. main.tsx 循环

```
main.tsx → teammate.ts → AppState.tsx → ... → main.tsx
```

**解决方案**: 懒加载 teammate 模块

```typescript
// main.tsx
const getTeammateUtils = () => 
  require('./utils/teammate.js') as typeof import('./utils/teammate.js');
```

### 2. tools.ts 循环

```
tools.ts → TeamCreateTool → tools.ts
```

**解决方案**: 懒加载 TeamCreateTool

```typescript
// tools.ts
const getTeamCreateTool = () => 
  require('./tools/TeamCreateTool/TeamCreateTool.js');
```

### 3. AppState 循环

```
AppState.tsx → 多个工具/服务 → AppState.tsx
```

**解决方案**: 使用 React Context 和依赖注入

## 懒加载模式

### 模式 1: 函数包装器

```typescript
// 推荐: 类型安全的懒加载
const getModule = () => 
  require('./module.js') as typeof import('./module.js');

// 使用
function someFunction() {
  const { helper } = getModule();
  return helper();
}
```

### 模式 2: 条件导入

```typescript
// 死代码消除 + 懒加载
const module = feature('FEATURE_FLAG') 
  ? require('./module.js') as typeof import('./module.js')
  : null;
```

### 模式 3: Promise 动态导入

```typescript
// 异步加载
const module = await import('./module.js');
```

## 解决策略

### 短期: 文档化

1. 记录所有已知循环依赖
2. 添加注释说明原因
3. 标记需要重构的模块

### 中期: 依赖注入

```typescript
// 创建依赖容器
interface DependencyContainer {
  getTeammateUtils: () => typeof import('./utils/teammate.js');
  getTools: () => typeof import('./tools.js');
}

// 在应用初始化时注入
const container: DependencyContainer = {
  getTeammateUtils: () => require('./utils/teammate.js'),
  getTools: () => require('./tools.js'),
};
```

### 长期: 架构重构

1. **分层架构**: 明确模块依赖方向
   - 表现层 (UI) → 业务层 → 数据层 → 基础设施层

2. **事件驱动**: 使用事件总线解耦

3. **接口隔离**: 定义清晰的模块边界

## 依赖方向建议

```
┌─────────────────────────────────────────────┐
│                  main.tsx                    │
│                  (入口)                      │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              screens/ (UI)                   │
│              components/                     │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              services/ (业务)                │
│              tools/                          │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              utils/ (基础设施)               │
│              constants/                      │
└─────────────────────────────────────────────┘
```

## 已知循环依赖清单

| 源文件 | 目标文件 | 原因 | 解决方案 |
|--------|----------|------|----------|
| main.tsx | teammate.ts | 状态共享 | 懒加载 |
| main.tsx | swarm/teammatePromptAddendum.ts | 提示生成 | 懒加载 |
| tools.ts | TeamCreateTool | 工具注册 | 懒加载 |
| AppState.tsx | 多个模块 | 状态访问 | Context |
| QueryEngine.ts | 多个工具 | 查询处理 | 懒加载 |

## 最佳实践

### 1. 避免顶层导入循环模块

```typescript
// ❌ 避免
import { teammate } from './teammate.js';

// ✅ 推荐
const getTeammate = () => require('./teammate.js');
```

### 2. 使用类型导入

```typescript
// 类型导入不会产生运行时依赖
import type { Teammate } from './teammate.js';
```

### 3. 单向依赖

```typescript
// 依赖应该单向流动
// A → B → C (正确)
// A → B → A (错误)
```

### 4. 接口分离

```typescript
// 定义接口而非具体实现
interface ITeammateService {
  getTeammate(): Teammate;
}

// 在具体模块中实现
class TeammateService implements ITeammateService {
  getTeammate() { ... }
}
```

## 重构优先级

1. **P0**: main.tsx 循环 (影响启动)
2. **P1**: tools.ts 循环 (影响工具注册)
3. **P2**: AppState.tsx 循环 (影响状态管理)
4. **P3**: 其他模块循环 (渐进优化)
