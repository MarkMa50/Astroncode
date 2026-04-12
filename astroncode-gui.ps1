$ErrorActionPreference = 'Stop'

$nodeCommand = Get-Command node -ErrorAction Stop
$nodePath = $nodeCommand.Source
$projectRoot = $PSScriptRoot
$startScript = Join-Path $projectRoot 'scripts\start.mjs'
$port = 46321
$url = "http://127.0.0.1:$port"

function Test-AstronGuiReady {
    param([string]$TargetUrl)

    try {
        $response = Invoke-WebRequest -Uri "$TargetUrl/api/status" -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

if (Test-AstronGuiReady -TargetUrl $url) {
    Start-Process $url
    exit 0
}

Start-Process -FilePath $nodePath `
  -ArgumentList @($startScript, 'gui', '--port', $port, '--no-browser') `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden | Out-Null

for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 500
    if (Test-AstronGuiReady -TargetUrl $url) {
        Start-Process $url
        exit 0
    }
}

[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
[System.Windows.Forms.MessageBox]::Show(
    "Astroncode GUI did not start successfully. Please verify Node and your local config, then try again.",
    "Astroncode GUI",
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Warning
) | Out-Null
