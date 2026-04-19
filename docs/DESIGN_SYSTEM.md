# Astroncode 设计系统文档

本文档定义 Astroncode CLI 界面的设计系统，包括主题、颜色、组件规范和最佳实践。

## 1. 主题系统

### 1.1 主题变体

Astroncode 支持 6 种主题变体：

| 主题名 | 描述 | 适用场景 |
|--------|------|----------|
| `dark` | 深色主题（默认） | 深色终端背景 |
| `light` | 浅色主题 | 浅色终端背景 |
| `light-daltonized` | 浅色色盲友好 | 色觉障碍用户 |
| `dark-daltonized` | 深色色盲友好 | 色觉障碍用户 |
| `light-ansi` | 浅色 ANSI 回退 | 不支持 RGB 的终端 |
| `dark-ansi` | 深色 ANSI 回退 | 不支持 RGB 的终端 |

### 1.2 主题自动检测

系统通过 OSC 11 终端查询自动检测背景色：

```typescript
// src/components/design-system/ThemeProvider.tsx
const detectTheme = async (): Promise<ThemeName> => {
  // 发送 OSC 11 查询终端背景色
  // 根据亮度自动选择 dark 或 light
}
```

### 1.3 语义颜色令牌

主题系统定义 80+ 语义颜色令牌：

#### 品牌色
```typescript
astron: string         // 主品牌色
astronShimmer: string  // 品牌闪烁色
astronBody: string     // 品牌正文色
astronSubtext: string  // 品牌副文本色
```

#### 语义色
```typescript
success: string        // 成功状态
error: string          // 错误状态
warning: string        // 警告状态
info: string           // 信息状态
```

#### Diff 颜色
```typescript
diffAdd: string        // 添加行
diffRemove: string     // 删除行
diffChange: string     // 修改行
diffContext: string    // 上下文行
```

#### Agent 颜色
```typescript
agentPrimary: string   // 主代理
agentSecondary: string // 次代理
agentTertiary: string  // 第三代理
```

## 2. 组件规范

### 2.1 组件分类

```
src/components/
├── design-system/     # 基础设计组件
│   ├── ThemeProvider.tsx
│   ├── ThemedText.tsx
│   ├── ThemedBox.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Dialog.tsx
│   └── ListItem.tsx
├── features/          # 功能组件
│   ├── AutoUpdater/
│   ├── BridgeDialog/
│   └── ...
└── layout/            # 布局组件
    ├── Pane.tsx
    ├── Tabs.tsx
    └── ...
```

### 2.2 ThemedText 组件

自动解析主题颜色的文本组件：

```tsx
import { ThemedText } from './components/design-system/ThemedText.js'

// 使用主题色键
<ThemedText color="success">操作成功</ThemedText>

// 使用原始颜色
<ThemedText color="#ff0000">红色文本</ThemedText>

// 支持所有 Text 属性
<ThemedText color="astron" bold dimColor>
  品牌强调文本
</ThemedText>
```

**属性**:
| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `color` | `keyof Theme \| Color` | - | 主题色键或原始颜色 |
| `dimColor` | `boolean` | `false` | 是否变暗 |
| `bold` | `boolean` | `false` | 是否加粗 |
| `italic` | `boolean` | `false` | 是否斜体 |
| `underline` | `boolean` | `false` | 是否下划线 |
| `wrap` | `'wrap' \| 'truncate' \| ...` | - | 文本换行方式 |

### 2.3 ThemedBox 组件

自动解析主题颜色的容器组件：

```tsx
import { ThemedBox } from './components/design-system/ThemedBox.js'

<ThemedBox borderColor="astron" borderStyle="round">
  <ThemedText>内容</ThemedText>
</ThemedBox>
```

### 2.4 Badge 组件

状态标签组件：

```tsx
import { Badge } from './components/design-system/Badge.js'

<Badge variant="success">已完成</Badge>
<Badge variant="warning">待处理</Badge>
<Badge variant="error">失败</Badge>
<Badge variant="info">信息</Badge>
<Badge color="astron">自定义</Badge>
```

**变体颜色映射**:
| 变体 | 颜色 |
|------|------|
| `default` | `astronBody` |
| `success` | `success` |
| `warning` | `warning` |
| `error` | `error` |
| `info` | `astron` |

### 2.5 ListItem 组件

交互式列表项组件：

```tsx
import { ListItem } from './components/design-system/ListItem.js'

<ListItem
  isFocused={isFocused}
  isSelected={isSelected}
  disabled={disabled}
  showScrollUp={hasMoreAbove}
  showScrollDown={hasMoreBelow}
  onPress={() => handleSelect()}
>
  列表项内容
</ListItem>
```

**状态样式**:
- **默认**: 正常文本
- **聚焦**: 高亮背景，显示指针
- **选中**: 显示勾选标记
- **禁用**: 变暗文本

### 2.6 Dialog 组件

对话框容器组件：

```tsx
import { Dialog } from './components/design-system/Dialog.js'

<Dialog
  title="确认操作"
  exitState={exitState}
  onCancel={() => handleCancel()}
>
  <ThemedText>确定要继续吗？</ThemedText>
</Dialog>
```

**特性**:
- 自动处理 Ctrl+C/D 退出
- 支持键盘快捷键提示
- 可配置取消键绑定

## 3. 设计令牌

### 3.1 间距系统

```typescript
// src/constants/design.ts
export const SPACING = {
  xs: 0.5,   // 紧凑间距
  sm: 1,     // 小间距
  md: 2,     // 中等间距
  lg: 3,     // 大间距
  xl: 4,     // 超大间距
} as const
```

### 3.2 图标系统

使用 `figures` 库提供 Unicode 符号：

```typescript
import figures from 'figures'

// 常用符号
figures.tick         // ✓ 成功
figures.cross        // ✗ 错误
figures.warning      // ⚠ 警告
figures.pointer      // ❯ 指针
figures.arrowDown    // ↓ 向下
figures.arrowUp      // ↑ 向上
figures.ellipsis     // … 省略
figures.bullet       // • 列表项
```

### 3.3 文本换行

```typescript
// src/ink/wrap-text.ts
type WrapType = 
  | 'wrap'           // 自动换行
  | 'wrap-trim'      // 换行并修剪
  | 'truncate'       // 末尾截断
  | 'truncate-middle' // 中间截断
  | 'truncate-start'  // 开头截断
```

## 4. 颜色使用指南

### 4.1 语义化颜色选择

```tsx
// ✅ 推荐：使用语义颜色
<ThemedText color="success">操作成功</ThemedText>
<ThemedText color="error">发生错误</ThemedText>

// ❌ 避免：硬编码颜色
<ThemedText color="#00ff00">操作成功</ThemedText>
```

### 4.2 品牌色使用

```tsx
// 主要品牌元素
<ThemedText color="astron" bold>Astroncode</ThemedText>

// 次要品牌元素
<ThemedText color="astronBody">描述文本</ThemedText>

// 品牌边框
<ThemedBox borderColor="astron">
  {/* 内容 */}
</ThemedBox>
```

### 4.3 色盲友好设计

系统提供 daltonized 主题变体，确保色觉障碍用户也能区分：

- 成功/错误状态使用不同色相
- 不仅依赖颜色，同时使用图标和文本
- 高对比度确保可读性

## 5. 组件开发指南

### 5.1 新组件模板

```tsx
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Text } from '../../ink.js'
import type { Theme } from '../../utils/theme.js'
import { ThemedText } from './ThemedText.js'

type Props = {
  /** 组件描述 */
  children: ReactNode
  /** 可选变体 */
  variant?: 'default' | 'primary'
  /** 测试 ID */
  testID?: string
}

/**
 * 组件简短描述
 * 
 * @example
 * ```tsx
 * <MyComponent variant="primary">内容</MyComponent>
 * ```
 */
export function MyComponent({ 
  children, 
  variant = 'default',
  testID 
}: Props): ReactNode {
  return (
    <Box testID={testID}>
      <ThemedText color={variant === 'primary' ? 'astron' : 'astronBody'}>
        {children}
      </ThemedText>
    </Box>
  )
}
```

### 5.2 主题集成

```tsx
import { useTheme } from './ThemeProvider.js'

export function MyComponent() {
  const theme = useTheme()
  
  // 直接使用主题颜色
  const color = theme.astron
  
  // 或通过 ThemedText 自动解析
  return <ThemedText color="astron">文本</ThemedText>
}
```

### 5.3 状态管理

```tsx
import { useState } from 'react'

export function InteractiveComponent() {
  const [isFocused, setIsFocused] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  
  return (
    <Box 
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <ThemedText color={isFocused ? 'astron' : 'astronBody'}>
        {isSelected ? '✓ ' : ''}内容
      </ThemedText>
    </Box>
  )
}
```

## 6. 无障碍设计

### 6.1 屏幕阅读器支持

```tsx
// 使用 aria 属性
<Box role="button" aria-label="确认按钮">
  <ThemedText>确认</ThemedText>
</Box>

// 声明光标位置
<Box cursorPosition={0}>
  {/* 列表项 */}
</Box>
```

### 6.2 键盘导航

```tsx
import { useKey } from '../../ink.js'

export function NavigableComponent() {
  useKey('up', () => moveUp())
  useKey('down', () => moveDown())
  useKey('enter', () => select())
  
  return <Box>{/* 内容 */}</Box>
}
```

### 6.3 高对比度

所有主题变体确保 WCAG AA 级别对比度：

- 文本与背景对比度 ≥ 4.5:1
- 大文本对比度 ≥ 3:1
- ANSI 回退主题使用 16 色标准

## 7. 性能优化

### 7.1 React Compiler

组件使用 React Compiler 优化：

```tsx
// 编译器自动添加 memo
export function MyComponent(props: Props): ReactNode {
  'use memo' // 编译器指令
  // ...
}
```

### 7.2 避免不必要渲染

```tsx
import { useMemo, useCallback } from 'react'

export function ListComponent({ items }: Props) {
  // 缓存计算结果
  const sortedItems = useMemo(() => 
    items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )
  
  // 缓存回调函数
  const handleSelect = useCallback((id: string) => {
    // 处理选择
  }, [])
  
  return (
    <Box flexDirection="column">
      {sortedItems.map(item => (
        <ListItem key={item.id} onPress={() => handleSelect(item.id)}>
          {item.name}
        </ListItem>
      ))}
    </Box>
  )
}
```

## 8. 测试指南

### 8.1 组件快照测试

```tsx
import { render } from 'ink-testing-library'
import { Badge } from './Badge.js'

test('Badge renders with success variant', () => {
  const { lastFrame } = render(<Badge variant="success">成功</Badge>)
  expect(lastFrame()).toMatchSnapshot()
})
```

### 8.2 主题测试

```tsx
import { ThemeProvider } from './ThemeProvider.js'

test('Component uses correct theme colors', () => {
  const { lastFrame } = render(
    <ThemeProvider initialTheme="dark">
      <ThemedText color="astron">品牌文本</ThemedText>
    </ThemeProvider>
  )
  // 验证颜色
})
```

## 9. 迁移指南

### 9.1 从硬编码颜色迁移

```tsx
// 之前
<Text color="#00ff00">成功</Text>

// 之后
<ThemedText color="success">成功</ThemedText>
```

### 9.2 从默认导出迁移

```tsx
// 之前
import Badge from './Badge.js'

// 之后
import { Badge } from './Badge.js'
```

## 10. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-18 | 初始设计系统文档 |
