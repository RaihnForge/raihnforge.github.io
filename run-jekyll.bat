@echo off
cd /d "%~dp0"

REM Stop any running Jekyll container on port 4000
for /f "tokens=1" %%i in ('docker ps -q --filter "publish=4000"') do docker stop %%i

REM Run Jekyll in Docker with correct path
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "docker run --rm -v \"$(Get-Location):/srv/jekyll\" -p 4000:4000 jekyll/jekyll:4 sh -c 'gem install webrick && jekyll serve --host 0.0.0.0'"

pause
