import { join } from 'path'

export const ASTRON_PLUGIN_DIRNAME = '.astron-plugin'
export const LEGACY_PLUGIN_DIRNAME = '.claude-plugin'

export const ASTRON_PLUGIN_ROOT_VAR = 'ASTRONCODE_PLUGIN_ROOT'
export const ASTRON_PLUGIN_DATA_VAR = 'ASTRONCODE_PLUGIN_DATA'
export const LEGACY_PLUGIN_ROOT_VAR = 'CLAUDE_PLUGIN_ROOT'
export const LEGACY_PLUGIN_DATA_VAR = 'CLAUDE_PLUGIN_DATA'

export function getPluginManifestCandidates(root: string): string[] {
  return [
    join(root, ASTRON_PLUGIN_DIRNAME, 'plugin.json'),
    join(root, LEGACY_PLUGIN_DIRNAME, 'plugin.json'),
    join(root, 'plugin.json'),
  ]
}

export function getMarketplaceManifestCandidates(root: string): string[] {
  return [
    join(root, ASTRON_PLUGIN_DIRNAME, 'marketplace.json'),
    join(root, LEGACY_PLUGIN_DIRNAME, 'marketplace.json'),
    join(root, 'marketplace.json'),
  ]
}

export function getPreferredPluginManifestPath(root: string): string {
  return getPluginManifestCandidates(root)[0]!
}

export function getPreferredMarketplaceManifestPath(root: string): string {
  return getMarketplaceManifestCandidates(root)[0]!
}
