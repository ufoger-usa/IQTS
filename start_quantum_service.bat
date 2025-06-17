@echo off
echo ======================================================
echo Starting Quantum Optimizer Service (Port 9000)
echo ======================================================
echo.

REM Set window title
title Quantum Optimizer Service

REM Create logs directory if it doesn't exist
if not exist "logs\" mkdir logs

REM Start the service
python quantum_optimizer.py > logs\quantum_optimizer.log 2>&1

echo Quantum Optimizer Service stopped.
pause
