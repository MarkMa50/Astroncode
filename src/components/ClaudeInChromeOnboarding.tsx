import React from 'react'
import { logEvent } from 'src/services/analytics/index.js'
// eslint-disable-next-line custom-rules/prefer-use-keybindings -- enter to continue
import { Box, Link, Newline, Text, useInput } from '../ink.js'
import { isChromeExtensionInstalled } from '../utils/claudeInChrome/setup.js'
import { saveGlobalConfig } from '../utils/config.js'
import { Dialog } from './design-system/Dialog.js'

const CHROME_EXTENSION_URL = 'https://astron.dev/chrome'
const CHROME_PERMISSIONS_URL = 'https://astron.dev/chrome/permissions'

type Props = {
  onDone(): void
}

export function ClaudeInChromeOnboarding({
  onDone,
}: Props): React.ReactNode {
  const [isExtensionInstalled, setIsExtensionInstalled] = React.useState(false)

  React.useEffect(() => {
    logEvent('tengu_claude_in_chrome_onboarding_shown', {})
    void isChromeExtensionInstalled().then(setIsExtensionInstalled)
    saveGlobalConfig(current => {
      return { ...current, hasCompletedClaudeInChromeOnboarding: true }
    })
  }, [])

  useInput((_input, key) => {
    if (key.return) {
      onDone()
    }
  })

  return (
    <Dialog
      title="Atroncode Browser Control (Beta)"
      onCancel={onDone}
      color="chromeYellow"
    >
      <Box flexDirection="column" gap={1}>
        <Text>
          Atroncode Browser Control works with the Chrome extension to let you
          control your browser directly from Atroncode. You can navigate
          websites, fill forms, capture screenshots, record GIFs, and inspect
          pages with console logs and network requests.
          {!isExtensionInstalled && (
            <>
              <Newline />
              <Newline />
              Requires the Chrome extension. Get started at{' '}
              <Link url={CHROME_EXTENSION_URL} />
            </>
          )}
        </Text>

        <Text dimColor>
          Site-level permissions are inherited from the Chrome extension.
          Manage permissions in the Chrome extension settings to control which
          sites Atroncode can browse, click, and type on
          {isExtensionInstalled && (
            <>
              {' '}
              (<Link url={CHROME_PERMISSIONS_URL} />)
            </>
          )}
          .
        </Text>

        <Text dimColor>
          For more info, use{' '}
          <Text bold color="chromeYellow">
            /chrome
          </Text>{' '}
          or review the local browser-control guidance in this build.
        </Text>
      </Box>
    </Dialog>
  )
}
