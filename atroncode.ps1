$ErrorActionPreference = 'Stop'

function Quote-CmdArg([string]$arg) {
  if ($arg -notmatch '[\s"]') {
    return $arg
  }

  return '"' + ($arg -replace '(["^])', '^$1') + '"'
}

$cmdPath = Join-Path $PSScriptRoot 'atroncode.cmd'
$quotedArgs = @($args | ForEach-Object { Quote-CmdArg $_ })
$commandLine = '"' + $cmdPath + '"'

if ($quotedArgs.Count -gt 0) {
  $commandLine += ' ' + ($quotedArgs -join ' ')
}

& cmd /d /s /c $commandLine
exit $LASTEXITCODE
