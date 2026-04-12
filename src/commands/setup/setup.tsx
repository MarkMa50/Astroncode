import React, { useCallback, useState } from 'react'
import { Box, Newline, Text } from '../../ink.js'
import { logEvent } from '../../services/analytics/index.js'
import { setupTerminal, shouldOfferTerminalSetup } from '../terminalSetup/terminalSetup.js'
import { useExitOnCtrlCDWithKeybindings } from '../../hooks/useExitOnCtrlCDWithKeybindings.js'
import { Select } from '../../components/CustomSelect/select.js'
import { ThemePicker } from '../../components/ThemePicker.js'
import { useKeybindings } from '../../keybindings/useKeybinding.js'
import type { ThemeSetting } from '../../utils/theme.js'
import { useTheme } from '../../ink.js'

type SetupStep = 'welcome' | 'model' | 'theme' | 'terminal' | 'done'

interface Props {
  onDone: () => void
}

/**
 * Quick setup wizard for configuring Astroncode
 */
export function SetupWizard({ onDone }: Props): React.ReactNode {
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome')
  const [theme, setTheme] = useTheme()
  const exitState = useExitOnCtrlCDWithKeybindings()

  const goToNextStep = useCallback(() => {
    setCurrentStep(prev => {
      switch (prev) {
        case 'welcome':
          return 'model'
        case 'model':
          return 'theme'
        case 'theme':
          return shouldOfferTerminalSetup() ? 'terminal' : 'done'
        case 'terminal':
          return 'done'
        default:
          return 'done'
      }
    })
  }, [])

  const handleDone = useCallback(() => {
    logEvent('astroncode_setup_complete', {})
    onDone()
  }, [onDone])

  // Welcome step
  if (currentStep === 'welcome') {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold color="cyan">
          Welcome to Astroncode Setup
        </Text>
        <Newline />
        <Text>
          This wizard will help you configure Astroncode for optimal use.
        </Text>
        <Text dimColor>
          You can run this setup anytime with the /setup command.
        </Text>
        <Newline />
        <Select
          options={[
            { label: 'Start setup', value: 'start' },
            { label: 'Skip (use defaults)', value: 'skip' },
          ]}
          onChange={value => {
            if (value === 'start') {
              logEvent('astroncode_setup_started', {})
              goToNextStep()
            } else {
              handleDone()
            }
          }}
          onCancel={handleDone}
        />
        {exitState.pending && (
          <Text dimColor>Press {exitState.keyName} again to exit</Text>
        )}
      </Box>
    )
  }

  // Model configuration step
  if (currentStep === 'model') {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold>Model Configuration</Text>
        <Newline />
        <Text>
          To configure your model service provider, you can:
        </Text>
        <Box flexDirection="column" marginLeft={2} marginY={1}>
          <Text dimColor>1. Use /model to select a model</Text>
          <Text dimColor>2. Set ANTHROPIC_API_KEY environment variable</Text>
          <Text dimColor>3. Use /login for Astron authentication</Text>
        </Box>
        <Newline />
        <Text dimColor>
          For custom providers (Bedrock, Vertex, etc.), set the appropriate
          environment variables.
        </Text>
        <Newline />
        <Select
          options={[
            { label: 'Configure model now (/model)', value: 'model' },
            { label: 'Continue to next step', value: 'next' },
          ]}
          onChange={value => {
            if (value === 'model') {
              // Import and run model command
              import('../model/model.js').then(module => {
                // The model picker will be shown via the command
              })
            }
            goToNextStep()
          }}
          onCancel={goToNextStep}
        />
      </Box>
    )
  }

  // Theme configuration step
  if (currentStep === 'theme') {
    return (
      <Box marginX={1}>
        <ThemePicker
          onThemeSelect={(newTheme: ThemeSetting) => {
            setTheme(newTheme)
            goToNextStep()
          }}
          showIntroText={false}
          helpText="You can change this later with /theme"
          hideEscToCancel={true}
          skipExitHandling={true}
        />
      </Box>
    )
  }

  // Terminal setup step
  if (currentStep === 'terminal') {
    return (
      <Box flexDirection="column" gap={1} paddingLeft={1}>
        <Text bold>Terminal Setup</Text>
        <Box flexDirection="column" width={70} gap={1}>
          <Text>
            For the optimal coding experience, enable the recommended settings
            for your terminal: Shift+Enter for newlines
          </Text>
          <Select
            options={[
              { label: 'Yes, use recommended settings', value: 'install' },
              { label: 'No, maybe later with /terminal-setup', value: 'no' },
            ]}
            onChange={value => {
              if (value === 'install') {
                void setupTerminal(theme)
                  .catch(() => {})
                  .finally(goToNextStep)
              } else {
                goToNextStep()
              }
            }}
            onCancel={goToNextStep}
          />
          {exitState.pending && (
            <Text dimColor>Press {exitState.keyName} again to exit</Text>
          )}
        </Box>
      </Box>
    )
  }

  // Done step
  if (currentStep === 'done') {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold color="green">
          Setup Complete!
        </Text>
        <Newline />
        <Text>Astroncode is now configured and ready to use.</Text>
        <Newline />
        <Text dimColor>Useful commands:</Text>
        <Box flexDirection="column" marginLeft={2}>
          <Text dimColor>/help - Show all available commands</Text>
          <Text dimColor>/model - Change AI model</Text>
          <Text dimColor>/theme - Change color theme</Text>
          <Text dimColor>/setup - Run this wizard again</Text>
        </Box>
        <Newline />
        <Select
          options={[{ label: 'Start using Astroncode', value: 'done' }]}
          onChange={handleDone}
          onCancel={handleDone}
        />
      </Box>
    )
  }

  return null
}

export default SetupWizard
