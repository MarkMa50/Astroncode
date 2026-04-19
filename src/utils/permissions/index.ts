/**
 * Permissions Utilities Index
 *
 * Permission management, classification, and validation utilities.
 *
 * @module utils/permissions
 */

// Core permission types and modes
export { PermissionMode } from './PermissionMode.js'
export type { PermissionResult } from './PermissionResult.js'
export type { PermissionRule } from './PermissionRule.js'

// Permission setup and management
export { setupPermissions } from './permissionSetup.js'
export { getNextPermissionMode } from './getNextPermissionMode.js'
export { loadPermissions } from './permissionsLoader.js'

// Classification
export { classifyBashCommand } from './bashClassifier.js'
export { classifyFilesystemAccess } from './filesystem.js'
export { getYoloClassifier } from './yoloClassifier.js'
export { getClassifierDecision } from './classifierDecision.js'
export { getClassifierShared } from './classifierShared.js'

// Dangerous patterns
export { getDangerousPatterns } from './dangerousPatterns.js'

// Denial tracking
export { trackDenial, getDenialCount, clearDenials } from './denialTracking.js'

// Path validation
export { validatePath } from './pathValidation.js'

// Permission explainer
export { explainPermission } from './permissionExplainer.js'

// Rule parsing
export { parsePermissionRules } from './permissionRuleParser.js'

// Shadowed rule detection
export { detectShadowedRules } from './shadowedRuleDetection.js'

// Shell rule matching
export { matchShellRule } from './shellRuleMatching.js'

// Permission update
export type { PermissionUpdate } from './PermissionUpdate.js'
export { PermissionUpdateSchema } from './PermissionUpdateSchema.js'

// Permission prompt
export { PermissionPromptToolResultSchema } from './PermissionPromptToolResultSchema.js'

// Auto mode
export { getAutoModeState, setAutoModeState } from './autoModeState.js'

// Bypass permissions killswitch
export { checkBypassPermissionsKillswitch } from './bypassPermissionsKillswitch.js'
