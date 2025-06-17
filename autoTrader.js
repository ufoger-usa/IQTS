class AutoTrader {
    constructor() {
        this.enabled = false;
        this.settings = {
            maxDailyTrades: 5,
            riskPerTrade: 0.02, // 2% risk per trade
            preferredTimeframe: '15m',
            useTrendFilter: true,
            useVolatilityFilter: true,
        };
        
        // Initialize trailing stops map
        this.trailingStops = {};
    }
    
    // Method to optimize strategy based on AI recommendations
    async optimizeStrategy() {
        const analysis = await getAIAnalysis();
        
        if(analysis.top_strategy === 'scalping') {
            this.settings.maxDailyTrades = 15;  // Allow more trades for scalping
            this.settings.preferredTimeframe = '5m';
            this.settings.riskPerTrade = 0.01; // Lower risk per trade for scalping
            
            console.log("Strategy optimized for scalping");
        }
        else if(analysis.top_strategy === 'momentum') {
            this.settings.maxDailyTrades = 8;
            this.settings.preferredTimeframe = '15m';
            this.settings.riskPerTrade = 0.02;
            this.settings.useTrendFilter = true;
            
            console.log("Strategy optimized for momentum trading");
        }
        else if(analysis.top_strategy === 'swing_trading') {
            this.settings.maxDailyTrades = 3;
            this.settings.preferredTimeframe = '1h';
            this.settings.riskPerTrade = 0.03;
            
            console.log("Strategy optimized for swing trading");
        }
        else if(analysis.top_strategy === 'volume_based') {
            this.settings.maxDailyTrades = 7;
            this.settings.preferredTimeframe = '30m';
            this.settings.useVolatilityFilter = true;
            
            console.log("Strategy optimized for volume-based trading");
        }
        else {
            this.settings.maxDailyTrades = 5; // Default
            console.log("Using default strategy settings");
        }
        
        // Update UI elements if they exist
        this.updateUIWithStrategy();
        
        return this.settings;
    }
    
    // Helper method to update UI elements with current strategy
    updateUIWithStrategy() {
        // Update max trades settings if the element exists
        const maxTradesEl = document.getElementById('max-trades-setting');
        if (maxTradesEl) {
            maxTradesEl.value = this.settings.maxDailyTrades;
            maxTradesEl.dispatchEvent(new Event('change'));
        }
        
        // Update preferred timeframe if the element exists
        const timeframeEl = document.getElementById('timeframe-setting');
        if (timeframeEl) {
            timeframeEl.value = this.settings.preferredTimeframe;
            timeframeEl.dispatchEvent(new Event('change'));
        }
        
        // Update risk per trade if the element exists
        const riskEl = document.getElementById('risk-per-trade');
        if (riskEl) {
            riskEl.value = this.settings.riskPerTrade * 100;
            riskEl.dispatchEvent(new Event('change'));
        }
    }
    
    // Method to select the best strategy using machine learning prediction
    async selectStrategy() {
        try {
            // Get current market conditions
            const marketData = await this.getMarketConditions();
            
            // Call ML prediction service
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Prediction service error: ${response.status}`);
            }
            
            // Parse prediction response
            const analysisData = await response.json();
            
            // Map the analysis service response to prediction format
            const prediction = {
                strategy: analysisData.top_strategy,
                confidence: Math.round((Math.max(...Object.values(analysisData.feature_importance)) * 100)),
                top_factor: Object.keys(analysisData.feature_importance).reduce((a, b) => 
                    analysisData.feature_importance[a] > analysisData.feature_importance[b] ? a : b),
                feature_importance: analysisData.feature_importance,
                warnings: analysisData.warnings || []
            };
            
            this.currentStrategy = prediction.strategy;
            this.predictionConfidence = prediction.confidence;
            this.topFactor = prediction.top_factor;
            this.featureImportance = prediction.feature_importance;
            
            console.log(`ML prediction selected strategy: ${this.currentStrategy} (${this.predictionConfidence}% confidence)`);
            
            // Trigger an event for the UI to update
            document.dispatchEvent(new CustomEvent('strategy-prediction-updated', { 
                detail: prediction 
            }));
            
            return prediction;
        } catch (error) {
            console.error('Error selecting strategy:', error);
            // Default to swing strategy on error
            this.currentStrategy = 'swing';
            this.predictionConfidence = 50;
            return { 
                strategy: 'swing', 
                confidence: 50, 
                error: error.message 
            };
        }
    }
    
    // Get current market conditions for prediction
    async getMarketConditions() {
        // In a real implementation, you would gather actual market data from APIs
        // This is a simplified version for demonstration purposes
        return {
            vix: Math.random() * 20 + 10, // Random VIX between 10-30
            volume_ratio: Math.random() * 1.5 + 0.5, // Random volume ratio between 0.5-2.0
            sector_strength: Math.random() * 0.8 + 0.1 // Random sector strength between 0.1-0.9
        };
    }
    
    // Apply a specific strategy based on name
    applyStrategy(strategyName) {
        console.log(`Applying strategy: ${strategyName}`);
        
        // Store the current strategy
        this.currentStrategy = strategyName;
        
        // Configure settings based on strategy
        switch(strategyName.toLowerCase()) {
            case 'swing':
                this.settings.maxDailyTrades = 3;
                this.settings.preferredTimeframe = '1h';
                this.settings.riskPerTrade = 0.03;
                this.settings.useVolatilityFilter = true;
                this.settings.useTrendFilter = true;
                break;
                
            case 'scalp':
                this.settings.maxDailyTrades = 15;
                this.settings.preferredTimeframe = '5m';
                this.settings.riskPerTrade = 0.01;
                this.settings.useVolatilityFilter = true;
                this.settings.useTrendFilter = false;
                break;
                
            case 'ai-optimized':
                this.settings.maxDailyTrades = 8;
                this.settings.preferredTimeframe = '15m';
                this.settings.riskPerTrade = 0.02;
                this.settings.useVolatilityFilter = true;
                this.settings.useTrendFilter = true;
                break;
                
            default:
                // Default to a balanced strategy
                this.settings.maxDailyTrades = 5;
                this.settings.preferredTimeframe = '15m';
                this.settings.riskPerTrade = 0.02;
                this.settings.useVolatilityFilter = true;
                this.settings.useTrendFilter = true;
                break;
        }
        
        // Dispatch event to notify UI of strategy change
        document.dispatchEvent(new CustomEvent('strategy-changed', { 
            detail: { 
                strategy: strategyName,
                settings: this.settings
            }
        }));
        
        return true;
    }
    
    // Method to tune trading parameters using RL
    async tuneParameters() {
        try {
            // Get current market conditions
            const marketData = await this.getCurrentMarketConditions();
            
            // Call RL tuning service
            const response = await fetch('http://localhost:6001/get-params', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Market-Data': JSON.stringify(this.currentMarketConditions)
                },
                body: JSON.stringify(marketData)
            });
            
            if (!response.ok) {
                throw new Error(`RL service error: ${response.status}`);
            }
            
            // Parse response to get optimized parameters
            const {stop_loss, take_profit, position_size} = await response.json();
            
            // Update trading parameters
            this.updateParameters({
                stopLoss: stop_loss,
                takeProfit: take_profit,
                positionSize: position_size
            });
            
            console.log(`Parameters tuned: SL=${stop_loss.toFixed(2)}, TP=${take_profit.toFixed(2)}, Size=${position_size.toFixed(2)}%`);
            
            // Notify UI about parameter changes
            document.dispatchEvent(new CustomEvent('parameters-updated', {
                detail: {
                    stopLoss: stop_loss,
                    takeProfit: take_profit,
                    positionSize: position_size
                }
            }));
            
            return {stop_loss, take_profit, position_size};
        } catch (error) {
            console.error('Error tuning parameters:', error);
            return null;
        }
    }
    
    // Get current market conditions for the RL service
    async getCurrentMarketConditions() {
        // In a real implementation, you would gather actual market data
        // This is a simplified version for demonstration
        const volatility = this.getMarketVolatility();
        
        // Get recent strategy performance from optimization engine if available
        const strategyPerformance = this.getStrategyPerformance();
        
        return {
            volatility,
            strategy_performance: strategyPerformance
        };
    }
    
    // Get market volatility (simplified version)
    getMarketVolatility() {
        // In reality, this would calculate actual market volatility
        // For demo, use a value between 10-50 based on time of day
        const hour = new Date().getHours();
        const marketOpen = (hour >= 9 && hour < 16); // Market hours 9am-4pm
        
        if (marketOpen) {
            // Higher volatility during market hours
            return 20 + Math.random() * 30;
        } else {
            // Lower volatility outside market hours
            return 10 + Math.random() * 15;
        }
    }
    
    // Get strategy performance (simplified version)
    getStrategyPerformance() {
        // In reality, this would come from actual strategy performance metrics
        // For demo purposes, generate some values
        return {
            swing: Math.random() * 0.6 - 0.3,  // Range: -0.3 to 0.3
            scalp: Math.random() * 0.6 - 0.3,  // Range: -0.3 to 0.3
            ai: Math.random() * 0.8 - 0.2      // Range: -0.2 to 0.6 (slightly biased positive)
        };
    }
    
    // Update trading parameters
    updateParameters(params) {
        // Store previous values for change calculation
        const prevStopLoss = this.settings.stopLoss || 2.0;
        const prevTakeProfit = this.settings.takeProfit || 4.0;
        const prevPositionSize = this.settings.positionSize || 2.0;
        
        // Update settings with new parameter values
        this.settings.stopLoss = params.stopLoss;
        this.settings.takeProfit = params.takeProfit;
        this.settings.positionSize = params.positionSize;
        this.settings.riskPerTrade = params.positionSize / 100; // Convert to decimal
        
        // Calculate percentage changes
        const stopLossChange = ((this.settings.stopLoss / prevStopLoss - 1) * 100).toFixed(1);
        const takeProfitChange = ((this.settings.takeProfit / prevTakeProfit - 1) * 100).toFixed(1);
        const positionSizeChange = ((this.settings.positionSize / prevPositionSize - 1) * 100).toFixed(1);
        
        // Save changes for display
        this.parameterChanges = {
            stopLoss: stopLossChange > 0 ? `+${stopLossChange}%` : `${stopLossChange}%`,
            takeProfit: takeProfitChange > 0 ? `+${takeProfitChange}%` : `${takeProfitChange}%`,
            positionSize: positionSizeChange > 0 ? `+${positionSizeChange}%` : `${positionSizeChange}%`
        };
        
        // Return the updated parameters
        return this.settings;
    }
}

// Initialize AutoTrader if it doesn't exist
if (typeof window.autoTrader === 'undefined') {
    window.autoTrader = new AutoTrader();
    console.log("AutoTrader initialized with AI optimization capability");
}
