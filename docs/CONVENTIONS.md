# Astroncode 编码规范

本文档定义 Astroncode 项目的编码标准，确保代码一致性、可读性和可维护性。

## 1. 命名规范

### 1.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| TypeScript 文件 | camelCase | `toolUtils.ts`, `configParser.ts` |
| React 组件 | PascalCase | `ThemeProvider.tsx`, `AutoUpdater.tsx` |
| 工具目录 | PascalCase + Tool | `BashTool/`, `FileEditTool/` |
| 命令目录 | kebab-case | `add-dir/`, `auto-sync/` |
| 测试文件 | 原名 + .test | `errors.test.ts`, `config.test.ts` |

### 1.2 代码命名

```typescript
// 常量: UPPER_SNAKE_CASE
export const ASTRONCODE_NAME = 'Astroncode'
export const MAX_RETRY_COUNT = 3

// 变量/函数: camelCase
const configPath = '/path/to/config'
function getSettings() {}

// 类/接口/类型: PascalCase
class AstronError extends Error {}
interface AppConfig {}
type ThemeName = 'light' | 'dark'

// 私有成员: 下划线前缀
class MyClass {
  private _internalState = 0
}

// 布尔变量: is/has/can 前缀
const isEnabled = true
const hasPermission = false
const canProceed = true
```

### 1.3 导出命名

```typescript
// 推荐: 命名导出
export function helper() {}
export class MyClass {}
export const MY_CONSTANT = 'value'

// 仅用于 React 组件: 默认导出
export default function MyComponent() {}
```

## 2. 导入规范

### 2.1 导入顺序

```typescript
// 1. Node.js 内置模块
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// 2. 第三方模块
import React from 'react'
import { Command } from 'commander'

// 3. 项目内部模块 (使用别名)
import { config } from 'src/utils/config.js'
import { AstronError } from 'src/utils/errors.js'

// 4. 相对导入
import { helper } from './utils.js'
import type { Props } from './types.js'
```

### 2.2 条件导入

```typescript
// 使用 feature() 进行条件编译
const voiceModule = feature('VOICE_MODE')
  ? require('./voice.js') as typeof import('./voice.js')
  : null

// 懒加载打破循环依赖
const getTeammateUtils = () =>
  require('./utils/teammate.js') as typeof import('./utils/teammate.js')
```

### 2.3 类型导入

```typescript
// 使用 type 关键字导入纯类型
import type { AppConfig } from './types.js'

// 运行时值和类型混合导入
import { config, type ConfigOptions } from './config.js'
```

## 3. 错误处理规范

### 3.1 错误类层次

```
Error
├── AstronError           # 基础错误类
├── ConfigParseError      # 配置解析错误
├── ShellError            # Shell 命令错误
├── AbortError            # 用户中止错误
├── TeleportOperationError # Teleport 操作错误
└── TelemetrySafeError    # 可安全上报的错误
```

### 3.2 错误使用

```typescript
import { AstronError, ConfigParseError, ShellError } from './errors.js'

// 基础错误
throw new AstronError(`Failed to load config: ${path}`)

// 带上下文的错误
throw new ConfigParseError(
  `Invalid JSON in ${filePath}`,
  filePath,
  defaultConfig
)

// Shell 错误
throw new ShellError(stdout, stderr, exitCode, interrupted)

// 安全上报错误 (不含敏感信息)
throw new TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS(
  'MCP server connection timed out'
)
```

### 3.3 错误处理模式

```typescript
// 推荐: 具体错误优先
try {
  await operation()
} catch (error) {
  if (isAbortError(error)) {
    // 处理中止
    return
  }
  if (error instanceof ConfigParseError) {
    // 处理配置错误
    return
  }
  // 未知错误
  throw error
}

// 避免: 空catch块
try {
  await operation()
} catch {
  // 不要这样做
}
```

## 4. 类型安全规范

### 4.1 避免类型断言

```typescript
// 避免
const value = data as MyType

// 推荐: 使用类型守卫
function isMyType(value: unknown): value is MyType {
  return typeof value === 'object' &&
         value !== null &&
         'requiredField' in value
}

if (isMyType(data)) {
  // data 现在是 MyType 类型
}
```

### 4.2 unknown 处理

```typescript
// 使用 unknown 而非 any
function parse(input: unknown): Result {
  if (typeof input !== 'string') {
    throw new AstronError('Expected string input')
  }
  return JSON.parse(input)
}
```

### 4.3 泛型约束

```typescript
// 使用泛型约束而非 any
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

## 5. 代码风格

### 5.1 函数长度

- 单个函数不超过 50 行
- 超过 20 行考虑拆分
- 嵌套不超过 3 层

### 5.2 注释规范

```typescript
/**
 * 简短描述 (一行)
 *
 * 详细描述 (可选)
 *
 * @param name - 参数说明
 * @returns 返回值说明
 * @throws 可能抛出的错误
 *
 * @example
 * ```ts
 * const result = functionName('test')
 * ```
 */
export function functionName(name: string): Result {
  // 实现
}

// 行内注释: 解释为什么，而不是做什么
const timeout = 5000 // 5秒超时，匹配后端响应时间
```

### 5.3 常量定义

```typescript
// 使用 as const 确保类型安全
export const SPACING = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
} as const

// 使用 const enum 或字面量联合
export type SpacingKey = keyof typeof SPACING
```

## 6. React 组件规范

### 6.1 组件结构

```typescript
// 组件文件结构
import { c as _c } from 'react/compiler-runtime'
import React, { useState, useEffect } from 'react'

// 1. 类型定义
type Props = {
  title: string
  onPress?: () => void
}

// 2. 组件实现
export function MyComponent({ title, onPress }: Props) {
  // 3. Hooks
  const [state, setState] = useState(0)

  // 4. 事件处理
  const handleClick = () => {
    onPress?.()
  }

  // 5. 渲染
  return (
    <div onClick={handleClick}>
      {title}
    </div>
  )
}
```

### 6.2 Props 命名

```typescript
// 事件处理: on 前缀
type Props = {
  onPress?: () => void
  onChange?: (value: string) => void
  onSubmit?: () => void
}

// 布尔属性: is/has/can 前缀
type Props = {
  isActive?: boolean
  hasError?: boolean
  canEdit?: boolean
}

// 渲染属性: children
type Props = {
  children: React.ReactNode
}
```

### 6.3 测试 ID

```typescript
// 所有交互组件添加 testID
<Button testID="submit-button" onPress={handleSubmit}>
  Submit
</Button>
```

## 7. 测试规范

### 7.1 测试文件组织

```typescript
/**
 * 模块名 - 单元测试
 *
 * 测试描述
 */
import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// 分组 1
// ============================================================================

test('功能描述', () => {
  // Arrange
  const input = 'test'

  // Act
  const result = functionUnderTest(input)

  // Assert
  assert.strictEqual(result, expected)
})
```

### 7.2 测试命名

```typescript
// 格式: "功能 - 具体行为"
test('getSettings - returns default when file missing', () => {})
test('parseConfig - throws on invalid JSON', () => {})
```

## 8. 文档规范

### 8.1 README 结构

```markdown
# 模块名称

简短描述

## 功能

- 功能 1
- 功能 2

## 使用

```ts
import { feature } from 'module'
```

## API

### functionName

描述

## 配置

配置选项说明
```

### 8.2 代码注释

- 公共 API 必须有 JSDoc
- 复杂逻辑必须有注释
- 避免注释掉代码 (使用版本控制)

## 9. Git 提交规范

### 9.1 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

### 9.3 示例

```
feat(commands): add /plan command for structured planning

- Add EnterPlanModeTool and ExitPlanModeTool
- Support plan file management
- Add plan mode UI indicators

Closes #123
```

## 10. 禁止事项

### 10.1 代码禁止

- 禁止使用 `any` 类型
- 禁止空 catch 块
- 禁止未处理的 Promise
- 禁止硬编码敏感信息

### 10.2 文件禁止

- 禁止在 src/ 外创建源代码
- 禁止提交 .env 文件
- 禁止提交 node_modules/

### 10.3 依赖禁止

- 禁止未使用的依赖
- 禁止重复功能的依赖
- 禁止过时的依赖版本
