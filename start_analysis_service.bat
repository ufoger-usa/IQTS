@echo off
ECHO Starting AI Analysis Python Service...
ECHO Make sure Python and required libraries are installed:
ECHO pip install flask flask-cors pandas scikit-learn

cd /d %~dp0
python analysis_service.py

ECHO If the service fails to start:
ECHO 1. Make sure Python is in your PATH
ECHO 2. Install required libraries: pip install flask flask-cors pandas scikit-learn
ECHO 3. Ensure port 8000 is not in use

PAUSE
