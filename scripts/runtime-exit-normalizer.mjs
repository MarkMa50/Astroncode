export const KNOWN_WINDOWS_LIBUV_ASSERTION =
  'Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\\win\\async.c, line 76'

export function isPrintInvocation(argv) {
  return argv.includes('-p') || argv.includes('--print')
}

export function normalizeWindowsPrintRuntimeResult({
  exitCode,
  stderr,
}) {
  const originalExitCode = exitCode ?? 0
  const normalizedStderr = String(stderr ?? '').replace(/\r\n/g, '\n')
  const lines = normalizedStderr
    .split('\n')
    .filter(line => line.length > 0)
  const filteredLines = lines.filter(
    line => line.trim() !== KNOWN_WINDOWS_LIBUV_ASSERTION,
  )
  const matchedKnownAssertion = filteredLines.length !== lines.length
  const filteredStderr =
    filteredLines.length > 0 ? `${filteredLines.join('\n')}\n` : ''

  return {
    exitCode:
      originalExitCode === 1 &&
      matchedKnownAssertion &&
      filteredStderr.length === 0
        ? 0
        : originalExitCode,
    stderr: filteredStderr,
    suppressedKnownAssertion:
      matchedKnownAssertion && filteredStderr.length === 0,
  }
}
