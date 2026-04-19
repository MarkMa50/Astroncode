/**
 * Plugins Utilities Index
 *
 * Plugin loading, management, marketplace, and validation utilities.
 *
 * @module utils/plugins
 */

// Plugin loader
export { loadPlugin, loadAllPlugins } from './pluginLoader.js'
export { validatePlugin } from './validatePlugin.js'

// Plugin installation
export { installPlugin, uninstallPlugin } from './pluginInstallationHelpers.js'
export { headlessInstall } from './headlessPluginInstall.js'

// Marketplace
export { getMarketplaceManager } from './marketplaceManager.js'
export { getMarketplaceHelpers } from './marketplaceHelpers.js'
export { getOfficialMarketplace } from './officialMarketplace.js'
export { fetchFromGcs } from './officialMarketplaceGcs.js'
export { checkOfficialMarketplaceStartup } from './officialMarketplaceStartupCheck.js'

// Plugin directories
export { getPluginDirectories } from './pluginDirectories.js'
export { getPluginLayout } from './pluginLayout.js'

// Plugin options
export { getPluginOptions, setPluginOptions } from './pluginOptionsStorage.js'

// Plugin agents, commands, hooks
export { loadPluginAgents } from './loadPluginAgents.js'
export { loadPluginCommands } from './loadPluginCommands.js'
export { loadPluginHooks } from './loadPluginHooks.js'
export { loadPluginOutputStyles } from './loadPluginOutputStyles.js'

// Plugin schemas
export { getPluginSchemas } from './schemas.js'

// Plugin integration
export { integrateLspPlugin } from './lspPluginIntegration.js'
export { integrateMcpPlugin } from './mcpPluginIntegration.js'

// Plugin lifecycle
export { performStartupChecks } from './performStartupChecks.js'
export { runPluginStartupCheck } from './pluginStartupCheck.js'
export { autoUpdatePlugins } from './pluginAutoupdate.js'
export { refreshPlugins } from './refresh.js'

// Plugin management
export { getInstalledPluginsManager } from './installedPluginsManager.js'
export { getManagedPlugins } from './managedPlugins.js'
export { checkPluginPolicy } from './pluginPolicy.js'

// Plugin identification
export { getPluginIdentifier } from './pluginIdentifier.js'
export { parseMarketplaceInput } from './parseMarketplaceInput.js'

// Plugin versioning
export { getPluginVersion, compareVersions } from './pluginVersioning.js'

// Plugin blocklist
export { checkPluginBlocklist } from './pluginBlocklist.js'
export { flagPlugin } from './pluginFlagging.js'

// Plugin recommendation
export { getLspRecommendation } from './lspRecommendation.js'
export { getHintRecommendation } from './hintRecommendation.js'

// Add dir plugin settings
export { getAddDirPluginSettings } from './addDirPluginSettings.js'

// Cache utilities
export { getCacheUtils } from './cacheUtils.js'
export { getZipCache } from './zipCache.js'
export { getZipCacheAdapters } from './zipCacheAdapters.js'

// Dependency resolver
export { resolveDependencies } from './dependencyResolver.js'

// Git availability
export { checkGitAvailability } from './gitAvailability.js'

// Install counts
export { getInstallCounts } from './installCounts.js'

// MCPB handler
export { handleMcpb } from './mcpbHandler.js'

// Orphaned plugin filter
export { filterOrphanedPlugins } from './orphanedPluginFilter.js'

// Reconciler
export { reconcilePlugins } from './reconciler.js'

// Walk plugin markdown
export { walkPluginMarkdown } from './walkPluginMarkdown.js'

// Fetch telemetry
export { fetchPluginTelemetry } from './fetchTelemetry.js'
