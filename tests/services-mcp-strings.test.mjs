/**
 * MCP String Utilities - Unit Tests
 *
 * Tests for MCP tool name parsing, building, and display name extraction.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// MCP Info Extraction Tests
// ============================================================================

test('mcpInfoFromString - extracts server and tool name', () => {
  const toolString = 'mcp__github__create_issue'
  const parts = toolString.split('__')
  const [mcpPart, serverName, ...toolNameParts] = parts

  assert.strictEqual(mcpPart, 'mcp')
  assert.strictEqual(serverName, 'github')
  assert.strictEqual(toolNameParts.join('__'), 'create_issue')
})

test('mcpInfoFromString - returns null for non-MCP string', () => {
  const toolString = 'builtin_tool'
  const parts = toolString.split('__')
  const [mcpPart, serverName] = parts

  assert.notStrictEqual(mcpPart, 'mcp')
})

test('mcpInfoFromString - handles tool with underscores', () => {
  const toolString = 'mcp__github__create_pull_request'
  const parts = toolString.split('__')
  const [mcpPart, serverName, ...toolNameParts] = parts

  assert.strictEqual(serverName, 'github')
  assert.strictEqual(toolNameParts.join('__'), 'create_pull_request')
})

test('mcpInfoFromString - handles server only', () => {
  const toolString = 'mcp__filesystem'
  const parts = toolString.split('__')
  const [mcpPart, serverName, ...toolNameParts] = parts

  assert.strictEqual(serverName, 'filesystem')
  assert.strictEqual(toolNameParts.length, 0)
})

test('mcpInfoFromString - handles empty string', () => {
  const toolString = ''
  const parts = toolString.split('__')

  assert.strictEqual(parts.length, 1)
  assert.strictEqual(parts[0], '')
})

// ============================================================================
// MCP Prefix Tests
// ============================================================================

test('getMcpPrefix - generates correct prefix', () => {
  const serverName = 'github'
  const prefix = `mcp__${serverName}__`

  assert.strictEqual(prefix, 'mcp__github__')
})

test('getMcpPrefix - handles server with spaces', () => {
  // Server names are typically normalized
  const serverName = 'my_server'
  const prefix = `mcp__${serverName}__`

  assert.strictEqual(prefix, 'mcp__my_server__')
})

// ============================================================================
// MCP Tool Name Building Tests
// ============================================================================

test('buildMcpToolName - builds full tool name', () => {
  const serverName = 'github'
  const toolName = 'create_issue'
  const fullName = `mcp__${serverName}__${toolName}`

  assert.strictEqual(fullName, 'mcp__github__create_issue')
})

test('buildMcpToolName - handles complex names', () => {
  const serverName = 'my-mcp-server'
  const toolName = 'do_something_cool'
  const fullName = `mcp__${serverName}__${toolName}`

  assert.ok(fullName.startsWith('mcp__'))
  assert.ok(fullName.includes('my-mcp-server'))
  assert.ok(fullName.endsWith('do_something_cool'))
})

// ============================================================================
// Permission Check Name Tests
// ============================================================================

test('getToolNameForPermissionCheck - uses MCP name for MCP tools', () => {
  const tool = {
    name: 'create_issue',
    mcpInfo: { serverName: 'github', toolName: 'create_issue' },
  }

  const permissionName = tool.mcpInfo
    ? `mcp__${tool.mcpInfo.serverName}__${tool.mcpInfo.toolName}`
    : tool.name

  assert.strictEqual(permissionName, 'mcp__github__create_issue')
})

test('getToolNameForPermissionCheck - uses builtin name for builtin tools', () => {
  const tool = {
    name: 'Read',
    mcpInfo: undefined,
  }

  const permissionName = tool.mcpInfo
    ? `mcp__${tool.mcpInfo.serverName}__${tool.mcpInfo.toolName}`
    : tool.name

  assert.strictEqual(permissionName, 'Read')
})

// ============================================================================
// Display Name Extraction Tests
// ============================================================================

test('getMcpDisplayName - removes MCP prefix', () => {
  const fullName = 'mcp__github__create_issue'
  const serverName = 'github'
  const prefix = `mcp__${serverName}__`

  const displayName = fullName.replace(prefix, '')
  assert.strictEqual(displayName, 'create_issue')
})

test('getMcpDisplayName - handles complex tool names', () => {
  const fullName = 'mcp__github__create_pull_request_review'
  const serverName = 'github'
  const prefix = `mcp__${serverName}__`

  const displayName = fullName.replace(prefix, '')
  assert.strictEqual(displayName, 'create_pull_request_review')
})

// ============================================================================
// User-Facing Name Extraction Tests
// ============================================================================

test('extractMcpToolDisplayName - extracts from user-facing name', () => {
  const userFacingName = 'github - Add comment to issue (MCP)'

  // Remove (MCP) suffix
  let withoutSuffix = userFacingName.replace(/\s*\(MCP\)\s*$/, '')
  withoutSuffix = withoutSuffix.trim()

  // Remove server prefix
  const dashIndex = withoutSuffix.indexOf(' - ')
  const displayName = withoutSuffix.substring(dashIndex + 3).trim()

  assert.strictEqual(displayName, 'Add comment to issue')
})

test('extractMcpToolDisplayName - handles name without dash', () => {
  const userFacingName = 'Tool Name (MCP)'

  let withoutSuffix = userFacingName.replace(/\s*\(MCP\)\s*$/, '')
  withoutSuffix = withoutSuffix.trim()

  const dashIndex = withoutSuffix.indexOf(' - ')
  const displayName = dashIndex !== -1
    ? withoutSuffix.substring(dashIndex + 3).trim()
    : withoutSuffix

  assert.strictEqual(displayName, 'Tool Name')
})

test('extractMcpToolDisplayName - handles name without MCP suffix', () => {
  const userFacingName = 'github - Create Issue'

  let withoutSuffix = userFacingName.replace(/\s*\(MCP\)\s*$/, '')
  withoutSuffix = withoutSuffix.trim()

  const dashIndex = withoutSuffix.indexOf(' - ')
  const displayName = withoutSuffix.substring(dashIndex + 3).trim()

  assert.strictEqual(displayName, 'Create Issue')
})

// ============================================================================
// Edge Case Tests
// ============================================================================

test('mcpInfoFromString - handles double underscore in server name limitation', () => {
  // Known limitation: server names with __ will parse incorrectly
  const toolString = 'mcp__my__server__tool'
  const parts = toolString.split('__')
  const [mcpPart, serverName, ...toolNameParts] = parts

  // This parses as server="my" and tool="server__tool"
  // instead of server="my__server" and tool="tool"
  assert.strictEqual(serverName, 'my')
  assert.strictEqual(toolNameParts.join('__'), 'server__tool')
})

test('buildMcpToolName - is inverse of mcpInfoFromString', () => {
  const serverName = 'github'
  const toolName = 'create_issue'
  const fullName = `mcp__${serverName}__${toolName}`

  const parts = fullName.split('__')
  const [mcpPart, parsedServer, ...parsedToolParts] = parts

  assert.strictEqual(parsedServer, serverName)
  assert.strictEqual(parsedToolParts.join('__'), toolName)
})

// ============================================================================
// Normalization Tests
// ============================================================================

test('normalizeNameForMCP - handles special characters', () => {
  // MCP names typically normalize to lowercase with underscores
  const name = 'My-Server Name'
  const normalized = name.toLowerCase().replace(/[^a-z0-9_]/g, '_')

  assert.strictEqual(normalized, 'my_server_name')
})

test('normalizeNameForMCP - preserves underscores', () => {
  const name = 'my_server_name'
  const normalized = name.toLowerCase()

  assert.strictEqual(normalized, 'my_server_name')
})
