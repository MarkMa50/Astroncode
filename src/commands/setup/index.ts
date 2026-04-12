import type { Command } from '../../commands.js'

/**
 * /setup command - Quick configuration wizard for Astroncode
 *
 * Allows users to re-run the onboarding flow to configure:
 * - Theme
 * - Model provider settings
 * - Terminal setup
 * - Other preferences
 *
 * Useful for new users on different machines or when reconfiguring.
 */
export default {
  type: 'local-jsx',
  name: 'setup',
  description: 'Run the setup wizard to configure Astroncode',
  load: () => import('./setup.js'),
} satisfies Command
