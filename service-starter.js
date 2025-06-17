// service-starter.js - Simple API server for starting and stopping Python services
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Use cors package for proper CORS handling
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors());

// Map of service keys to script filenames and ports
const serviceMap = {
    aiAnalysis: {
        script: 'analysis_service.py',
        port: 8000
    },
    rlTuning: {
        script: 'rl_tuning.py',
        port: 6001  // Changed from 6000 (browser unsafe port) to 6001
    },
    strategyEvolution: {
        script: 'genetic_algorithm.py',
        port: 7000
    }
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Track running processes
const runningProcesses = {};

// Get PID of process running on a specific port (Windows-specific)
async function getProcessIdOnPort(port) {
    return new Promise((resolve, reject) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`No process found on port ${port}`);
                resolve(null);
                return;
            }
            
            const lines = stdout.trim().split('\n');
            if (lines.length > 0) {
                // Extract PID from the first line (last column)
                const match = lines[0].trim().match(/\s+(\d+)$/);
                if (match && match[1]) {
                    resolve(match[1]);
                    return;
                }
            }
            
            resolve(null);
        });
    });
}

// Kill process by PID (Windows-specific)
async function killProcessById(pid) {
    return new Promise((resolve, reject) => {
        if (!pid) {
            resolve(false);
            return;
        }
        
        exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error killing process ${pid}:`, error);
                resolve(false);
                return;
            }
            
            console.log(`Successfully killed process ${pid}`);
            resolve(true);
        });
    });
}

// Start a service
app.post('/start-service', async (req, res) => {
    const { service } = req.body;
    
    if (!service || !serviceMap[service]) {
        return res.status(400).json({ error: 'Invalid service' });
    }
    
    const serviceConfig = serviceMap[service];
    const scriptName = serviceConfig.script;
    const port = serviceConfig.port;
    const logFile = path.join(logsDir, `${service}.log`);
    
    console.log(`Starting ${service} service (${scriptName}) on port ${port}...`);
    
    try {
        // First, make sure any existing process on the same port is killed
        const existingPid = await getProcessIdOnPort(port);
        if (existingPid) {
            console.log(`Found existing process ${existingPid} on port ${port}, killing it...`);
            await killProcessById(existingPid);
        }
        
        // Standard command for starting a Python script in the background
        const command = `start /B python ${scriptName} > "${logFile}" 2>&1`;
        
        // Execute the command
        const childProcess = exec(command);
        
        // Store the process reference
        runningProcesses[service] = childProcess;
        
        // Give the service a moment to start up
        setTimeout(() => {
            res.json({ success: true, message: `${service} started successfully` });
        }, 1000);
    } catch (error) {
        console.error(`Error starting ${service}:`, error);
        res.status(500).json({ error: `Failed to start ${service}: ${error.message}` });
    }
});

// Stop a service
app.post('/stop-service', async (req, res) => {
    const { service } = req.body;
    
    if (!service || !serviceMap[service]) {
        return res.status(400).json({ error: 'Invalid service' });
    }
    
    const serviceConfig = serviceMap[service];
    const port = serviceConfig.port;
    
    console.log(`Stopping ${service} service on port ${port}...`);
    
    try {
        // Try to kill by port
        const pid = await getProcessIdOnPort(port);
        if (pid) {
            const killed = await killProcessById(pid);
            if (killed) {
                // Clean up any stored process reference
                delete runningProcesses[service];
                return res.json({ success: true, message: `${service} stopped successfully` });
            }
        }
        
        res.status(404).json({ error: `${service} is not running or could not be stopped` });
    } catch (error) {
        console.error(`Error stopping ${service}:`, error);
        res.status(500).json({ error: `Failed to stop ${service}: ${error.message}` });
    }
});

// Get service status
app.get('/services-status', (req, res) => {
    const status = {};
    
    // Implement status checking if needed
    // ...
    
    res.json(status);
});

// Root endpoint to serve the frontend
app.get('/', (req, res) => {
    // Check if it's an API request by examining Accept header
    const acceptHeader = req.headers.accept || '';
    
    if (acceptHeader.includes('application/json')) {
        // If client is requesting JSON, return service status
        return res.json({
            status: 'running',
            service: 'Service Manager',
            endpoints: [
                '/start-service',
                '/stop-service',
                '/services-status'
            ],
            services: Object.keys(serviceMap).map(key => ({
                name: key,
                port: serviceMap[key].port,
                script: serviceMap[key].script
            }))
        });
    }
    
    // Otherwise serve the HTML file
    res.sendFile(path.join(__dirname, 'VC_IQTSChatBot.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Service Manager server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down service manager...');
    
    // Kill all child processes
    for (const [service, proc] of Object.entries(runningProcesses)) {
        try {
            console.log(`Stopping ${service}...`);
            process.kill(proc.pid);
        } catch (e) {
            console.error(`Error stopping ${service}:`, e);
        }
    }
    
    process.exit(0);
});
