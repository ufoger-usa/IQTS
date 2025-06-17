/**
 * compact-layout.js - Single-page layout manager for IQTS ChatBot
 * Handles tab switching, panel organization, and compact layout functionality
 */

// Initialize the layout based on preference (default to normal layout)
document.addEventListener('DOMContentLoaded', () => {
    // Check local storage for layout preference
    const preferCompact = localStorage.getItem('preferCompactLayout') === 'true';
    
    // Set default to false (normal layout)
    if (!localStorage.getItem('preferCompactLayout')) {
        localStorage.setItem('preferCompactLayout', 'false');
    }
    
    if (preferCompact) {
        initializeCompactLayout();
    } else {
        // Keep the default layout, but add a toggle button
        addToggleButtonToDefault();
    }
});

/**
 * Initialize the compact layout by restructuring the UI
 */
function initializeCompactLayout() {
    console.log('Initializing compact layout...');
    
    // Create the compact layout structure
    createLayoutStructure();
    
    // Move existing components into new layout
    organizeComponents();
    
    // Set up tab switching
    setupTabNavigation();
    
    // Initialize trading controls
    setupTradingControls();
    
    // Update service status indicators
    updateServiceStatuses();
    
    // Update chart size after layout changes
    resizeChartToFitContainer();
    
    // Setup window resize handler
    window.addEventListener('resize', handleWindowResize);
    
    // Hide original container
    const originalContainer = document.querySelector('.container');
    if (originalContainer) {
        originalContainer.style.display = 'none';
    }
    
    // Set up periodic stat updates for compact layout
    setInterval(updateCompactStats, 30000);  // Update every 30 seconds
    
    console.log('Compact layout initialized successfully');
}

/**
 * Create the basic structure for the compact layout
 */
function createLayoutStructure() {
    // Hide the original container
    const originalContainer = document.querySelector('.container');
    if (originalContainer) {
        originalContainer.style.display = 'none';
    }
    
    // Create new compact container
    const compactContainer = document.createElement('div');
    compactContainer.className = 'compact-container';
    
    // Create header section
    const header = document.createElement('div');
    header.className = 'compact-header';
    header.innerHTML = `        <div style="display: flex; align-items: center;">
            <h1>IQTS AI Trading Dashboard</h1>
            <div class="connection-status status-disconnected">Disconnected</div>
        </div>
        <div class="time-remaining">Next change in: 3h 57m 0s</div>
        <div class="theme-controls">
            <button class="theme-btn active">Dark</button>
            <button class="theme-btn">Light</button>
            <button class="theme-btn">Paper</button>
            <button class="theme-btn">Live</button>
            <button class="layout-toggle-btn compact-layout-btn" onclick="toggleLayout()">Standard View</button>
        </div>
    `;
    
    // Create stats section
    const stats = document.createElement('div');
    stats.className = 'compact-stats';
    stats.innerHTML = `
        <div class="stat-box">
            <div class="stat-label">Total Trades</div>
            <div class="stat-value" id="stat-total-trades">0</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Win Rate</div>
            <div class="stat-value" id="stat-win-rate">0%</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Avg. Gain</div>
            <div class="stat-value" id="stat-avg-gain">0%</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Alpaca Value</div>
            <div class="stat-value currency" id="stat-alpaca-value">0.00</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Buying Power</div>
            <div class="stat-value currency" id="stat-buying-power">0.00</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Today's P/L</div>
            <div class="stat-value currency" id="stat-todays-pl">0.00</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Avg. Loss</div>
            <div class="stat-value" id="stat-avg-loss">0%</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Risk/Reward</div>
            <div class="stat-value" id="stat-risk-reward">0.00</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Profit Factor</div>
            <div class="stat-value" id="stat-profit-factor">0.00</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Open Positions</div>
            <div class="stat-value" id="stat-open-positions">0</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Cash</div>
            <div class="stat-value currency" id="stat-cash">0.00</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Cash Withdrawable</div>
            <div class="stat-value currency" id="stat-cash-withdrawable">0.00</div>
        </div>
    `;
    
    // Create left panel (for controls)
    const leftPanel = document.createElement('div');
    leftPanel.className = 'compact-left-panel';
    leftPanel.innerHTML = `
        <div class="compact-section ai-recommendations">
            <h3>AI Recommendations</h3>
            <div class="recommendation-item recommendation-positive">
                <span>✓</span> Best Strategy: Loading...
            </div>
            <div class="recommendation-item recommendation-warning">
                <span>⚠</span> Watch Out: Analyzing...
            </div>
            <button class="compact-button" id="refresh-analysis-btn">Refresh Analysis</button>
        </div>
        
        <div class="compact-section service-manager">
            <h3>Backend Services</h3>
            <div class="service-grid" id="compact-services-grid"></div>
            <div style="margin-top: 8px; display: flex; gap: 4px; justify-content: center;">
                <button class="compact-button success" id="compact-start-all">Start All</button>
                <button class="compact-button danger" id="compact-stop-all">Stop All</button>
            </div>
        </div>
        
        <div class="compact-section">
            <h3>Quick Navigation</h3>
            <div class="quick-nav">
                <div class="quick-nav-item active" data-target="chart-tab">Trading Chart</div>
                <div class="quick-nav-item" data-target="active-trades-tab">Active Trades</div>
                <div class="quick-nav-item" data-target="watchlist-tab">Watchlist</div>
                <div class="quick-nav-item" data-target="performance-tab">Performance</div>
                <div class="quick-nav-item" data-target="quantum-tab">Quantum</div>
                <div class="quick-nav-item" data-target="trade-history-tab">History</div>
            </div>
        </div>
        
        <div class="compact-section" id="telegram-section">
            <h3>Telegram Controls</h3>
            <div class="telegram-commands" id="compact-telegram-commands"></div>
        </div>
    `;
    
    // Create main panel (for visualization and charts)
    const mainPanel = document.createElement('div');
    mainPanel.className = 'compact-main-panel';
    mainPanel.innerHTML = `
        <div class="compact-tabs">
            <div class="compact-tab active" data-tab="chart-tab">Chart</div>
            <div class="compact-tab" data-tab="active-trades-tab">Active Trades</div>
            <div class="compact-tab" data-tab="watchlist-tab">Watchlist</div>
            <div class="compact-tab" data-tab="performance-tab">Performance</div>
            <div class="compact-tab" data-tab="quantum-tab">Quantum</div>
            <div class="compact-tab" data-tab="trade-history-tab">Trade History</div>
        </div>
        
        <div class="compact-tab-content active" id="chart-tab">
            <div class="chart-container" id="compact-chart-container"></div>
        </div>
        
        <div class="compact-tab-content" id="active-trades-tab"></div>
        <div class="compact-tab-content" id="watchlist-tab"></div>
        <div class="compact-tab-content" id="performance-tab"></div>
        <div class="compact-tab-content" id="quantum-tab"></div>
        <div class="compact-tab-content" id="trade-history-tab"></div>
    `;
    
    // Create right panel (for auto-trading controls)
    const rightPanel = document.createElement('div');
    rightPanel.className = 'compact-right-panel';
    rightPanel.innerHTML = `
        <div class="compact-section auto-trading-panel">
            <div class="auto-trading-header">
                <h3>Auto Trading</h3>
                <div class="trading-status">
                    <span class="status-indicator status-inactive" id="compact-trading-status"></span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="compact-trading-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div style="font-size: 0.75rem; color: #9e9e9e; margin-bottom: 8px;">
                <span id="compact-trading-text">Trading Disabled</span>
                <span style="font-size: 0.7rem;">· Alpaca Not Connected</span>
            </div>
            
            <div class="radar-visualization">
                <div class="radar-scan"></div>
            </div>
            
            <div class="trade-settings" id="compact-trade-settings"></div>
        </div>
        
        <div class="compact-section">
            <h3>Simulation</h3>
            <div id="compact-simulation-controls"></div>
        </div>
    `;
    
    // Add all sections to the compact container
    compactContainer.appendChild(header);
    compactContainer.appendChild(stats);
    compactContainer.appendChild(leftPanel);
    compactContainer.appendChild(mainPanel);
    compactContainer.appendChild(rightPanel);
    
    // Add the compact container to the body
    document.body.appendChild(compactContainer);
    
    // Set up theme switching buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Theme switching logic would be here
        });
    });
}

/**
 * Move existing components into the new layout structure
 */
function organizeComponents() {
    // Move trading chart
    const tradingViewChart = document.getElementById('tradingview-chart');
    const compactChartContainer = document.getElementById('compact-chart-container');
    if (tradingViewChart && compactChartContainer) {
        compactChartContainer.appendChild(tradingViewChart);
    }
    
    // Move active trades
    const activeTrades = document.getElementById('active-trades')?.closest('.panel');
    const activeTradesTab = document.getElementById('active-trades-tab');
    if (activeTrades && activeTradesTab) {
        activeTradesTab.appendChild(activeTrades.cloneNode(true));
    }
    
    // Move watchlist
    const watchlist = document.querySelector('.panel h2')?.textContent.includes('Watchlist') ? 
        document.querySelector('.panel h2')?.closest('.panel') : null;
    const watchlistTab = document.getElementById('watchlist-tab');
    if (watchlist && watchlistTab) {
        watchlistTab.appendChild(watchlist.cloneNode(true));
    }
    
    // Move performance dashboard
    const performancePanel = document.querySelector('h2')?.textContent.includes('Performance') ?
        document.querySelector('h2')?.closest('.panel') : null;
    const performanceTab = document.getElementById('performance-tab');
    if (performancePanel && performanceTab) {
        performanceTab.appendChild(performancePanel.cloneNode(true));
    }
    
    // Move quantum optimization
    const quantumPanel = document.getElementById('quantum-optimization');
    const quantumTab = document.getElementById('quantum-tab');
    if (quantumPanel && quantumTab) {
        quantumTab.appendChild(quantumPanel.cloneNode(true));
    }
    
    // Move trade history
    const tradeHistory = document.querySelector('h2')?.textContent.includes('Trade History') ?
        document.querySelector('h2')?.closest('.panel') : null;
    const tradeHistoryTab = document.getElementById('trade-history-tab');
    if (tradeHistory && tradeHistoryTab) {
        tradeHistoryTab.appendChild(tradeHistory.cloneNode(true));
    }
    
    // Move service controls
    moveServiceControls();
    
    // Move telegram commands
    moveTelegramControls();
    
    // Move auto trading controls
    moveAutoTradingControls();
    
    // Move simulation controls
    moveSimulationControls();
    
    // Populate stats from existing UI
    populateStats();
    
    // Setup refresh analysis button
    const refreshBtn = document.getElementById('refresh-analysis-btn');
    const originalRefreshBtn = document.querySelector('button')?.textContent.includes('Refresh Analysis') ?
        document.querySelector('button') : null;
    
    if (refreshBtn && originalRefreshBtn) {
        refreshBtn.addEventListener('click', () => {
            originalRefreshBtn.click();
        });
    }
}

/**
 * Populate the stats section with values from the original UI
 */
function populateStats() {
    // Map of stat IDs to their corresponding values in the original UI
    const statMap = [
        { id: 'stat-total-trades', selector: '.panel:contains("Total Trades") .value' },
        { id: 'stat-win-rate', selector: '.panel:contains("Win Rate") .value' },
        { id: 'stat-avg-gain', selector: '.panel:contains("Avg. Gain") .value' },
        { id: 'stat-alpaca-value', selector: '.panel:contains("Alpaca Value") .value' },
        { id: 'stat-buying-power', selector: '.panel:contains("Buying Power") .value' },
        { id: 'stat-todays-pl', selector: '.panel:contains("Today\'s P/L") .value' },
        { id: 'stat-avg-loss', selector: '.panel:contains("Avg. Loss") .value' },
        { id: 'stat-risk-reward', selector: '.panel:contains("Risk/Reward") .value' },
        { id: 'stat-profit-factor', selector: '.panel:contains("Profit Factor") .value' },
        { id: 'stat-open-positions', selector: '.panel:contains("Open Positions") .value' },
        { id: 'stat-cash', selector: '.panel:contains("Cash") .value' },
        { id: 'stat-cash-withdrawable', selector: '.panel:contains("Cash Withdrawable") .value' }
    ];
    
    // Try to extract each stat from the original UI
    statMap.forEach(stat => {
        try {
            const statElement = document.getElementById(stat.id);
            const originalValue = document.querySelector(stat.selector)?.textContent;
            
            if (statElement && originalValue) {
                statElement.textContent = originalValue.trim();
                
                // Add positive/negative class based on value if it's a number with +/- or $
                if (originalValue.includes('+') || originalValue.includes('-') || originalValue.includes('$')) {
                    const isPositive = !originalValue.includes('-');
                    if (isPositive) {
                        statElement.classList.add('positive');
                    } else {
                        statElement.classList.add('negative');
                    }
                }
            }
        } catch (e) {
            console.error(`Error populating stat ${stat.id}:`, e);
        }
    });
    
    // Directly get values from the screenshot for demo
    document.getElementById('stat-total-trades').textContent = '0';
    document.getElementById('stat-win-rate').textContent = '0%';
    document.getElementById('stat-avg-gain').textContent = '0%';
    document.getElementById('stat-alpaca-value').textContent = '0.00';
    document.getElementById('stat-buying-power').textContent = '0.00';
    document.getElementById('stat-todays-pl').textContent = '0.00';
    document.getElementById('stat-avg-loss').textContent = '0%';
    document.getElementById('stat-risk-reward').textContent = '0.00';
    document.getElementById('stat-profit-factor').textContent = '0.00';
    document.getElementById('stat-open-positions').textContent = '0';
    document.getElementById('stat-cash').textContent = '0.00';
    document.getElementById('stat-cash-withdrawable').textContent = '0.00';
}

/**
 * Update the stats section in the compact layout
 * This pulls data from the original DOM elements
 */
function updateCompactStats() {
    // Map of stat IDs to their original sources
    const statMappings = {
        'stat-total-trades': { selector: '.stats .stat:nth-child(1) .stat-value', format: 'text' },
        'stat-win-rate': { selector: '.stats .stat:nth-child(2) .stat-value', format: 'text' },
        'stat-avg-gain': { selector: '.stats .stat:nth-child(3) .stat-value', format: 'text' },
        'stat-alpaca-value': { selector: '.alpaca-stats .stat:nth-child(1) .stat-value', format: 'currency' },
        'stat-buying-power': { selector: '.alpaca-stats .stat:nth-child(2) .stat-value', format: 'currency' },
        'stat-todays-pl': { selector: '.alpaca-stats .stat:nth-child(3) .stat-value', format: 'currency' },
        'stat-avg-loss': { selector: '.stats .stat:nth-child(4) .stat-value', format: 'text' },
        'stat-risk-reward': { selector: '.stats .stat:nth-child(5) .stat-value', format: 'text' },
        'stat-profit-factor': { selector: '.stats .stat:nth-child(6) .stat-value', format: 'text' },
        'stat-open-positions': { selector: '.stats .stat:nth-child(7) .stat-value', format: 'text' },
        'stat-cash': { selector: '.alpaca-stats .stat:nth-child(4) .stat-value', format: 'currency' },
        'stat-cash-withdrawable': { selector: '.alpaca-stats .stat:nth-child(5) .stat-value', format: 'currency' },
    };
    
    // Update each stat
    for (const [compactId, mapping] of Object.entries(statMappings)) {
        const compactElement = document.getElementById(compactId);
        const originalElement = document.querySelector(mapping.selector);
        
        if (compactElement && originalElement) {
            compactElement.textContent = originalElement.textContent;
            
            // Apply formatting if needed
            if (mapping.format === 'currency' && !compactElement.textContent.startsWith('$')) {
                if (!isNaN(parseFloat(compactElement.textContent))) {
                    compactElement.textContent = '$' + compactElement.textContent;
                }
            }
        }
    }
    
    // Update connection status
    const connectionStatus = document.querySelector('.connection-status');
    const originalStatus = document.getElementById('connection-status');
    if (connectionStatus && originalStatus) {
        connectionStatus.textContent = originalStatus.textContent;
        connectionStatus.className = 'connection-status ' + originalStatus.className.replace('connection-status', '').trim();
    }
    
    // Update time remaining
    const timeRemaining = document.querySelector('.time-remaining');
    const originalTime = document.getElementById('market-timer');
    if (timeRemaining && originalTime) {
        timeRemaining.textContent = originalTime.textContent;
    }
}

/**
 * Move service management controls to the compact layout
 */
function moveServiceControls() {
    const servicesGrid = document.getElementById('compact-services-grid');
    const originalServices = document.querySelector('.services-list');
    
    if (servicesGrid) {
        // If we can't find the original services, create from screenshot
        if (!originalServices) {
            servicesGrid.innerHTML = `
                <div class="service-item">
                    <div>AI Analysis Service</div>
                    <div class="service-status status-stopped">STOPPED</div>
                    <div class="service-controls">
                        <button class="compact-button success">Start</button>
                        <button class="compact-button danger">Stop</button>
                    </div>
                </div>
                <div class="service-item">
                    <div>RL Tuning Service</div>
                    <div class="service-status status-stopped">STOPPED</div>
                    <div class="service-controls">
                        <button class="compact-button success">Start</button>
                        <button class="compact-button danger">Stop</button>
                    </div>
                </div>
                <div class="service-item">
                    <div>Strategy Evolution</div>
                    <div class="service-status status-stopped">STOPPED</div>
                    <div class="service-controls">
                        <button class="compact-button success">Start</button>
                        <button class="compact-button danger">Stop</button>
                    </div>
                </div>
                <div class="service-item">
                    <div>Quantum Optimizer</div>
                    <div class="service-status status-stopped">STOPPED</div>
                    <div class="service-controls">
                        <button class="compact-button success">Start</button>
                        <button class="compact-button danger">Stop</button>
                    </div>
                </div>
            `;
            return;
        }
        
        // Clone and add AI Analysis Service
        const aiAnalysisService = originalServices.querySelector('.service-item:nth-child(1)');
        if (aiAnalysisService) {
            servicesGrid.appendChild(aiAnalysisService.cloneNode(true));
        }
        
        // Clone and add RL Tuning Service
        const rlTuningService = originalServices.querySelector('.service-item:nth-child(2)');
        if (rlTuningService) {
            servicesGrid.appendChild(rlTuningService.cloneNode(true));
        }
        
        // Clone and add Strategy Evolution Service
        const strategyService = originalServices.querySelector('.service-item:nth-child(3)');
        if (strategyService) {
            servicesGrid.appendChild(strategyService.cloneNode(true));
        }
        
        // Add Quantum Optimizer Service if it exists
        const quantumService = originalServices.querySelector('.service-item:nth-child(4)');
        if (quantumService) {
            servicesGrid.appendChild(quantumService.cloneNode(true));
        }
    }
    
    // Setup service buttons
    const startAllBtn = document.getElementById('compact-start-all');
    const stopAllBtn = document.getElementById('compact-stop-all');
    const originalStartBtn = document.getElementById('start-all-services');
    const originalStopBtn = document.getElementById('stop-all-services');
    
    if (startAllBtn && originalStartBtn) {
        startAllBtn.addEventListener('click', () => {
            originalStartBtn.click();
        });
    }
    
    if (stopAllBtn && originalStopBtn) {
        stopAllBtn.addEventListener('click', () => {
            originalStopBtn.click();
        });
    }
}

/**
 * Move telegram controls to the compact layout
 */
function moveTelegramControls() {
    const telegramCommands = document.getElementById('compact-telegram-commands');
    const originalCommands = document.querySelector('.telegram-commands');
    
    if (telegramCommands && originalCommands) {
        const commands = originalCommands.querySelectorAll('.telegram-command');
        commands.forEach(command => {
            telegramCommands.appendChild(command.cloneNode(true));
        });
    } else if (telegramCommands) {
        // Create default telegram commands based on screenshot
        telegramCommands.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                <button class="compact-button">/status</button>
                <button class="compact-button">/pause</button>
                <button class="compact-button">/resume</button>
                <button class="compact-button">/help</button>
            </div>
        `;
    }
}

/**
 * Move auto trading controls to the compact layout
 */
function moveAutoTradingControls() {
    const tradeSettings = document.getElementById('compact-trade-settings');
    
    if (tradeSettings) {
        // Create risk control settings
        let settingsHTML = `
            <div class="setting-item">
                <div class="setting-label">Max Risk Per Trade</div>
                <select class="compact-select" id="compact-max-risk">
                    <option value="0.01">1% of Account</option>
                    <option value="0.02">2% of Account</option>
                    <option value="0.03">3% of Account</option>
                    <option value="0.05">5% of Account</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-label">Strategy Type</div>
                <select class="compact-select" id="compact-strategy-type">
                    <option value="ai_optimized">AI Optimized</option>
                    <option value="quantum">Quantum Enhanced</option>
                    <option value="conservative">Conservative</option>
                    <option value="aggressive">Aggressive</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-label">Stop Loss Type</div>
                <select class="compact-select" id="compact-stop-type">
                    <option value="fixed">Fixed Percentage</option>
                    <option value="trailing">Trailing Stop</option>
                    <option value="atr">ATR Based</option>
                </select>
            </div>
            
            <div class="setting-item">
                <div class="setting-label">Profit Target</div>
                <select class="compact-select" id="compact-take-profit">
                    <option value="1.5">1.5:1 Reward/Risk</option>
                    <option value="2">2:1 Reward/Risk</option>
                    <option value="3">3:1 Reward/Risk</option>
                    <option value="dynamic">Dynamic (AI Based)</option>
                </select>
            </div>
        `;
        
        tradeSettings.innerHTML = settingsHTML;
        
        // Link the auto trading toggle
        const compactToggle = document.getElementById('compact-trading-toggle');
        const originalToggle = document.getElementById('auto-trading-toggle');
        const statusIndicator = document.getElementById('compact-trading-status');
        const statusText = document.getElementById('compact-trading-text');
        
        if (compactToggle && originalToggle) {
            // Sync the initial state
            compactToggle.checked = originalToggle.checked;
            
            // Update status indicator
            if (compactToggle.checked) {
                statusIndicator.classList.add('status-active');
                statusIndicator.classList.remove('status-inactive');
                statusText.textContent = 'Trading Active';
            } else {
                statusIndicator.classList.add('status-inactive');
                statusIndicator.classList.remove('status-active');
                statusText.textContent = 'Trading Disabled';
            }
            
            // Add event listener to sync toggles
            compactToggle.addEventListener('change', () => {
                originalToggle.checked = compactToggle.checked;
                
                // Trigger the change event on the original toggle
                const event = new Event('change');
                originalToggle.dispatchEvent(event);
                
                // Update status indicator
                if (compactToggle.checked) {
                    statusIndicator.classList.add('status-active');
                    statusIndicator.classList.remove('status-inactive');
                    statusText.textContent = 'Trading Active';
                } else {
                    statusIndicator.classList.add('status-inactive');
                    statusIndicator.classList.remove('status-active');
                    statusText.textContent = 'Trading Disabled';
                }
            });
        }
    }
}

/**
 * Move simulation controls to the compact layout
 */
function moveSimulationControls() {
    const simulationControls = document.getElementById('compact-simulation-controls');
    const originalSimulation = document.querySelector('.form-group')?.textContent.includes('Simulation Mode') ? 
        document.querySelector('.form-group') : null;
    
    if (simulationControls) {
        // Create simulation HTML
        const simulationHTML = `
            <div class="setting-item">
                <div class="setting-label">Simulation Mode</div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.75rem;">Enable paper trading simulation</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="compact-simulation-toggle">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="setting-item">
                <div class="setting-label">Simulation Speed</div>
                <select class="compact-select" id="compact-simulation-speed">
                    <option value="1">1x (Real-time)</option>
                    <option value="5">5x (Fast)</option>
                    <option value="10">10x (Very Fast)</option>
                    <option value="60">60x (Super Fast)</option>
                </select>
            </div>
        `;
        
        simulationControls.innerHTML = simulationHTML;
        
        // Link the simulation toggle
        const compactToggle = document.getElementById('compact-simulation-toggle');
        const originalToggle = document.querySelector('#simulation-mode');
        
        if (compactToggle && originalToggle) {
            // Sync the initial state
            compactToggle.checked = originalToggle.checked;
            
            // Add event listener to sync toggles
            compactToggle.addEventListener('change', () => {
                originalToggle.checked = compactToggle.checked;
                
                // Trigger the change event on the original toggle
                const event = new Event('change');
                originalToggle.dispatchEvent(event);
            });
        }
    }
}

/**
 * Setup tab navigation for the compact layout
 */
function setupTabNavigation() {
    // Tab switching
    const tabs = document.querySelectorAll('.compact-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Activate the clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            const tabContents = document.querySelectorAll('.compact-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // If it's the chart tab, resize the chart
            if (tabId === 'chart-tab') {
                resizeChartToFitContainer();
            }
            
            // Update quick nav to match active tab
            updateQuickNavActive(tabId);
        });
    });
    
    // Quick navigation links
    const quickNavItems = document.querySelectorAll('.quick-nav-item');
    quickNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTabId = item.getAttribute('data-target');
            const targetTab = document.querySelector(`.compact-tab[data-tab="${targetTabId}"]`);
            if (targetTab) {
                targetTab.click();
            }
        });
    });
}

/**
 * Update the active state in the quick navigation menu
 */
function updateQuickNavActive(activeTabId) {
    const quickNavItems = document.querySelectorAll('.quick-nav-item');
    quickNavItems.forEach(item => {
        if (item.getAttribute('data-target') === activeTabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Setup trading control functionality
 */
function setupTradingControls() {
    // This function would implement any specific trading control logic
    // All toggle and button event handlers are already set in moveAutoTradingControls
}

/**
 * Update service status indicators
 */
function updateServiceStatuses() {
    // All service statuses should be cloned from the original UI
    // This function can be used to add additional status refresh logic
}

/**
 * Resize the trading chart to fit its container
 */
function resizeChartToFitContainer() {
    const chartContainer = document.getElementById('compact-chart-container');
    const tradingViewChart = document.getElementById('tradingview-chart');
    
    if (chartContainer && tradingViewChart) {
        const width = chartContainer.clientWidth;
        const height = chartContainer.clientHeight;
        
        if (width > 0 && height > 0) {
            tradingViewChart.style.width = width + 'px';
            tradingViewChart.style.height = height + 'px';
            
            // If TradingView widget has a resize method, call it
            if (window.tradingViewWidget && typeof window.tradingViewWidget.resize === 'function') {
                window.tradingViewWidget.resize(width, height);
            }
        }
    }
}

/**
 * Handle window resize events
 */
function handleWindowResize() {
    // Resize chart if it's the active tab
    const activeTab = document.querySelector('.compact-tab.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'chart-tab') {
        resizeChartToFitContainer();
    }
}

/**
 * Add a toggle button to the default layout
 */
function addToggleButtonToDefault() {
    // Create a fixed position button to switch to compact layout
    const toggleButton = document.createElement('button');
    toggleButton.className = 'layout-toggle-btn default-layout-btn';
    toggleButton.innerHTML = 'Switch to Compact View';
    toggleButton.addEventListener('click', toggleLayout);
    document.body.appendChild(toggleButton);
}

/**
 * Toggle between compact and default layouts
 */
function toggleLayout() {
    const compactContainer = document.querySelector('.compact-container');
    const originalContainer = document.querySelector('.container');
    const isCurrentlyCompact = compactContainer && getComputedStyle(compactContainer).display !== 'none';
    
    if (isCurrentlyCompact) {
        // Switch to default layout
        if (compactContainer) compactContainer.style.display = 'none';
        if (originalContainer) originalContainer.style.display = 'grid';
        
        // If the toggle button in compact layout exists, remove it
        const compactToggleBtn = document.querySelector('.compact-layout-btn');
        if (compactToggleBtn) compactToggleBtn.remove();
        
        // Add toggle button to default layout if it doesn't exist
        if (!document.querySelector('.default-layout-btn')) {
            addToggleButtonToDefault();
        }
        
        // Update local storage preference
        localStorage.setItem('preferCompactLayout', 'false');
    } else {
        // Initialize compact layout if it doesn't exist yet
        if (!compactContainer) {
            initializeCompactLayout();
        } else {
            // Just show the existing compact layout
            compactContainer.style.display = 'grid';
        }
        
        // Hide original container
        if (originalContainer) originalContainer.style.display = 'none';
        
        // Remove default layout toggle button if it exists
        const defaultToggleBtn = document.querySelector('.default-layout-btn');
        if (defaultToggleBtn) defaultToggleBtn.remove();
        
        // Update local storage preference
        localStorage.setItem('preferCompactLayout', 'true');
    }
    
    // Resize charts if we've switched layouts
    setTimeout(resizeChartToFitContainer, 100);
}
