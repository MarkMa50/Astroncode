@echo off
setlocal
REM Use PowerShell for better Unicode/Chinese input support
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0atroncode.ps1" %*
