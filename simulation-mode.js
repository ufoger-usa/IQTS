// Add event handlers for simulation mode after document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSimulationMode();
});

function initSimulationMode() {
    // Get simulation elements
    const simulationToggle = document.getElementById('simulation-mode');
    const runBacktestButton = document.getElementById('run-backtest');
    const virtualBalanceElement = document.getElementById('virtual-balance');
    const simWinRateElement = document.getElementById('sim-win-rate');
    
    // Check if elements exist
    if (!simulationToggle || !runBacktestButton) {
        console.error('Simulation mode elements not found');
        return;
    }
    
    // Initialize from localStorage (if previously set)
    simulationToggle.checked = localStorage.getItem('simulationMode') === 'true';
    updateSimulationBadge();
    
    // Add simulation mode toggle handler
    simulationToggle.addEventListener('change', function() {
        localStorage.setItem('simulationMode', this.checked);
        updateSimulationBadge();
        
        // Show toast notification
        if (typeof showToast === 'function') {
            if (this.checked) {
                showToast('Simulation mode enabled - No real trades will be placed');
            } else {
                showToast('Simulation mode disabled - Live trading resumed');
            }
        }
    });
    
    // Add backtest button handler
    runBacktestButton.addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = 'Running test...';
        
        try {
            if (!window.simulationEngine) {
                console.error('Simulation engine not initialized');
                throw new Error('Simulation engine not available');
            }
            
            // Run the backtest
            const result = await window.simulationEngine.runBacktest(30);
            
            // Update UI
            if (virtualBalanceElement) {
                virtualBalanceElement.textContent = `$${result.finalBalance.toFixed(2)}`;
            }
            
            if (simWinRateElement) {
                simWinRateElement.textContent = `${result.winRate}%`;
            }
            
            // Show toast notification
            if (typeof showToast === 'function') {
                showToast(`Backtest complete: ${result.totalTrades} trades, ${result.winRate}% win rate`);
            }
            
            // Log the results
            console.log('Backtest results:', result);
            
            // If TelegramService is available, send the results
            if (typeof TelegramService !== 'undefined') {
                TelegramService.send(
                    `🧪 Backtest Results:\n` +
                    `Trades: ${result.totalTrades}\n` +
                    `Win Rate: ${result.winRate}%\n` +
                    `Final Balance: $${result.finalBalance.toFixed(2)}`
                );
            }
        } catch (error) {
            console.error('Error running backtest:', error);
            if (typeof showToast === 'function') {
                showToast('Error running backtest', 'error');
            }
        } finally {
            this.disabled = false;
            this.textContent = 'Run 30-Day Test';
        }
    });
    
    // Add simulation mode badge to header if not already there
    addSimulationBadgeToHeader();
}

function updateSimulationBadge() {
    const isSimulationMode = document.getElementById('simulation-mode')?.checked;
    const badge = document.getElementById('simulation-mode-badge');
    
    if (badge) {
        badge.style.display = isSimulationMode ? 'inline' : 'none';
    }
}

function addSimulationBadgeToHeader() {
    const header = document.querySelector('.header-title') || document.querySelector('header h1');
    
    if (!header || document.getElementById('simulation-mode-badge')) {
        return; // Header not found or badge already exists
    }
    
    const badge = document.createElement('span');
    badge.id = 'simulation-mode-badge';
    badge.className = 'simulation-badge';
    badge.textContent = 'SIMULATION';
    badge.style.display = document.getElementById('simulation-mode')?.checked ? 'inline' : 'none';
    
    header.appendChild(badge);
}

// If we have a toast notification system, define a simple one if it doesn't exist
if (typeof showToast !== 'function') {
    window.showToast = function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.querySelector('.toast-container') || document.body;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 10);
    };
}

// Initialize when loaded
console.log('Simulation mode initialized');
