$ErrorActionPreference = 'Stop'

# Set console to UTF-8 for proper Chinese/Unicode input support
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Run directly with Node.js (bypass cmd.exe for better Unicode/IME support)
& node "$PSScriptRoot\scripts\start.mjs" @args
exit $LASTEXITCODE
