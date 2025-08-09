@echo off
cd /d "%~dp0"

REM Stop any running Jekyll container on port 4000 (optional cleanup)
for /f "tokens=1" %%i in ('docker ps -q --filter "publish=4000"') do docker stop %%i

REM Run docker compose
docker compose up

pause
