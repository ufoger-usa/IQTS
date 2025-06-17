/**
 * quantum-dashboard.js - UI components for the quantum optimization dashboard
 * Provides visualization and interaction with quantum-optimized trading strategies
 */

// Initialize dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initQuantumDashboard();
});

/**
 * Initialize the quantum optimization dashboard UI components
 */
function initQuantumDashboard() {
    // Check if quantum optimization panel exists in the DOM
    const quantumPanel = document.getElementById('quantum-optimization');
    if (!quantumPanel) {
        console.warn('Quantum optimization panel not found in DOM');
        return;
    }
    
    // Set up the run button
    const runButton = document.getElementById('run-quantum');
    if (runButton) {
        runButton.addEventListener('click', async () => {
            await runQuantumOptimization();
        });
    }
    
    // Initialize qubits visualization
    initQubitsVisualization();
    
    // Periodically check service status
    setInterval(checkQuantumServiceStatus, 30000);
    
    // Initial service status check
    checkQuantumServiceStatus();
}

/**
 * Check the status of the quantum optimization service
 */
async function checkQuantumServiceStatus() {
    const statusElement = document.getElementById('quantum-state');
    if (!statusElement) return;
    
    // If we have a global instance of the optimizer, use its check method
    if (window.hybridOptimizer) {
        try {
            await window.hybridOptimizer._checkServiceConnection();
        } catch (error) {
            console.error('Failed to check quantum service status:', error);
            statusElement.textContent = 'Unavailable';
            statusElement.className = 'status-error';
        }
    } else {
        statusElement.textContent = 'Not Initialized';
        statusElement.className = 'status-error';
    }
}

/**
 * Initialize the qubit visualization in the quantum dashboard
 */
function initQubitsVisualization() {
    const qubitsContainer = document.querySelector('.qbits');
    if (!qubitsContainer) return;
    
    // Clear any existing visualization
    qubitsContainer.innerHTML = '';
    
    // Create a grid of qubits for visualization
    const gridSize = 8; // 8x8 grid
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const qubit = document.createElement('div');
            qubit.className = 'qbit';
            qubit.setAttribute('v-for', `i in ${gridSize}`);
            
            // Add animation delay based on position
            const delay = (i + j) * 0.05;
            qubit.style.animationDelay = `${delay}s`;
            
            qubitsContainer.appendChild(qubit);
        }
    }
}

/**
 * Execute quantum optimization and update the dashboard
 */
async function runQuantumOptimization() {
    // Update UI to show processing state
    const statusElement = document.getElementById('quantum-state');
    const runButton = document.getElementById('run-quantum');
    
    if (statusElement) {
        statusElement.textContent = 'Processing...';
        statusElement.className = 'status-processing';
    }
    
    if (runButton) {
        runButton.disabled = true;
        runButton.textContent = 'Optimizing...';
    }
    
    // Start qubit animation
    startQubitAnimation();
    
    try {
        // Run optimization if the optimizer is available
        if (!window.hybridOptimizer) {
            throw new Error('Optimizer not initialized');
        }
        
        const result = await window.hybridOptimizer.runQuantumOptimization();
        
        // Update results panel
        updateOptimizationResults(result);
        
        // Update dashboard visualization
        visualizeQuantumResults(result);
        
        // Reset button state
        if (runButton) {
            runButton.disabled = false;
            runButton.textContent = 'Optimize Portfolio';
        }
        
        // Update status
        if (statusElement) {
            statusElement.textContent = 'Ready';
            statusElement.className = 'status-connected';
        }
        
        // Apply the optimized strategy if auto-apply is enabled
        const autoApply = document.getElementById('quantum-auto-apply');
        if (autoApply && autoApply.checked && !result.error) {
            applyOptimizedStrategy(result);
        }
        
    } catch (error) {
        console.error('Error during quantum optimization:', error);
        
        // Update status on error
        if (statusElement) {
            statusElement.textContent = 'Error';
            statusElement.className = 'status-error';
        }
        
        // Reset button
        if (runButton) {
            runButton.disabled = false;
            runButton.textContent = 'Retry Optimization';
        }
        
        // Show error in results
        updateOptimizationResults({ error: error.message });
    } finally {
        // Stop animation
        stopQubitAnimation();
    }
}

/**
 * Start animation for qubit visualization during processing
 */
function startQubitAnimation() {
    const qubits = document.querySelectorAll('.qbit');
    qubits.forEach(qubit => {
        qubit.classList.add('processing');
    });
}

/**
 * Stop animation for qubit visualization
 */
function stopQubitAnimation() {
    const qubits = document.querySelectorAll('.qbit');
    qubits.forEach(qubit => {
        qubit.classList.remove('processing');
    });
}

/**
 * Update the results panel with optimization output
 * @param {Object} result - Optimization results
 */
function updateOptimizationResults(result) {
    const resultsPanel = document.getElementById('quantum-results');
    if (!resultsPanel) return;
    
    if (result.error) {
        resultsPanel.innerHTML = `
            <div class="error-message">
                <span class="material-icons">error</span>
                <p>${result.error}</p>
            </div>
        `;
        return;
    }
    
    // Format the results into HTML
    const strategiesList = result.recommendedStrategies.map(id => 
        `<li>${id} (${(result.portfolioWeight[id] * 100).toFixed(1)}%)</li>`
    ).join('');
    
    resultsPanel.innerHTML = `
        <div class="results-container">
            <div class="results-header">
                <h4>Optimized Portfolio</h4>
                <span class="badge ${result.quantum ? 'quantum-badge' : 'classical-badge'}">
                    ${result.quantum ? 'Quantum' : 'Classical'} Solution
                </span>
            </div>
            <p>Execution Time: ${result.executionTime.toFixed(2)}ms</p>
            <h5>Recommended Strategies:</h5>
            <ul class="strategy-list">
                ${strategiesList}
            </ul>
            <button id="apply-quantum" class="apply-button">
                Apply Optimized Portfolio
            </button>
        </div>
    `;
    
    // Set up apply button
    const applyButton = document.getElementById('apply-quantum');
    if (applyButton) {
        applyButton.addEventListener('click', () => {
            applyOptimizedStrategy(result);
        });
    }
}

/**
 * Visualize the quantum optimization results
 * @param {Object} result - Optimization results
 */
function visualizeQuantumResults(result) {
    // Highlight selected qubits in the visualization
    if (!result.recommendedStrategies || result.error) return;
    
    const qubits = document.querySelectorAll('.qbit');
    const totalQubits = qubits.length;
    
    // Calculate how many qubits to highlight based on selected strategies
    const selectedCount = result.recommendedStrategies.length;
    const highlightCount = Math.min(
        Math.max(Math.floor(totalQubits * (selectedCount / 10)), 1), 
        totalQubits
    );
    
    // Reset all qubits
    qubits.forEach(qubit => {
        qubit.classList.remove('selected', 'active');
    });
    
    // Highlight random qubits representing selected strategies
    const indices = new Set();
    while (indices.size < highlightCount) {
        indices.add(Math.floor(Math.random() * totalQubits));
    }
    
    // Apply highlighting with delay
    Array.from(indices).forEach((index, i) => {
        setTimeout(() => {
            if (qubits[index]) {
                qubits[index].classList.add('selected');
                setTimeout(() => {
                    qubits[index].classList.add('active');
                }, 50);
            }
        }, i * 100);
    });
}

/**
 * Apply the quantum-optimized strategy to the trading system
 * @param {Object} result - Optimization results
 */
function applyOptimizedStrategy(result) {
    if (result.error || !result.recommendedStrategies) {
        console.error('Cannot apply invalid optimization result');
        return;
    }
    
    try {
        // Log the action
        console.log('Applying quantum-optimized strategy:', result.recommendedStrategies);
        
        // Save to local storage for persistence
        localStorage.setItem(
            'quantum_optimized_strategy', 
            JSON.stringify(result)
        );
        
        // Apply strategy weights to the trading system
        if (window.applyStrategyWeights) {
            window.applyStrategyWeights(result.portfolioWeight);
            
            // Show success message
            showNotification('Quantum-optimized strategy applied successfully');
        } else {
            console.warn('applyStrategyWeights function not available');
        }
        
        // Update UI to show applied state
        const applyButton = document.getElementById('apply-quantum');
        if (applyButton) {
            applyButton.textContent = 'Strategy Applied';
            applyButton.classList.add('success');
            
            // Reset button after a few seconds
            setTimeout(() => {
                applyButton.textContent = 'Apply Optimized Portfolio';
                applyButton.classList.remove('success');
            }, 3000);
        }
    } catch (error) {
        console.error('Error applying optimized strategy:', error);
        showNotification('Error applying strategy: ' + error.message, 'error');
    }
}

/**
 * Display a notification to the user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, error)
 */
function showNotification(message, type = 'success') {
    // Check if notifications container exists, create if not
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <span class="notification-close">&times;</span>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add close handler
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.add('closing');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode === container) {
            notification.classList.add('closing');
            setTimeout(() => {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Export functions for external use
window.quantumDashboard = {
    runQuantumOptimization,
    updateOptimizationResults,
    applyOptimizedStrategy
};