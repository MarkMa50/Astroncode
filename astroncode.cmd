@echo off
setlocal

REM Set UTF-8 code page for Chinese input
chcp 65001 >nul 2>&1

REM Set environment variables for UTF-8
set LANG=en_US.UTF-8
set PYTHONIOENCODING=utf-8
set NODE_OPTIONS=--no-warnings

REM Run with Node.js
node "%~dp0scripts\start.mjs" %*
