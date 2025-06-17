/**
 * RL Tuning Dashboard - Dynamic Parameter Tuning with Reinforcement Learning
 * Manages the UI and interaction with the RL tuning service
 */

// Initialize the RL tuning dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chart and UI components when DOM is loaded
    initializeLearningChart();
    
    // Add event listeners
    document.getElementById('auto-tune-toggle').addEventListener('change', toggleAutoTuning);
    document.getElementById('tune-now').addEventListener('click', manualTuneParameters);
    
    // Load saved auto-tune preference
    const autoTuneEnabled = localStorage.getItem('autoTuneEnabled') === 'true';
    document.getElementById('auto-tune-toggle').checked = autoTuneEnabled;
    updateAutoTuneStatus(autoTuneEnabled);
    
    // Start learning progress updates if auto-tune is enabled
    if (autoTuneEnabled) {
        startLearningProgressUpdates();
    }
});

// Chart for learning progress visualization
let learningChart;

/**
 * Initialize the learning progress chart
 */
function initializeLearningChart() {
    const ctx = document.getElementById('learningProgressChart').getContext('2d');
    
    learningChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Reward',
                    data: [],
                    borderColor: '#E91E63',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Stop Loss',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Take Profit',
                    data: [],
                    borderColor: '#2ecc71',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Position Size',
                    data: [],
                    borderColor: '#f39c12',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Training Episodes'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Reward'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Parameter Values'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Toggle auto-tuning of parameters
 */
function toggleAutoTuning() {
    const isEnabled = document.getElementById('auto-tune-toggle').checked;
    updateAutoTuneStatus(isEnabled);
    
    // Save preference
    localStorage.setItem('autoTuneEnabled', isEnabled);
    
    if (isEnabled) {
        // Start periodic tuning and chart updates
        startLearningProgressUpdates();
        
        // Immediate tune
        manualTuneParameters();
        
        // Show toast notification
        showToast('Auto parameter tuning enabled');
    } else {
        // Stop periodic updates
        stopLearningProgressUpdates();
        
        // Show toast notification
        showToast('Auto parameter tuning disabled');
    }
}

/**
 * Update the UI to reflect auto-tune status
 */
function updateAutoTuneStatus(isEnabled) {
    const statusIndicator = document.getElementById('rl-status-indicator');
    const statusText = document.getElementById('rl-status-text');
    
    if (isEnabled) {
        statusIndicator.classList.add('active');
        statusText.textContent = 'ACTIVE';
    } else {
        statusIndicator.classList.remove('active');
        statusText.textContent = 'OFF';
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Manually trigger parameter tuning
 */
async function manualTuneParameters() {
    try {
        // Show loading state
        const tuneButton = document.getElementById('tune-now');
        const originalText = tuneButton.textContent;
        tuneButton.textContent = 'Tuning...';
        tuneButton.disabled = true;
        
        // Call the AutoTrader's tuneParameters method
        const params = await window.autoTrader.tuneParameters();
        
        if (params) {
            // Update UI with new parameters
            updateParameterDisplay(params.stop_loss, params.take_profit, params.position_size);
            
            // Show success toast
            showToast('Parameters successfully tuned');
        } else {
            showToast('Error tuning parameters');
        }
        
        // Reset button
        tuneButton.textContent = originalText;
        tuneButton.disabled = false;
        
    } catch (error) {
        console.error('Error in manual parameter tuning:', error);
        showToast('Error tuning parameters');
        
        // Reset button
        document.getElementById('tune-now').textContent = 'Tune Now';
        document.getElementById('tune-now').disabled = false;
    }
}

/**
 * Update the parameter display in UI
 */
function updateParameterDisplay(stopLoss, takeProfit, positionSize) {
    document.getElementById('current-sl').textContent = stopLoss.toFixed(2);
    document.getElementById('current-tp').textContent = takeProfit.toFixed(2);
    document.getElementById('current-ps').textContent = positionSize.toFixed(2);
    
    // Update the change indicators
    updateChangeIndicator('sl-change', window.autoTrader.parameterChanges.stopLoss);
    updateChangeIndicator('tp-change', window.autoTrader.parameterChanges.takeProfit);
    updateChangeIndicator('ps-change', window.autoTrader.parameterChanges.positionSize);
}

/**
 * Update parameter change indicator
 */
function updateChangeIndicator(elementId, changeText) {
    const element = document.getElementById(elementId);
    element.textContent = changeText;
    
    // Set class based on change direction
    if (changeText.startsWith('+')) {
        element.className = 'param-change positive';
    } else if (changeText.startsWith('-')) {
        element.className = 'param-change negative';
    } else {
        element.className = 'param-change neutral';
    }
}

// Learning progress update interval
let learningProgressInterval = null;

/**
 * Start periodic updates of learning progress
 */
function startLearningProgressUpdates() {
    // Stop any existing interval
    stopLearningProgressUpdates();
    
    // Start new interval - update every 10 seconds
    learningProgressInterval = setInterval(fetchLearningProgress, 10000);
    
    // Immediate fetch
    fetchLearningProgress();
}

/**
 * Stop periodic updates of learning progress
 */
function stopLearningProgressUpdates() {
    if (learningProgressInterval) {
        clearInterval(learningProgressInterval);
        learningProgressInterval = null;
    }
}

/**
 * Fetch learning progress data from the RL service
 */
async function fetchLearningProgress() {
    try {
        const response = await fetch('http://localhost:6001/learning-progress');
        
        if (!response.ok) {
            console.error('Failed to fetch learning progress:', response.status);
            return;
        }
        
        const data = await response.json();
        updateLearningChart(data);
        
    } catch (error) {
        console.error('Error fetching learning progress:', error);
    }
}

/**
 * Update the learning progress chart with new data
 */
function updateLearningChart(data) {
    if (!learningChart || !data.episodes || data.episodes.length === 0) {
        return;
    }
    
    // Update chart data
    learningChart.data.labels = data.episodes;
    learningChart.data.datasets[0].data = data.rewards;
    learningChart.data.datasets[1].data = data.stop_loss;
    learningChart.data.datasets[2].data = data.take_profit;
    learningChart.data.datasets[3].data = data.position_size;
    
    // Update chart
    learningChart.update();
}

// Listen for parameter updates from AutoTrader
document.addEventListener('parameters-updated', (event) => {
    const { stopLoss, takeProfit, positionSize } = event.detail;
    updateParameterDisplay(stopLoss, takeProfit, positionSize);
});

// Expose methods for use by other modules
window.rlTuning = {
    manualTuneParameters,
    toggleAutoTuning,
    updateParameterDisplay
};
