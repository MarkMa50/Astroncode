import type { Command } from '../../commands.js'

const mobile = {
  type: 'local-jsx',
  name: 'mobile',
  aliases: ['ios', 'android'],
  description: 'Mobile companion entry is not available in this local Atroncode build',
  isEnabled: () => false,
  isHidden: true,
  load: () => import('./mobile.js'),
} satisfies Command

export default mobile
