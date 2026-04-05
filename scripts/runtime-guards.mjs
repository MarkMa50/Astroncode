import { ASTRONCODE_NAME } from './astron-meta.mjs'

function buildUnsupportedMessage(feature, detail) {
  return [
    `[${ASTRONCODE_NAME}] ${feature} is disabled in this local ${ASTRONCODE_NAME} build.`,
    detail,
    'This deployment uses local provider credentials from `.env.astroncode` and does not bundle hosted bridge or browser services.',
  ].join('\n')
}

export function detectUnsupportedAstronInvocation(argv) {
  const args = argv.filter(Boolean)

  if (args.length === 0) {
    return null
  }

  if (args[0] === '-h' || args[0] === '--help' || args[0] === '-v' || args[0] === '--version') {
    return null
  }

  if (args.includes('-p') || args.includes('--print')) {
    if (args.includes('--chrome')) {
      return {
        exitCode: 2,
        message: buildUnsupportedMessage(
          'Chrome integration',
          'The current Chrome bridge depends on browser-host integration that is not included in this local build.',
        ),
      }
    }

    return null
  }

  if (args.includes('--chrome')) {
    return {
      exitCode: 2,
      message: buildUnsupportedMessage(
        'Chrome integration',
        'The current Chrome bridge depends on browser-host integration that is not included in this local build.',
      ),
    }
  }

  if (['mobile', 'ios', 'android'].includes(args[0])) {
    return {
      exitCode: 2,
      message: buildUnsupportedMessage(
        'Mobile companion command',
        'The mobile companion flow has been removed from this local build. Use the desktop launcher or /desktop handoff instead.',
      ),
    }
  }

  return null
}
