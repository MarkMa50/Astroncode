import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const repoRoot = 'C:\\Users\\markw\\astroncode'

async function readRepoFile(relativePath) {
  return readFile(`${repoRoot}\\${relativePath}`, 'utf8')
}

test('environment prompt avoids Claude Code family guidance in user-facing copy', async () => {
  const promptsSource = await readRepoFile('src\\constants\\prompts.ts')

  assert.doesNotMatch(
    promptsSource,
    /The most recent Claude model family is Claude 4\.5\/4\.6/i,
  )
  assert.doesNotMatch(
    promptsSource,
    /Claude Code is available as a CLI in the terminal/i,
  )
  assert.doesNotMatch(
    promptsSource,
    /Fast mode for Claude Code uses the same/i,
  )
  assert.match(promptsSource, /Astroncode is available as a local coding system/i)
  assert.match(promptsSource, /Fast mode in Astroncode keeps the same configured model/i)
})

test('public model naming helpers do not surface Claude branding', async () => {
  const modelSource = await readRepoFile('src\\utils\\model\\model.ts')

  assert.doesNotMatch(modelSource, /return `Claude \$\{publicName\}`/)
  assert.doesNotMatch(modelSource, /return `Claude \(\$\{model\}\)`/)
  assert.doesNotMatch(modelSource, /Returns "Claude \{ModelName\}"/)
  assert.match(modelSource, /return `Astron \$\{publicName\}`/)
  assert.match(modelSource, /return `Astron \(\$\{model\}\)`/)
})

test('high-visibility auth and model picker copy uses Astron branding', async () => {
  const oauthSource = await readRepoFile('src\\components\\ConsoleOAuthFlow.tsx')
  const pickerSource = await readRepoFile('src\\components\\ModelPicker.tsx')
  const commandsSource = await readRepoFile('src\\commands.ts')
  const statusSource = await readRepoFile('src\\commands\\status\\index.ts')
  const statsSource = await readRepoFile('src\\commands\\stats\\index.ts')

  assert.doesNotMatch(oauthSource, /Claude Code login successful/)
  assert.doesNotMatch(oauthSource, /Anthropic Console account/)
  assert.doesNotMatch(oauthSource, /Claude account with subscription/)
  assert.match(oauthSource, /Astroncode login successful/)
  assert.match(oauthSource, /Astron Console account/)
  assert.match(oauthSource, /Local provider plan/)

  assert.doesNotMatch(pickerSource, /Switch between Claude models/)
  assert.match(pickerSource, /Switch between Astron models/)

  assert.doesNotMatch(commandsSource, /Claude Code sessions/)
  assert.match(commandsSource, /Astroncode sessions/)

  assert.doesNotMatch(statusSource, /Show Claude Code status/)
  assert.match(statusSource, /Show Astroncode status/)

  assert.doesNotMatch(statsSource, /Show your Claude Code usage statistics/)
  assert.match(statsSource, /Show your Astroncode usage statistics/)
})

test('high-visibility install and session surfaces avoid Claude branding', async () => {
  const installSource = await readRepoFile('src\\commands\\install.tsx')
  const thinkbackIndexSource = await readRepoFile(
    'src\\commands\\thinkback\\index.ts',
  )
  const thinkbackSource = await readRepoFile(
    'src\\commands\\thinkback\\thinkback.tsx',
  )
  const resumeSource = await readRepoFile('src\\components\\ResumeTask.tsx')
  const statsComponentSource = await readRepoFile('src\\components\\Stats.tsx')

  assert.doesNotMatch(installSource, /Claude Code successfully installed!/)
  assert.match(installSource, /Astroncode successfully installed!/)

  assert.doesNotMatch(thinkbackIndexSource, /Claude Code Year in Review/)
  assert.match(thinkbackIndexSource, /Astroncode Year in Review/)
  assert.doesNotMatch(thinkbackSource, /Think Back on 2025 with Claude Code/)
  assert.match(thinkbackSource, /Think Back on 2025 with Astroncode/)

  assert.doesNotMatch(resumeSource, /Claude Code sessions/)
  assert.match(resumeSource, /Astroncode sessions/)
  assert.doesNotMatch(resumeSource, /Claude Code encountered an error/)
  assert.match(resumeSource, /Astroncode encountered an error/)

  assert.doesNotMatch(statsComponentSource, /Start using Claude Code!/)
  assert.match(statsComponentSource, /Start using Astroncode!/)
})

test('high-visibility dialogs and permission prompts avoid Claude branding', async () => {
  const bypassSource = await readRepoFile(
    'src\\components\\BypassPermissionsModeDialog.tsx',
  )
  const onboardingSource = await readRepoFile(
    'src\\components\\IdeOnboardingDialog.tsx',
  )
  const helpSource = await readRepoFile('src\\components\\HelpV2\\HelpV2.tsx')
  const permissionSource = await readRepoFile(
    'src\\components\\permissions\\PermissionRequest.tsx',
  )
  const upsellSource = await readRepoFile(
    'src\\components\\DesktopUpsell\\DesktopUpsellStartup.tsx',
  )

  assert.doesNotMatch(bypassSource, /Claude Code running in Bypass Permissions mode/)
  assert.doesNotMatch(bypassSource, /code\.claude\.com/)
  assert.match(bypassSource, /Astroncode running in Bypass Permissions mode/)
  assert.match(bypassSource, /docs\.astroncode\.dev\/security/)

  assert.doesNotMatch(onboardingSource, /Welcome to Claude Code for/)
  assert.doesNotMatch(onboardingSource, /Review Claude Code's changes/)
  assert.match(onboardingSource, /Welcome to Astroncode for/)
  assert.match(onboardingSource, /Review Astroncode's changes/)

  assert.doesNotMatch(helpSource, /Claude Code v\$\{MACRO\.VERSION\}/)
  assert.doesNotMatch(helpSource, /code\.claude\.com\/docs\/en\/overview/)
  assert.match(helpSource, /Astroncode v\$\{MACRO\.VERSION\}/)
  assert.match(helpSource, /docs\.astroncode\.dev\/overview/)

  assert.doesNotMatch(permissionSource, /Claude Code needs your approval/)
  assert.doesNotMatch(permissionSource, /Claude needs your permission/)
  assert.match(permissionSource, /Astroncode needs your approval/)
  assert.match(permissionSource, /Astroncode needs your permission/)

  assert.doesNotMatch(upsellSource, /Claude Code Desktop/)
  assert.match(upsellSource, /Astroncode Desktop/)
})

test('secondary onboarding, survey, and web-flow copy uses Astron branding', async () => {
  const agentConfirmSource = await readRepoFile(
    'src\\components\\agents\\new-agent-creation\\wizard-steps\\ConfirmStep.tsx',
  )
  const agentDescriptionSource = await readRepoFile(
    'src\\components\\agents\\new-agent-creation\\wizard-steps\\DescriptionStep.tsx',
  )
  const agentMethodSource = await readRepoFile(
    'src\\components\\agents\\new-agent-creation\\wizard-steps\\MethodStep.tsx',
  )
  const agentLocationSource = await readRepoFile(
    'src\\components\\agents\\new-agent-creation\\wizard-steps\\LocationStep.tsx',
  )
  const agentMemorySource = await readRepoFile(
    'src\\components\\agents\\new-agent-creation\\wizard-steps\\MemoryStep.tsx',
  )
  const agentDetailSource = await readRepoFile(
    'src\\components\\agents\\AgentDetail.tsx',
  )
  const agentsListSource = await readRepoFile(
    'src\\components\\agents\\AgentsList.tsx',
  )
  const helpGeneralSource = await readRepoFile(
    'src\\components\\HelpV2\\General.tsx',
  )
  const hooksMenuSource = await readRepoFile(
    'src\\components\\hooks\\HooksConfigMenu.tsx',
  )
  const hooksEventSource = await readRepoFile(
    'src\\components\\hooks\\SelectEventMode.tsx',
  )
  const hooksSelectSource = await readRepoFile(
    'src\\components\\hooks\\SelectHookMode.tsx',
  )
  const hooksMatcherSource = await readRepoFile(
    'src\\components\\hooks\\SelectMatcherMode.tsx',
  )
  const hooksViewSource = await readRepoFile(
    'src\\components\\hooks\\ViewHookMode.tsx',
  )
  const managedSecuritySource = await readRepoFile(
    'src\\components\\ManagedSettingsSecurityDialog\\ManagedSettingsSecurityDialog.tsx',
  )
  const elicitationSource = await readRepoFile(
    'src\\components\\mcp\\ElicitationDialog.tsx',
  )
  const feedbackSource = await readRepoFile(
    'src\\components\\FeedbackSurvey\\FeedbackSurveyView.tsx',
  )
  const transcriptShareSource = await readRepoFile(
    'src\\components\\FeedbackSurvey\\TranscriptSharePrompt.tsx',
  )
  const groveSource = await readRepoFile('src\\components\\grove\\Grove.tsx')
  const reviewSource = await readRepoFile('src\\commands\\review.ts')
  const statuslineSource = await readRepoFile('src\\commands\\statusline.tsx')
  const ultraplanSource = await readRepoFile('src\\commands\\ultraplan.tsx')

  assert.doesNotMatch(agentConfirmSource, /tells Claude when to use/)
  assert.doesNotMatch(agentDescriptionSource, /When should Claude use this agent\?/)
  assert.doesNotMatch(agentMethodSource, /Generate with Claude/)
  assert.doesNotMatch(agentLocationSource, /\.claude\/agents/)
  assert.doesNotMatch(agentMemorySource, /\.claude\/agent-memory/)
  assert.doesNotMatch(agentDetailSource, /tells Claude when to use/)
  assert.doesNotMatch(agentsListSource, /Claude can delegate to/)
  assert.match(agentConfirmSource, /tells Astroncode when to use/)
  assert.match(agentDescriptionSource, /When should Astroncode use this agent\?/)
  assert.match(agentMethodSource, /Generate with Astroncode/)
  assert.match(agentLocationSource, /Project workspace agents/)
  assert.match(agentLocationSource, /Personal agent library/)
  assert.match(agentMemorySource, /User scope memory/)
  assert.match(agentMemorySource, /Project scope memory/)
  assert.match(agentDetailSource, /tells Astroncode when to use/)
  assert.match(agentsListSource, /Astroncode can delegate to/)

  assert.doesNotMatch(helpGeneralSource, /Claude understands your codebase/)
  assert.match(helpGeneralSource, /Astroncode understands your codebase/)

  assert.doesNotMatch(hooksMenuSource, /ask Claude/)
  assert.doesNotMatch(hooksEventSource, /code\.claude\.com\/docs\/en\/hooks/)
  assert.doesNotMatch(hooksEventSource, /\.claude\/settings/)
  assert.doesNotMatch(hooksSelectSource, /ask Claude/)
  assert.doesNotMatch(hooksMatcherSource, /ask Claude/)
  assert.doesNotMatch(hooksViewSource, /ask Claude/)
  assert.match(hooksMenuSource, /ask Astroncode/)
  assert.match(hooksEventSource, /docs\.astroncode\.dev\/hooks/)
  assert.match(hooksEventSource, /personal, project, and local settings files/)
  assert.match(hooksSelectSource, /ask Astroncode/)
  assert.match(hooksMatcherSource, /ask Astroncode/)
  assert.match(hooksViewSource, /ask Astroncode/)

  assert.doesNotMatch(managedSecuritySource, /exit Claude Code/)
  assert.match(managedSecuritySource, /exit Astroncode/)

  assert.doesNotMatch(elicitationSource, /Claude Code needs your input/)
  assert.match(elicitationSource, /Astroncode needs your input/)

  assert.doesNotMatch(feedbackSource, /How is Claude doing this session/)
  assert.doesNotMatch(transcriptShareSource, /Anthropic look at your session transcript/)
  assert.doesNotMatch(transcriptShareSource, /code\.claude\.com\/docs\/en\/data-usage/)
  assert.match(feedbackSource, /How is Astroncode doing this session/)
  assert.match(transcriptShareSource, /Can Astron review your session transcript/)
  assert.match(transcriptShareSource, /docs\.astroncode\.dev\/data-usage/)

  assert.doesNotMatch(groveSource, /Help improve Claude/)
  assert.doesNotMatch(groveSource, /Anthropic AI models/)
  assert.doesNotMatch(groveSource, /claude\.ai\/settings\/data-privacy-controls/)
  assert.match(groveSource, /Help improve Astroncode/)
  assert.match(groveSource, /Astron models/)
  assert.match(groveSource, /astroncode\.ai\/settings\/data-privacy-controls/)

  assert.doesNotMatch(reviewSource, /Claude Code on the web/)
  assert.doesNotMatch(statuslineSource, /Claude Code's status line UI/)
  assert.doesNotMatch(ultraplanSource, /Claude Code on the web/)
  assert.doesNotMatch(ultraplanSource, /code\.claude\.com\/docs\/en\/claude-code-on-the-web/)
  assert.match(reviewSource, /Astroncode on the web/)
  assert.match(statuslineSource, /Astroncode's status line UI/)
  assert.match(ultraplanSource, /Astroncode on the web/)
  assert.match(ultraplanSource, /docs\.astroncode\.dev\/astroncode-on-the-web/)
})

test('startup wordmark source uses the large Astroncode banner without legacy subtitle copy', async () => {
  const welcomeSource = await readRepoFile('src\\components\\LogoV2\\WelcomeV2.tsx')
  const logoSource = await readRepoFile('src\\utils\\logoV2Utils.ts')

  assert.doesNotMatch(welcomeSource, /neon command deck/i)
  assert.match(welcomeSource, /╔═╗╔═╗╔╦╗╦═╗╔═╗╔╗╔/)
  assert.match(welcomeSource, /╔═╗╔═╗╔╦╗╔═╗/)
  assert.match(logoSource, /const MAX_LEFT_WIDTH = 62/)
  assert.match(logoSource, /return ''/)
})
