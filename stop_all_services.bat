@echo off
echo ======================================================
echo IQTS ChatBot Services - Stop All Services
echo ======================================================
echo.

echo Stopping all IQTS ChatBot services...
echo.

echo [1/4] Stopping AI Analysis Service...
taskkill /fi "WINDOWTITLE eq AI Analysis Service*" /f
echo.

echo [2/4] Stopping RL Tuning Service...
taskkill /fi "WINDOWTITLE eq RL Tuning Service*" /f
echo.

echo [3/4] Stopping Strategy Evolution Service...
taskkill /fi "WINDOWTITLE eq Strategy Evolution Service*" /f
echo.

echo [4/4] Stopping Quantum Optimizer Service...
taskkill /fi "WINDOWTITLE eq Quantum Optimizer Service*" /f
echo.

echo All services have been stopped.
echo.
echo ======================================================
echo Press any key to exit
echo ======================================================
pause > nul
