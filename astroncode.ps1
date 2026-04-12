$ErrorActionPreference = 'Stop'

# Set console code page to UTF-8 (65001) for proper Chinese/Unicode input
try {
    $originalCP = [Console]::OutputEncoding.CodePage
    chcp 65001 > $null
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    [Console]::InputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

# Set environment variables for UTF-8
$env:LANG = 'en_US.UTF-8'
$env:PYTHONIOENCODING = 'utf-8'
$env:NODE_OPTIONS = '--no-warnings'

# Enable Windows console VT mode for better input handling
try {
    $mode = (Get-ItemProperty 'HKCU:\Console').VirtualTerminalLevel
    if ($null -eq $mode -or $mode -lt 1) {
        Set-ItemProperty 'HKCU:\Console' VirtualTerminalLevel 1 -ErrorAction SilentlyContinue
    }
} catch {}

# Run directly with Node.js (bypass cmd.exe for better Unicode/IME support)
& node "$PSScriptRoot\scripts\start.mjs" @args
exit $LASTEXITCODE
