# Changelog

All notable changes to Astroncode will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive utility index files for all `src/utils/` subdirectories
- Main constants index file (`src/constants/index.ts`)
- Unit tests for core utilities (errors, config, env, log)
- Unit tests for path, uuid, sanitization, json, and validation utilities
- Design system documentation (`docs/DESIGN_SYSTEM.md`)
- Architecture documentation (`docs/ARCHITECTURE.md`)
- Conventions documentation (`docs/CONVENTIONS.md`)
- Technical debt tracking (`docs/TODO.md`)
- Circular dependencies analysis (`docs/CIRCULAR_DEPENDENCIES.md`)
- Main simplification strategy (`docs/MAIN_SIMPLIFICATION.md`)

### Changed

- Renamed JSX files from `.ts` to `.tsx` extension for proper React support
- Improved code organization with barrel exports in utility directories
- Enhanced test coverage from ~15% to ~30%

### Fixed

- File extension consistency for React components

## [1.0.0] - 2024-XX-XX

### Added

- Initial release of Astroncode
- CLI interface with REPL mode
- Multi-provider support (Anthropic, OpenAI, Google, etc.)
- MCP (Model Context Protocol) integration
- Tool system for file operations, bash commands, and more
- Permission system with user confirmation
- Session management and persistence
- Configuration management
- Plugin system
- Memory system for context persistence

### Features

#### CLI Commands

- `astroncode` - Start interactive REPL
- `astroncode config` - Configuration management
- `astroncode mcp` - MCP server management
- `astroncode doctor` - System diagnostics
- `astroncode --version` - Version information
- `astroncode --help` - Help information

#### Tools

- **Bash** - Execute shell commands
- **Read** - Read file contents
- **Write** - Write file contents
- **Edit** - Edit files with string replacement
- **Glob** - Find files by pattern
- **Grep** - Search file contents
- **WebFetch** - Fetch web content
- **WebSearch** - Search the web
- And many more...

#### Components

- 147+ React components for CLI UI
- Design system with theming support
- Interactive prompts and dialogs
- Progress indicators and spinners
- Code highlighting and diffs

#### Services

- API clients for multiple providers
- Session persistence
- Configuration storage
- Plugin management
- MCP server lifecycle

### Technical Details

- Built with TypeScript and React (Ink)
- Node.js 20+ support
- Cross-platform (macOS, Windows, Linux)
- ES modules architecture

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-XX-XX | Initial release |
| Unreleased | - | Code organization improvements |

---

For more details on each release, see the [GitHub Releases](https://github.com/astroncode/astroncode/releases) page.
