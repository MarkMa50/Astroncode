# Brand Extension Rules to Add to runtime-branding.mjs

## Additional String Replacements (add to brandingReplacements array)

### Claude.ai / claude.ai references
['claude.ai subscription', 'local provider subscription'],
['claude.ai account', 'local provider account'],
['claude.ai authentication', 'local provider authentication'],
['claude.ai/code', 'the local bridge'],
['Claude.ai', 'Local Provider'],

### Claude subscription/account references
['Claude subscription', 'local provider subscription'],
['Claude account', 'local provider account'],
['your Claude account', 'your local provider account'],
['with your Claude subscription', 'with your local provider credentials'],
['sign in with your Claude account', 'configure your local provider credentials'],
['Login with Claude account', 'Configure local provider'],
['Claude account with subscription', 'Local provider with subscription'],

### Session/stats references
['Fetching your Claude Code sessions', 'Fetching your Atroncode sessions'],
['Loading your Claude Code stats', 'Loading your Atroncode stats'],
['your Claude Code usage', 'your Atroncode usage'],
['your Claude Code sessions', 'your Atroncode sessions'],

### Anthropic references (user-facing only)
['your Anthropic account', 'your local provider account'],
['Anthropic account', 'local provider account'],
['Anthropic API key', 'provider API key'],
['Anthropic employees', 'internal users'],
['Anthropic subscription', 'local provider subscription'],

### URL replacements (disable external links)
['https://code.claude.com/docs/', 'https://docs.astroncode.local/'],
['https://claude.ai/', 'https://astroncode.local/'],
['https://support.claude.com/', 'https://support.astroncode.local/'],
['https://platform.claude.com/', 'https://platform.astroncode.local/'],

## Regex Patterns (add to end of brandingReplacements array)

{
  pattern: /\bClaude\.ai\b/g,
  replace: 'Local Provider',
},
{
  pattern: /\bclaude\.ai\b/g,
  replace: 'local provider',
},
{
  pattern: /your Claude (?!Code)/gi,
  replace: 'your local provider',
},
{
  pattern: /Claude subscription/gi,
  replace: 'local provider subscription',
},
{
  pattern: /Claude account/gi,
  replace: 'local provider account',
},
{
  pattern: /Anthropic (?!API|SDK|version|beta)/gi,
  replace: 'provider',
},
{
  pattern: /https:\/\/code\.claude\.com\/docs\/en\/[a-z-]+/g,
  replace: 'https://docs.astroncode.local/help',
},
{
  pattern: /https:\/\/claude\.ai\/[a-z\/-]+/g,
  replace: 'https://astroncode.local/settings',
},
