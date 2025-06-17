@echo off
echo ======================================================
echo IQTS ChatBot Services - Windows Task Scheduler Setup
echo ======================================================
echo.

REM Get the current directory where the script is located
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_PATH=%SCRIPT_DIR%start_all_services.bat"

echo Creating Windows Scheduled Task to automatically start IQTS ChatBot services at login...

REM Create the task using schtasks command
schtasks /create /tn "IQTS ChatBot Services" /tr "\"%SCRIPT_PATH%\"" /sc onlogon /ru "%USERNAME%" /rl highest /f

if %errorlevel% equ 0 (
    echo.
    echo Task created successfully!
    echo IQTS ChatBot services will now start automatically when you log in to Windows.
) else (
    echo.
    echo Failed to create the task. You might need to run this script as administrator.
)

echo.
echo ======================================================
echo Press any key to exit
echo ======================================================
pause > nul
