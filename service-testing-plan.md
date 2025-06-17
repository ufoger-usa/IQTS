# Service Connection Testing Plan

## 1. Setup and Testing Process

### Start the Service Manager
1. Kill any existing node process on port 3000:
   ```
   netstat -ano | findstr :3000
   taskkill /F /PID <PID>
   ```

2. Start the service manager:
   ```
   node service-starter.js
   ```

3. Verify the service manager is running by visiting:
   - http://localhost:3000/

### Test Basic Connectivity
1. Open the test-service-connection.html file in your browser
2. Click "Test Service Starter (Port 3000)"
3. You should see a success message

### Test Individual Services

#### AI Analysis Service (Port 8000)
1. In the terminal, run:
   ```
   python analysis_service.py
   ```
2. Click "Test AI Analysis (Port 8000)" in the test tool
3. You should see a success message

#### RL Tuning Service (Port 6001)
1. In the terminal, run:
   ```
   python rl_tuning.py
   ```
2. Click "Test RL Tuning (Port 6001)" in the test tool
3. You should see a success message

#### Strategy Evolution Service (Port 7000)
1. In the terminal, run:
   ```
   python genetic_algorithm.py
   ```
2. Click "Test Strategy Evolution (Port 7000)" in the test tool
3. You should see a success message

## 2. Test the Main Application

1. Visit http://localhost:3000/ to access the application
2. Click "Start All Services" button
3. Verify that all services show as "Running" in the UI
4. Try stopping individual services
5. Try stopping all services

## 3. Troubleshooting

### If services won't start:
1. Check the service logs in the logs directory
2. Ensure you have all required Python packages installed
3. Check that ports 6001, 7000, and 8000 are not already in use

### If CORS errors persist:
1. Make sure you're accessing the app via http://localhost:3000/
2. Check browser console for specific error messages
3. Ensure service-starter.js is running with the latest CORS configuration

### If services show as running but features don't work:
1. Check browser console for API connection errors
2. Verify that each service's API endpoints are working via the test tool
3. Check individual service logs for errors

## 4. Service URLs for Reference

- Service Manager: http://localhost:3000/
- AI Analysis Service: http://localhost:8000/
- RL Tuning Service: http://localhost:6001/
- Strategy Evolution Service: http://localhost:7000/
