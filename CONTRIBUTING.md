# Contributing to Astroncode

感谢您有兴趣为 Astroncode 做出贡献！本文档将帮助您了解如何参与项目开发。

## 🚀 快速开始

### 环境要求

- **Node.js**: v20.0.0 或更高版本
- **npm**: v10.0.0 或更高版本
- **Git**: v2.30.0 或更高版本

### 克隆与安装

```bash
# 克隆仓库
git clone https://github.com/astroncode/astroncode.git
cd astroncode

# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm test
```

## 📁 项目结构

```
astroncode/
├── src/
│   ├── commands/       # CLI 命令实现
│   ├── components/     # React 组件
│   ├── constants/      # 常量定义
│   ├── services/       # 服务层
│   ├── tools/          # 工具实现
│   ├── utils/          # 工具函数
│   └── main.tsx        # 主入口
├── tests/              # 测试文件
├── docs/               # 文档
├── scripts/            # 构建脚本
└── package.json
```

## 🔧 开发工作流

### 1. 创建分支

```bash
# 从 main 创建功能分支
git checkout -b feature/your-feature-name

# 或修复分支
git checkout -b fix/your-bug-fix
```

### 2. 编写代码

遵循项目的编码规范（见 `docs/CONVENTIONS.md`）：

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 为新功能添加测试
- 更新相关文档

### 3. 运行检查

```bash
# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 测试
npm test

# 构建
npm run build
```

### 4. 提交更改

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

示例：
```
feat(commands): 添加 config export 命令
fix(utils): 修复路径解析中的空格处理
docs(architecture): 更新服务层架构图
```

### 5. 创建 Pull Request

1. 推送分支到 GitHub
2. 创建 Pull Request
3. 等待 CI 检查通过
4. 等待代码审查

## 🧪 测试指南

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
node --test tests/utils-core.test.mjs

# 运行带覆盖率的测试
npm run test:coverage
```

### 编写测试

测试文件放在 `tests/` 目录，使用 Node.js 内置测试运行器：

```javascript
import assert from 'node:assert/strict'
import test from 'node:test'

test('功能描述', () => {
  // 测试代码
  assert.strictEqual(actual, expected)
})
```

### 测试命名约定

- `utils-*.test.mjs` - 工具函数测试
- `integration-*.test.mjs` - 集成测试
- `tools-*.test.mjs` - 工具测试

## 📝 代码规范

### TypeScript

- 使用严格模式 (`strict: true`)
- 避免使用 `any`，使用具体类型
- 为公共 API 添加 JSDoc 注释
- 使用 ES 模块语法 (`import`/`export`)

### React 组件

- 使用函数组件和 Hooks
- 组件文件使用 `.tsx` 扩展名
- 遵循设计系统规范（见 `docs/DESIGN_SYSTEM.md`）

### 文件组织

- 每个模块目录应有 `index.ts` 作为入口
- 相关功能分组到子目录
- 保持文件职责单一

## 🏗️ 架构指南

详见 `docs/ARCHITECTURE.md`，关键原则：

1. **分层架构**: CLI → Commands → Services → Utils
2. **依赖方向**: 外层依赖内层，内层不依赖外层
3. **模块边界**: 明确的职责划分，避免循环依赖

## 🐛 报告问题

### Bug 报告

请包含以下信息：

1. Astroncode 版本 (`astroncode --version`)
2. 操作系统和版本
3. 重现步骤
4. 预期行为
5. 实际行为
6. 相关日志

### 功能请求

请描述：

1. 功能用例
2. 预期行为
3. 可能的实现方案

## 📚 文档贡献

文档位于 `docs/` 目录：

- `ARCHITECTURE.md` - 系统架构
- `CONVENTIONS.md` - 编码规范
- `DESIGN_SYSTEM.md` - 设计系统
- `TODO.md` - 技术债务追踪

## 🙏 行为准则

- 尊重所有贡献者
- 保持建设性讨论
- 关注代码质量而非个人

## 📄 许可证

贡献的代码将根据项目的开源许可证发布。

---

再次感谢您的贡献！如有问题，请随时在 GitHub Issues 中提问。
