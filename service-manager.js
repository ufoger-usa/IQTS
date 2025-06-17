// service-manager.js - Manages backend service lifecycle
class ServiceManager {
    constructor() {
        this.services = {
            aiAnalysis: {
                name: 'AI Analysis Service',
                port: 8000,
                status: 'unknown',
                process: null
            },            rlTuning: {
                name: 'RL Tuning Service',
                port: 6001, 
                status: 'unknown',
                process: null
            },
            strategyEvolution: {
                name: 'Strategy Evolution Service',
                port: 7000,
                status: 'unknown',
                process: null
            }
        };
        
        // Initialize status checking interval
        this.checkServicesStatus();
        setInterval(() => this.checkServicesStatus(), 30000); // Check every 30 seconds
    }

    // Check status of all services
    async checkServicesStatus() {
        for (const [key, service] of Object.entries(this.services)) {
            await this.checkServiceStatus(key);
        }
        this.updateStatusUI();
    }    // Check if a specific service is running
    async checkServiceStatus(serviceKey) {
        const service = this.services[serviceKey];
        try {
            // Try to fetch from the service with a short timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            // First try the root endpoint for health check
            let response = await fetch(`http://localhost:${service.port}/`, {
                method: 'GET',
                signal: controller.signal
            }).catch(error => {
                // Handle network errors or timeouts
                return { ok: false, status: 0 };
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                this.services[serviceKey].status = 'running';
                return;
            }
            
            // If root endpoint fails, try service-specific endpoints as fallback
            const endpoints = {
                'aiAnalysis': '/analyze',
                'rlTuning': '/tune',
                'strategyEvolution': '/best'
            };
            
            const fallbackEndpoint = endpoints[serviceKey];
            if (fallbackEndpoint) {
                try {
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => controller2.abort(), 2000);
                    
                    const fallbackResponse = await fetch(`http://localhost:${service.port}${fallbackEndpoint}`, {
                        method: serviceKey === 'strategyEvolution' ? 'GET' : 'OPTIONS', // Use OPTIONS for non-GET endpoints
                        signal: controller2.signal
                    }).catch(error => {
                        return { ok: false, status: 0 };
                    });
                    
                    clearTimeout(timeoutId2);
                    
                    if (fallbackResponse.status !== 0) {
                        this.services[serviceKey].status = 'running';
                        return;
                    }
                } catch (err) {
                    console.log(`Fallback check for ${service.name} failed:`, err);
                }
            }
            
            // If all checks fail, mark as stopped
            this.services[serviceKey].status = 'stopped';
        } catch (error) {
            console.log(`Error checking ${service.name} status:`, error);
            this.services[serviceKey].status = 'error';
        }
    }

    // Start a specific service
    async startService(serviceKey) {
        const service = this.services[serviceKey];
        
        try {
            // Update UI immediately to show attempting to start
            this.services[serviceKey].status = 'starting';
            this.updateServiceUI(serviceKey);
              // Send request to starter API - using absolute URL
            const response = await fetch('http://localhost:3000/start-service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    service: serviceKey
                })
            });
            
            if (response.ok) {
                // Give the service a moment to start
                setTimeout(async () => {
                    await this.checkServiceStatus(serviceKey);
                    this.updateServiceUI(serviceKey);
                }, 3000);
                return true;
            } else {
                this.services[serviceKey].status = 'error';
                this.updateServiceUI(serviceKey);
                console.error(`Failed to start ${service.name}`);
                return false;
            }
        } catch (error) {
            console.error(`Error starting ${service.name}:`, error);
            this.services[serviceKey].status = 'error';
            this.updateServiceUI(serviceKey);
            return false;
        }
    }

    // Stop a specific service
    async stopService(serviceKey) {
        const service = this.services[serviceKey];
        
        try {
            // Update UI immediately to show attempting to stop
            this.services[serviceKey].status = 'stopping';
            this.updateServiceUI(serviceKey);
            
            // Send request to starter API - using localhost:3000 instead of relative URL
            const response = await fetch('http://localhost:3000/stop-service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    service: serviceKey
                })
            });
            
            if (response.ok) {
                // Give the service a moment to stop
                setTimeout(async () => {
                    await this.checkServiceStatus(serviceKey);
                    this.updateServiceUI(serviceKey);
                }, 2000);
                return true;
            } else {
                this.services[serviceKey].status = 'error';
                this.updateServiceUI(serviceKey);
                console.error(`Failed to stop ${service.name}`);
                return false;
            }
        } catch (error) {
            console.error(`Error stopping ${service.name}:`, error);
            this.services[serviceKey].status = 'error';
            this.updateServiceUI(serviceKey);
            return false;
        }
    }

    // Start all services
    async startAllServices() {
        const startButtons = document.querySelectorAll('.service-start-btn');
        startButtons.forEach(button => button.disabled = true);
        
        for (const serviceKey of Object.keys(this.services)) {
            await this.startService(serviceKey);
        }
        
        startButtons.forEach(button => button.disabled = false);
    }

    // Stop all services
    async stopAllServices() {
        const stopButtons = document.querySelectorAll('.service-stop-btn');
        stopButtons.forEach(button => button.disabled = true);
        
        for (const serviceKey of Object.keys(this.services)) {
            await this.stopService(serviceKey);
        }
        
        stopButtons.forEach(button => button.disabled = false);
    }
    
    // Update the UI for all services
    updateStatusUI() {
        for (const serviceKey of Object.keys(this.services)) {
            this.updateServiceUI(serviceKey);
        }
    }
    
    // Update the UI for a specific service
    updateServiceUI(serviceKey) {
        const service = this.services[serviceKey];
        const statusElement = document.getElementById(`${serviceKey}-status`);
        const startButton = document.getElementById(`${serviceKey}-start`);
        const stopButton = document.getElementById(`${serviceKey}-stop`);
        
        if (!statusElement || !startButton || !stopButton) return;
        
        // Update status indicator
        statusElement.className = 'service-status';
        statusElement.classList.add(`status-${service.status}`);
        
        // Update status text
        let statusText = '';
        switch (service.status) {
            case 'running':
                statusText = 'Running';
                startButton.disabled = true;
                stopButton.disabled = false;
                break;
            case 'stopped':
                statusText = 'Stopped';
                startButton.disabled = false;
                stopButton.disabled = true;
                break;
            case 'starting':
                statusText = 'Starting...';
                startButton.disabled = true;
                stopButton.disabled = true;
                break;
            case 'stopping':
                statusText = 'Stopping...';
                startButton.disabled = true;
                stopButton.disabled = true;
                break;
            case 'error':
                statusText = 'Error';
                startButton.disabled = false;
                stopButton.disabled = false;
                break;
            default:
                statusText = 'Unknown';
                startButton.disabled = false;
                stopButton.disabled = true;
        }
        statusElement.innerHTML = statusText;
        
        // Update global service indicators if they exist
        const globalIndicator = document.getElementById('services-status-indicator');
        if (globalIndicator) {
            const allRunning = Object.values(this.services).every(s => s.status === 'running');
            const allStopped = Object.values(this.services).every(s => s.status === 'stopped' || s.status === 'error');
            
            if (allRunning) {
                globalIndicator.className = 'status-indicator status-running';
                globalIndicator.title = 'All services running';
            } else if (allStopped) {
                globalIndicator.className = 'status-indicator status-stopped';
                globalIndicator.title = 'All services stopped';
            } else {
                globalIndicator.className = 'status-indicator status-partial';
                globalIndicator.title = 'Some services running';
            }
        }
    }
}

// Initialize the service manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.serviceManager = new ServiceManager();
    
    // Set up event listeners for service control buttons
    const startAllBtn = document.getElementById('start-all-services');
    const stopAllBtn = document.getElementById('stop-all-services');
    
    if (startAllBtn) {
        startAllBtn.addEventListener('click', () => window.serviceManager.startAllServices());
    }
    
    if (stopAllBtn) {
        stopAllBtn.addEventListener('click', () => window.serviceManager.stopAllServices());
    }
    
    // Individual service buttons
    for (const serviceKey of Object.keys(window.serviceManager.services)) {
        const startBtn = document.getElementById(`${serviceKey}-start`);
        const stopBtn = document.getElementById(`${serviceKey}-stop`);
        
        if (startBtn) {
            startBtn.addEventListener('click', () => window.serviceManager.startService(serviceKey));
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => window.serviceManager.stopService(serviceKey));
        }
    }
});
