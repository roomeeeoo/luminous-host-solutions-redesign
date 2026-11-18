@echo off
cd /d "%~dp0"
start "" http://localhost:4321
node tools\serve.mjs
pause
