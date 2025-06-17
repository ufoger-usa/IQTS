@echo off
echo ======================================================
echo IQTS ChatBot Services Startup
echo ======================================================
echo.

REM Set window title
title IQTS ChatBot Services

echo Starting all IQTS ChatBot services...
echo.

REM Create directories for logs if they don't exist
if not exist "logs\" mkdir logs

echo [1/4] Starting AI Analysis Service (Port 8000)...
start "AI Analysis Service" cmd /c "python analysis_service.py > logs\analysis_service.log 2>&1"
echo.

echo [2/4] Starting RL Tuning Service (Port 6000)...
start "RL Tuning Service" cmd /c "python rl_tuning.py > logs\rl_tuning.log 2>&1"
echo.

echo [3/4] Starting Strategy Evolution Service (Port 7000)...
start "Strategy Evolution Service" cmd /c "python genetic_algorithm.py > logs\genetic_algorithm.log 2>&1"
echo.

echo [4/4] Starting Quantum Optimizer Service (Port 9000)...
start "Quantum Optimizer Service" cmd /c "python quantum_optimizer.py > logs\quantum_optimizer.log 2>&1"
echo.

echo All services started successfully!
echo.
echo Services running:
echo - AI Analysis Service: http://localhost:8000
echo - RL Tuning Service: http://localhost:6000
echo - Strategy Evolution Service: http://localhost:7000
echo - Quantum Optimizer Service: http://localhost:9000
echo.
echo Log files are stored in the logs directory.
echo.
echo ======================================================
echo Press any key to exit (services will continue running)
echo ======================================================
pause > nul
