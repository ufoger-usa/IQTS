/**
 * ML Strategy Prediction Dashboard
 * Displays AI-powered strategy recommendations and market factors
 */

// Global variable to track if ML auto-select is enabled
let mlAutoSelectEnabled = false;

// Initialize prediction dashboard
function initPredictionDashboard() {
    console.log("Initializing ML prediction dashboard");
    
    // Listen for prediction updates
    document.addEventListener('strategy-prediction-updated', function(event) {
        updatePredictionDashboard(event.detail);
    });
    
    // Set up refresh button
    const refreshButton = document.getElementById('refresh-prediction');
    if (refreshButton) {
        refreshButton.addEventListener('click', async function() {
            try {
                document.getElementById('predicted-strategy').textContent = "Calculating...";
                document.getElementById('prediction-confidence').textContent = "--";
                
                // Trigger a new prediction
                const prediction = await autoTrader.selectStrategy();
                updatePredictionDashboard(prediction);
            } catch (error) {
                console.error("Error refreshing prediction:", error);
            }
        });
    }
    
    // Set up toggle switch for auto ML strategy selection
    const mlToggle = document.getElementById('ml-auto-select-toggle');
    if (mlToggle) {
        // Load saved preference if available
        const savedSetting = localStorage.getItem('mlAutoSelectEnabled');
        if (savedSetting) {
            mlAutoSelectEnabled = savedSetting === 'true';
            mlToggle.checked = mlAutoSelectEnabled;
            updateToggleStatus(mlAutoSelectEnabled);
        }
        
        mlToggle.addEventListener('change', function() {
            mlAutoSelectEnabled = this.checked;
            updateToggleStatus(mlAutoSelectEnabled);
            
            // Save preference
            localStorage.setItem('mlAutoSelectEnabled', mlAutoSelectEnabled);
            
            if (mlAutoSelectEnabled) {
                // If enabled, immediately run a prediction and apply it
                runAndApplyPrediction();
                
                // Show toast notification
                showToast('ML strategy selection enabled');
            } else {
                // Show toast notification
                showToast('ML strategy selection disabled');
            }
        });
    }
    
    // Run initial prediction
    setTimeout(() => {
        if (typeof autoTrader !== 'undefined' && autoTrader && typeof autoTrader.selectStrategy === 'function') {
            autoTrader.selectStrategy();
        } else {
            console.warn("autoTrader is not available or doesn't have selectStrategy method");
        }
    }, 2000);
}

// Function to run prediction and apply it if auto-select is enabled
async function runAndApplyPrediction() {
    try {
        if (typeof autoTrader !== 'undefined' && autoTrader && typeof autoTrader.selectStrategy === 'function') {
            const prediction = await autoTrader.selectStrategy();
            
            // If auto-select is enabled, apply the prediction
            if (mlAutoSelectEnabled && prediction && prediction.strategy) {
                console.log(`Auto-applying ML strategy: ${prediction.strategy}`);
                
                // Apply the strategy (this will depend on how your system applies strategies)
                if (typeof autoTrader.applyStrategy === 'function') {
                    autoTrader.applyStrategy(prediction.strategy);
                    
                    // Show confirmation
                    showToast(`Automatically switched to ${prediction.strategy.toUpperCase()} strategy`);
                }
            }
            
            return prediction;
        } else {
            console.warn("autoTrader is not available or doesn't have selectStrategy method");
            return null;
        }
    } catch (error) {
        console.error('Error in ML prediction:', error);
        return null;
    }
}

// Update the toggle status indicator
function updateToggleStatus(isEnabled) {
    const statusIndicator = document.getElementById('ml-status-indicator');
    if (statusIndicator) {
        if (isEnabled) {
            statusIndicator.textContent = 'Enabled';
            statusIndicator.classList.add('active');
        } else {
            statusIndicator.textContent = 'Disabled';
            statusIndicator.classList.remove('active');
        }
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Check if toast container exists, if not create one
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add event listener for close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toastContainer.removeChild(toast);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode === toastContainer) {
            toastContainer.removeChild(toast);
        }
    }, 5000);
}

// Update prediction dashboard with new data
function updatePredictionDashboard(prediction) {
    console.log("Updating prediction dashboard with:", prediction);
    
    // Update strategy
    const strategyElement = document.getElementById('predicted-strategy');
    if (strategyElement) {
        strategyElement.textContent = prediction.strategy.toUpperCase();
        
        // Apply styling based on strategy
        strategyElement.className = '';  // Clear existing classes
        if (prediction.strategy === 'swing') {
            strategyElement.classList.add('strategy-swing');
        } else if (prediction.strategy === 'scalp') {
            strategyElement.classList.add('strategy-scalp');
        } else {
            strategyElement.classList.add('strategy-mixed');
        }
    }
    
    // Update confidence
    const confidenceElement = document.getElementById('prediction-confidence');
    if (confidenceElement) {
        confidenceElement.textContent = `${prediction.confidence}%`;
        
        // Style based on confidence level
        confidenceElement.className = '';
        if (prediction.confidence >= 75) {
            confidenceElement.classList.add('high-confidence');
        } else if (prediction.confidence >= 50) {
            confidenceElement.classList.add('medium-confidence');
        } else {
            confidenceElement.classList.add('low-confidence');
        }
    }
    
    // Update factors
    updateFactorImpact('vix-impact', prediction.feature_importance?.vix || 0);
    updateFactorImpact('volume-impact', prediction.feature_importance?.volume_ratio || 0);
}

// Update the impact indicator for a specific factor
function updateFactorImpact(elementId, importance) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Convert importance (typically 0-1) to a visual scale
    const impactLevel = Math.round(importance * 5); // 0 to 5 scale
    let impactText = '⚫'; // Default minimal impact
    
    switch (impactLevel) {
        case 0: impactText = '⚫'; break;
        case 1: impactText = '🔹'; break;
        case 2: impactText = '🔹🔹'; break;
        case 3: impactText = '🔹🔹🔹'; break;
        case 4: impactText = '🔹🔹🔹🔹'; break;
        case 5: impactText = '🔹🔹🔹🔹🔹'; break;
    }
    
    element.textContent = impactText;
}

// Set up scheduled predictions when auto-select is enabled
function setupScheduledPredictions() {
    // Run prediction every 15 minutes if enabled
    setInterval(() => {
        if (mlAutoSelectEnabled) {
            console.log("Running scheduled ML prediction update");
            runAndApplyPrediction();
        }
    }, 15 * 60 * 1000); // 15 minutes
}

// Start the scheduled predictions on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize after a delay
    setTimeout(() => {
        initPredictionDashboard();
        setupScheduledPredictions();
    }, 1000);
});
