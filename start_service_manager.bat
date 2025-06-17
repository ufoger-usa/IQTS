@echo off
echo ======================================================
echo IQTS ChatBot Service Manager
echo ======================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is required but not found.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b
)

REM Check if Express is installed
cd /d "%~dp0"
if not exist "node_modules\express" (
    echo Installing required Node.js packages...
    call npm install express
)

echo Starting Service Manager on port 3000...
echo.
echo This will allow you to start/stop services from the web interface.
echo.
echo Access the dashboard at: http://localhost/VC_IQTSChatBot.html
echo.
echo Press Ctrl+C to stop the service manager
echo.
node service-starter.js
