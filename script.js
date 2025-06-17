// Script uses EnhancedTelegramService from telegram-enhanced.js
// This ensures we have a single implementation of Telegram functionality

// AI Trade Analysis Function
async function getAIAnalysis() {
    try {
        const response = await fetch('http://localhost:8000/analyze');
        const insights = await response.json();
        
        document.getElementById('ai-best-strategy').textContent = insights.top_strategy;
        document.getElementById('ai-warning').textContent = insights.warnings[0] || "All good!";
        
        return insights;    } catch (error) {
        console.error('AI Analysis service connection error:', error);
        return { 
            top_strategy: 'unavailable', 
            warnings: ['Analysis service not connected'] 
        };
    }
}

// Extension functions for the existing AutoTrader class
function extendAutoTraderWithTrailingStops() {
    if (typeof autoTrader === 'undefined') {
        console.error('AutoTrader not found, cannot extend with trailing stops');
        return;
    }
    
    // Initialize trailing stops map if it doesn't exist
    if (!autoTrader.trailingStops) {
        autoTrader.trailingStops = {};
    }
    
    // Add updateTrailingStop method to AutoTrader
    autoTrader.updateTrailingStop = async function(symbol, currentPrice) {
        const stopData = this.trailingStops[symbol];
        if (!stopData) return;
        
        // Calculate new stop price (using the configured trail percent)
        const trailPercent = stopData.trailPercent || 0.01; // Default to 1%
        const newStop = currentPrice * (1 - trailPercent);
        
        // Only update if the new stop price is higher (for long positions)
        if (newStop > stopData.currentStop) {
            stopData.currentStop = newStop;            try {
                if (!alpacaClient) {
                    console.error(`Cannot update trailing stop for ${symbol}: alpacaClient not available`);
                    return;
                }
                
                await alpacaClient.replaceOrder(stopData.stopOrderId, {
                    stop_price: newStop.toFixed(2)
                });
                
                if (typeof TelegramService !== 'undefined') {
                    await TelegramService.send(`🔵 Trailing stop updated for ${symbol}: ${newStop.toFixed(2)}`);
                }
            } catch (error) {
                console.error(`Error updating trailing stop for ${symbol}:`, error);
                if (typeof TelegramService !== 'undefined') {
                    await TelegramService.send(`❌ Error updating trailing stop for ${symbol}: ${error.message}`);
                }
            }
        }
    };
    
    // Add method to register new trailing stops
    autoTrader.registerTrailingStop = function(symbol, orderId, initialPrice, trailPercent = 0.01) {
        this.trailingStops[symbol] = {
            stopOrderId: orderId,
            initialPrice: initialPrice,
            currentStop: initialPrice * (1 - trailPercent),
            trailPercent: trailPercent
        };
        console.log(`Registered trailing stop for ${symbol} at ${initialPrice * (1 - trailPercent)}`);
    };
}

// Enhance AutoTrader placeTrade method
async function enhanceAutoTrader() {
    // Check if autoTrader is defined before enhancing
    if (typeof autoTrader === 'undefined') {
        console.error('AutoTrader not found, cannot enhance. Make sure it is initialized before this script runs.');
        return;
    }
    
    if (autoTrader.placeTrade) {
        // Add trailing stops functionality
        extendAutoTraderWithTrailingStops();
        
        // Store the original placeTrade method
        const originalPlaceTrade = autoTrader.placeTrade;
          // Override placeTrade to add Telegram notifications, trailing stops, and simulation
        autoTrader.placeTrade = async function(signal) {
            if (!this.canPlaceTrade(signal.confidence)) return;
            
            // Check if in simulation mode
            const simulationMode = document.getElementById('simulation-mode')?.checked;
            
            if (simulationMode) {
                // Run the trade through simulation engine
                const result = await simulationEngine.simulateTrade(signal);
                TelegramService.send(`🧪 SIMULATION: ${signal.symbol} P/L: $${result.toFixed(2)}`);
                return;
            }
            
            try {
                // Call original method
                const order = await originalPlaceTrade.call(this, signal);
                  if (order) {
                    // Send Telegram notification on successful trade if TelegramService is available
                    if (typeof TelegramService !== 'undefined') {
                        await TelegramService.send(
                            `${signal.type.toUpperCase()} ${signal.symbol} ${order.qty} @ ${order.filled_avg_price || signal.price}`
                        );
                    }
                    
                    // If it's a buy order and we have trailing stops set up, register the stop order
                    if (signal.type.toLowerCase() === 'buy' && order.stopOrderId) {
                        // Get the trail percent from settings or use default
                        const trailPercent = (this.settings && this.settings.trailPercent) || 0.01;
                        
                        // Register the trailing stop
                        this.registerTrailingStop(
                            signal.symbol, 
                            order.stopOrderId, 
                            order.filled_avg_price || signal.price,
                            trailPercent
                        );
                        
                        if (typeof TelegramService !== 'undefined') {
                            await TelegramService.send(
                                `🔹 Trailing stop (${trailPercent * 100}%) set for ${signal.symbol}`
                            );
                        }
                    }
                    
                    return order;
                }            } catch (error) {
                // Send error notification if TelegramService is available
                if (typeof TelegramService !== 'undefined') {
                    await TelegramService.send(`❌ FAILED: ${signal.symbol} - ${error.message}`);
                }
                console.error("Trade error:", error);
                return null;
            }
        };
    } else {
        console.error("AutoTrader not found or missing placeTrade method");
    }
}

// Consolidated function to update trailing stops and check profit targets when prices change
function setupPriceUpdateHandlers() {
    // Check if we have an existing price update function to hook into
    if (typeof window.onPriceUpdate === 'function') {
        // Store the original function
        const originalOnPriceUpdate = window.onPriceUpdate;
        
        // Override with our function that calls the original and also handles our updates
        window.onPriceUpdate = function(symbol, price, change) {
            // Call the original handler first
            originalOnPriceUpdate(symbol, price, change);
            
            // Update trading features if autoTrader is available
            if (typeof autoTrader !== 'undefined') {
                // Update trailing stop if implemented
                if (autoTrader.updateTrailingStop) {
                    autoTrader.updateTrailingStop(symbol, price);
                }
                
                // Check profit targets if implemented
                if (autoTrader.checkProfitTargets) {
                    autoTrader.checkProfitTargets(symbol, price);
                }
            }
        };
    } else {
        // If no existing handler, create one that handles all our needs
        window.onPriceUpdate = function(symbol, price, change) {
            if (typeof autoTrader !== 'undefined') {
                // Update trailing stop if implemented
                if (autoTrader.updateTrailingStop) {
                    autoTrader.updateTrailingStop(symbol, price);
                }
                
                // Check profit targets if implemented
                if (autoTrader.checkProfitTargets) {
                    autoTrader.checkProfitTargets(symbol, price);
                }
            }
        };
    }
    
    console.log("Price update handlers for trailing stops and profit-taking initialized");
}

// Function to extend AutoTrader with profit-taking capabilities
function extendAutoTraderWithProfitTaking() {
    if (typeof autoTrader === 'undefined') {
        console.error('AutoTrader not found, cannot extend with profit taking');
        return;
    }
      // Initialize profit-taking and safety systems if they don't exist and classes are available
    if (!autoTrader.profitTaking) {
        if (typeof ProfitTaking === 'undefined') {
            console.error('ProfitTaking class not found. Make sure profitTaking.js is loaded.');
        } else {
            autoTrader.profitTaking = new ProfitTaking();
            autoTrader.profitTaking.loadSettings();
        }
    }
    
    if (!autoTrader.safetyChecks) {
        if (typeof SafetyChecks === 'undefined') {
            console.error('SafetyChecks class not found. Make sure profitTaking.js is loaded.');
        } else {
            autoTrader.safetyChecks = new SafetyChecks();
            autoTrader.safetyChecks.loadSettings();
        }
    }
    
    // Track open positions
    if (!autoTrader.positions) {
        autoTrader.positions = {};
    }
    
    // Method to check and take profits on positions
    autoTrader.checkProfitTargets = async function(symbol, currentPrice) {
        const position = this.positions[symbol];
        if (!position || position.side !== 'long') return false;
        
        const entryPrice = position.entryPrice;
        let targetHit = false;
        
        // Check targets in order (full, partial2, partial1)
        // This ensures we take the largest profit if multiple targets are hit
        if (this.profitTaking.checkProfitTarget(entryPrice, currentPrice, 'full')) {
            // Take full profit (exit entire remaining position)
            targetHit = await this.takeProfitAt(symbol, currentPrice, 'full');
        }
        else if (this.profitTaking.checkProfitTarget(entryPrice, currentPrice, 'partial2')) {
            // Take partial profit at target 2
            targetHit = await this.takeProfitAt(symbol, currentPrice, 'partial2');
        }
        else if (this.profitTaking.checkProfitTarget(entryPrice, currentPrice, 'partial1')) {
            // Take partial profit at target 1
            targetHit = await this.takeProfitAt(symbol, currentPrice, 'partial1');
        }
        
        return targetHit;
    };
    
    // Method to execute a profit-taking order
    autoTrader.takeProfitAt = async function(symbol, currentPrice, targetLevel) {
        try {
            const position = this.positions[symbol];
            if (!position) return false;
            
            // Calculate how many shares to sell
            const sellQty = this.profitTaking.calculateSellQuantity(position, targetLevel);
            if (sellQty <= 0) return false;
            
            // Create sell order
            const orderParams = {
                symbol: symbol,
                qty: sellQty.toString(),
                side: 'sell',
                type: 'market',
                time_in_force: 'day'
            };
              // Check if alpacaClient is available
            if (!alpacaClient) {
                console.error(`Cannot execute order for ${symbol}: alpacaClient not available`);
                return false;
            }
            
            // Execute the order
            const order = await alpacaClient.makeRequest('orders', 'POST', orderParams);
            
            // Update position record
            position.qty -= sellQty;
            if (position.qty <= 0) {
                delete this.positions[symbol]; // Position closed
            }
            
            // Calculate profit
            const profit = (currentPrice - position.entryPrice) * sellQty;
            const profitPercent = ((currentPrice / position.entryPrice) - 1) * 100;
            
            // Send notification if TelegramService is available
            if (typeof TelegramService !== 'undefined') {
                await TelegramService.send(
                    `💰 PROFIT TAKEN at ${targetLevel}: ${symbol}\n` +
                    `${sellQty} shares @ $${currentPrice.toFixed(2)}\n` +
                    `Profit: $${profit.toFixed(2)} (${profitPercent.toFixed(2)}%)`
                );
            }
            
            console.log(`Profit taken at ${targetLevel} for ${symbol}: ${sellQty} shares at $${currentPrice}`);
            return true;
              } catch (error) {
            console.error(`Error taking profit for ${symbol}:`, error);
            if (typeof TelegramService !== 'undefined') {
                await TelegramService.send(`❌ Error taking profit for ${symbol}: ${error.message}`);
            }
            return false;
        }
    };
    
    // Method to check if trading is safe based on market conditions
    autoTrader.isTradingSafe = function() {
        // Get current VIX value and portfolio drawdown
        // These would normally come from your market data provider
        const vixValue = this.getMarketVix ? this.getMarketVix() : 15;
        const portfolioDrawdown = this.getPortfolioDrawdown ? this.getPortfolioDrawdown() : 0;
        
        return this.safetyChecks.isMarketSafe(vixValue, portfolioDrawdown);
    };
    
    // Override canPlaceTrade to include safety checks
    const originalCanPlaceTrade = autoTrader.canPlaceTrade;
    autoTrader.canPlaceTrade = function(confidenceScore) {
        // First check safety conditions
        if (!this.isTradingSafe()) {
            console.log("Trading halted due to safety conditions");
            return false;
        }
        
        // Then perform original checks
        return originalCanPlaceTrade.call(this, confidenceScore);
    };
    
    // Method to handle emergency stop
    autoTrader.emergencyStop = async function(reason = "Emergency stop triggered") {
        try {
            // Activate emergency mode
            this.safetyChecks.toggleEmergencyMode(true);
            
            // Close all positions
            const positions = Object.keys(this.positions);
            for (const symbol of positions) {
                try {
                    const position = this.positions[symbol];
                    const orderParams = {
                        symbol: symbol,
                        qty: position.qty.toString(),
                        side: position.side === 'long' ? 'sell' : 'buy',
                        type: 'market',
                        time_in_force: 'day'
                    };
                      if (!alpacaClient) {
                        console.error(`Cannot close position for ${symbol}: alpacaClient not available`);
                    } else {
                        await alpacaClient.makeRequest('orders', 'POST', orderParams);
                        delete this.positions[symbol];
                    }
                } catch (posError) {
                    console.error(`Error closing position for ${symbol}:`, posError);
                }
            }
            
            // Send notification if TelegramService is available
            if (typeof TelegramService !== 'undefined') {
                await TelegramService.send(`🚨 EMERGENCY STOP: ${reason}\nAll positions closed. Trading halted.`);
            }
            console.log("Emergency stop executed: " + reason);
            return true;
            
        } catch (error) {
            console.error("Error executing emergency stop:", error);
            return false;
        }
    };
}

// The setupProfitTakingHandlers functionality has been consolidated into setupPriceUpdateHandlers
// to avoid duplicate event handlers and potential conflicts

// Function to load Alpaca credentials from file when UI method fails
async function loadAlpacaCredentialsFromFile() {
    try {
        // Check if document is fully loaded
        if (document.readyState !== 'complete') {
            console.log('Document not fully loaded yet. Please wait and try again.');
            alert('Please wait for the page to fully load before connecting to Alpaca.');
            return false;
        }
        
        // Check if we already have a connection
        if (typeof alpacaClient !== 'undefined' && alpacaClient !== null && typeof alpacaConnected !== 'undefined' && alpacaConnected === true) {
            console.log('Alpaca connection already established');
            return true;
        }
        
        console.log('Attempting to load Alpaca credentials from file...');
        
        // Try to fetch the credentials from a separate credentials file
        const response = await fetch('alpaca-credentials.json');
        
        if (!response.ok) {
            console.error('Failed to load Alpaca credentials file');
            return false;
        }
        
        const credentials = await response.json();
          if (!credentials.paper || !credentials.paper.keyId || !credentials.paper.secretKey) {
            console.error('Invalid Alpaca credentials format in file');
            return false;
        }
        
        // Make sure the connectAlpaca function is available        
        try {
            if (typeof window.connectAlpaca === 'function') {
                // Connect using the loaded credentials
                console.log('Connecting to Alpaca using credentials from file...');
                console.log('Key ID available:', !!credentials.paper.keyId);
                console.log('Secret key available:', !!credentials.paper.secretKey);
                
                // Add a small delay to ensure the UI has fully initialized
                setTimeout(() => {
                    window.connectAlpaca('paper', credentials.paper.keyId, credentials.paper.secretKey);
                }, 500);
                
                return true;
            } else {
                console.error('connectAlpaca function not found. Wait for the main UI to load completely before trying again.');
                console.log('Available window functions:', Object.keys(window).filter(key => typeof window[key] === 'function').slice(0, 20));
                alert('Error: The Alpaca connection system is not yet ready. Please wait for the page to fully load and try again.');
                return false;
            }
        } catch (err) {
            console.error('Error in alternative Alpaca connection method:', err);
            alert(`Error connecting to Alpaca: ${err.message}`);
            return false;
        }
    } catch (error) {
        console.error('Error loading Alpaca credentials from file:', error);
        return false;
    }
}

// Quantum Optimization Integration
async function integrateQuantumOptimization() {
    try {
        // Check if quantum optimizer is available
        if (!window.hybridOptimizer) {
            console.warn('Quantum optimizer not initialized');
            return false;
        }
        
        // Get trading strategies from current system
        const strategies = await getActiveStrategies();
        
        if (!strategies || !strategies.length) {
            console.warn('No active strategies found for quantum optimization');
            return false;
        }
        
        // Expose strategies for the optimizer to use
        window.tradingStrategies = strategies.map(strategy => ({
            id: strategy.id,
            performance: strategy.performance || strategy.profitFactor || 0,
            correlation: strategy.correlation || {}
        }));
        
        // Initialize quantum dashboard if not already done
        if (window.quantumDashboard && !window.quantumDashboardInitialized) {
            initQuantumDashboardUI();
            window.quantumDashboardInitialized = true;
        }
        
        return true;
    } catch (error) {
        console.error('Error integrating quantum optimization:', error);
        return false;
    }
}

// Get active trading strategies for quantum optimization
async function getActiveStrategies() {
    // Pull strategies from global state or fetch from API
    if (window.strategies && window.strategies.length > 0) {
        return window.strategies;
    }
    
    try {
        // Try to fetch strategies from evolution service
        const response = await fetch('http://localhost:7000/strategies');
        if (!response.ok) {
            throw new Error(`Service returned ${response.status}`);
        }
        
        const data = await response.json();
        return data.strategies || [];
    } catch (error) {
        console.error('Failed to fetch strategies:', error);
        
        // Fallback to default strategies
        return [
            { id: 'macd_crossover', performance: 0.65 },
            { id: 'rsi_divergence', performance: 0.72 },
            { id: 'bollinger_breakout', performance: 0.58 },
            { id: 'volume_profile', performance: 0.63 }
        ];
    }
}

// Initialize quantum dashboard UI
function initQuantumDashboardUI() {
    // Create container if not exists
    let quantumPanel = document.getElementById('quantum-optimization');
    
    if (!quantumPanel) {
        // Locate main panel container to append to
        const mainPanel = document.querySelector('.control-panel') || document.body;
        
        // Create quantum panel
        quantumPanel = document.createElement('div');
        quantumPanel.id = 'quantum-optimization';
        quantumPanel.className = 'panel';
        
        // Add quantum dashboard HTML
        quantumPanel.innerHTML = `
            <h3>Quantum Optimization</h3>
            <div class="quantum-status">
                <span>Status:</span>
                <span id="quantum-state">Initializing...</span>
            </div>
            <div class="qbits"></div>
            <div class="quantum-controls">
                <div class="auto-apply-container">
                    <label for="quantum-auto-apply">Auto-apply results</label>
                    <label class="switch">
                        <input type="checkbox" id="quantum-auto-apply">
                        <span class="slider"></span>
                    </label>
                </div>
                <button id="run-quantum">Optimize Portfolio</button>
            </div>
            <div id="quantum-results">
                <p>Run quantum optimization to get strategy recommendations.</p>
            </div>
        `;
        
        // Append to main panel
        mainPanel.appendChild(quantumPanel);
    }
}

// Apply strategy weights from quantum optimization
function applyStrategyWeights(weights) {
    if (!weights) return;
    
    console.log('Applying quantum-optimized strategy weights:', weights);
    
    // Save optimized weights to localStorage
    localStorage.setItem('optimizedStrategyWeights', JSON.stringify(weights));
    
    // Apply weights to active strategies
    Object.entries(weights).forEach(([strategyId, weight]) => {
        // Find the strategy in the global strategies array
        const strategy = window.strategies?.find(s => s.id === strategyId);
        if (strategy) {
            strategy.weight = weight;
            console.log(`Updated ${strategyId} weight to ${weight}`);
        }
    });
    
    // Notify strategy manager about updates
    if (window.updateStrategyWeights) {
        window.updateStrategyWeights(weights);
    }
    
    // Save best strategy to file via API
    fetch('http://localhost:7000/save-best-strategy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            weights: weights,
            source: 'quantum_optimization',
            timestamp: new Date().toISOString()
        })
    }).catch(error => {
        console.error('Failed to save optimized strategy:', error);
    });
    
    return true;
}

// Expose function for quantum dashboard
window.applyStrategyWeights = applyStrategyWeights;

// Compact Layout Integration
function updateCompactLayoutMetrics() {
    try {
        // Update profit today
        const profitTodayElement = document.getElementById('compact-profit-today');
        if (profitTodayElement) {
            const originalProfitToday = document.querySelector('[data-metric="profit-today"]');
            if (originalProfitToday) {
                profitTodayElement.textContent = originalProfitToday.textContent;
                
                // Add appropriate class based on value
                if (parseFloat(originalProfitToday.textContent) >= 0) {
                    profitTodayElement.classList.add('positive-value');
                    profitTodayElement.classList.remove('negative-value');
                } else {
                    profitTodayElement.classList.add('negative-value');
                    profitTodayElement.classList.remove('positive-value');
                }
            }
        }
        
        // Update win rate
        const winRateElement = document.getElementById('compact-win-rate');
        if (winRateElement) {
            const originalWinRate = document.querySelector('[data-metric="win-rate"]');
            if (originalWinRate) {
                winRateElement.textContent = originalWinRate.textContent;
            }
        }
        
        // Update average profit
        const avgProfitElement = document.getElementById('compact-avg-profit');
        if (avgProfitElement) {
            const originalAvgProfit = document.querySelector('[data-metric="avg-profit"]');
            if (originalAvgProfit) {
                avgProfitElement.textContent = originalAvgProfit.textContent;
                
                // Add appropriate class based on value
                const value = parseFloat(originalAvgProfit.textContent.replace(/[^-0-9.]/g, ''));
                if (value >= 0) {
                    avgProfitElement.classList.add('positive-value');
                    avgProfitElement.classList.remove('negative-value');
                } else {
                    avgProfitElement.classList.add('negative-value');
                    avgProfitElement.classList.remove('positive-value');
                }
            }
        }
        
        // Update total trades
        const totalTradesElement = document.getElementById('compact-total-trades');
        if (totalTradesElement) {
            const originalTotalTrades = document.querySelector('[data-metric="total-trades"]');
            if (originalTotalTrades) {
                totalTradesElement.textContent = originalTotalTrades.textContent;
            }
        }
        
        // Update trading status
        const compactTradingToggle = document.getElementById('compact-trading-toggle');
        const statusIndicator = document.getElementById('compact-trading-status');
        const statusText = document.getElementById('compact-trading-text');
        
        if (compactTradingToggle && statusIndicator && statusText) {
            if (compactTradingToggle.checked) {
                statusIndicator.classList.add('status-active');
                statusIndicator.classList.remove('status-inactive');
                statusText.textContent = 'Trading Active';
            } else {
                statusIndicator.classList.add('status-inactive');
                statusIndicator.classList.remove('status-active');
                statusText.textContent = 'Trading Disabled';
            }
        }
    } catch (error) {
        console.error('Error updating compact layout metrics:', error);
    }
}

// Add compact layout update to the periodic metrics refresh
function setupCompactLayoutUpdates() {
    // Set up periodic updates for compact layout metrics
    setInterval(updateCompactLayoutMetrics, 5000);
    
    // Initial update
    updateCompactLayoutMetrics();
}

// Initialize compact layout updates when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Delay to ensure compact layout is initialized
    setTimeout(setupCompactLayoutUpdates, 1500);
});

// Initialize quantum integration when document is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        await integrateQuantumOptimization();
    }, 1000); // Delay to ensure other components are loaded
});

// Initialize when document is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if required dependencies are loaded
        if (typeof autoTrader === 'undefined') {
            console.error('AutoTrader not found. Make sure it is initialized before enhancing.');
            return;
        }

        // Check if Alpaca is connected and try alternative method if not
        if ((typeof alpacaConnected === 'undefined' || alpacaConnected === false) && 
            (typeof alpacaClient === 'undefined' || alpacaClient === null)) {
            // Try to load Alpaca credentials from file if the UI method failed
            console.log('Alpaca not connected. Trying alternative connection method...');
            await loadAlpacaCredentialsFromFile();
            
            // Add a button to the UI to trigger the alternative connection method
            setTimeout(() => {
                try {
                    const traderPanel = document.querySelector('.auto-trading-panel') || document.querySelector('.panel');
                    if (traderPanel) {
                        const altConnectBtn = document.createElement('button');
                        altConnectBtn.textContent = 'Connect Alpaca (Alternative)';
                        altConnectBtn.className = 'btn';
                        altConnectBtn.style.marginTop = '10px';
                        altConnectBtn.addEventListener('click', loadAlpacaCredentialsFromFile);
                        traderPanel.appendChild(altConnectBtn);
                    }
                } catch (e) {
                    console.error('Error adding alternative connection button:', e);
                }
            }, 2000);
        }
        
        enhanceAutoTrader();
        extendAutoTraderWithProfitTaking();
        setupPriceUpdateHandlers();
        console.log("AutoTrader enhancements loaded successfully");
    } catch (error) {
        console.error("Error initializing AutoTrader enhancements:", error);
    }
});

// Function to update all stats regardless of layout
function updateAllStats() {
    // Update standard stats with whatever logic is already here
    
    // Also update compact layout stats if they exist
    if (typeof updateCompactStats === 'function') {
        updateCompactStats();
    }
}

// Call updateAllStats periodically to keep both layouts in sync
setInterval(updateAllStats, 10000); // Update every 10 seconds
