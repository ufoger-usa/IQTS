// Telegram Bot Command Interface
// Note: This is a browser-based implementation since we're in a web app context
// For a true node-telegram-bot-api implementation, this would need to be server-side

// Function to fetch data from AI analysis service
async function fetchAIAnalysis() {
    try {
        const response = await fetch('http://localhost:8000/analyze');
        return await response.json();
    } catch (error) {
        console.error('Error fetching AI analysis:', error);
        return { 
            top_strategy: 'unavailable', 
            warnings: ['Analysis service error'] 
        };
    }
}

// Function to get ML strategy prediction
async function getStrategyPrediction() {
    try {
        if (!autoTrader) {
            return {
                strategy: 'unknown',
                confidence: 0,
                top_factor: 'none'
            };
        }
        
        // Use AutoTrader's selectStrategy method to get a prediction
        const prediction = await autoTrader.selectStrategy();
        return prediction;
    } catch (error) {
        console.error('Error getting strategy prediction:', error);
        return {
            strategy: 'error',
            confidence: 0,
            error: error.message
        };
    }
}

// Function to get current trading parameters
async function getCurrentParameters() {
    try {
        if (!autoTrader) {
            return {
                stop_loss: 2.0,
                take_profit: 4.0,
                position_size: 2.0
            };
        }
        
        // Get current parameters from AutoTrader settings
        return {
            stop_loss: autoTrader.settings.stopLoss || 2.0,
            take_profit: autoTrader.settings.takeProfit || 4.0,
            position_size: autoTrader.settings.positionSize || 2.0
        };
    } catch (error) {
        console.error('Error getting current parameters:', error);
        return {
            stop_loss: 2.0,
            take_profit: 4.0,
            position_size: 2.0,
            error: error.message
        };
    }
}

const TelegramBot = {
    // Store command handlers
    commands: {},
    
    // Initialize bot
    init(token) {
        this.token = token || "8181620031:AAG-CBhE6qu3zoQuCvHtWOawyCSEfnnLwWQ";
        this.chatId = "1399354687";
        
        // Start polling for commands
        this.startPolling();
        
        // Register default commands
        this.registerCommands();
    },
    
    // Strategy alerts - This sends alerts about best strategy
    sendBestStrategyAlert() {
        if (!optimizationEngine) return;
        
        try {
            const best = optimizationEngine.getBestStrategy();
            this.sendMessage(this.chatId,
                `🏆 Current Best Strategy: ${best.name}\n` +
                `30-Day Profit: ${best.profit}\n` +
                `Recommended Allocation: ${best.allocation}`
            );
        } catch (err) {
            console.error('Error sending strategy alert:', err);
        }
    },
    
    // Register command handlers
    registerCommands() {
        // Command: /analyze
        this.onText(/\/analyze/, async (msg) => {
            const analysis = await fetchAIAnalysis();  // Calls your Python service
            
            this.sendMessage(
                msg.chat.id, 
                `🧠 AI Analysis:
Most Profitable: ${analysis.top_strategy}
Warning: ${analysis.warnings[0] || "None"}
`
            );
        });        // Command: /beststrategy
        this.onText(/\/beststrategy/, (msg) => {
            const best = optimizationEngine.getBestStrategy();
            this.sendMessage(msg.chat.id, 
                `🏆 Current Best Strategy: ${best.name}\n` +
                `30-Day Profit: ${best.profit}\n` +
                `Recommended Allocation: ${best.allocation}`
            );
        });
          // Command: /predict - Get ML strategy prediction
        this.onText(/\/predict/, async (msg) => {
            const prediction = await getStrategyPrediction();
            this.sendMessage(msg.chat.id, 
                `🧠 Strategy Prediction:\n` +
                `Recommended: ${prediction.strategy}\n` +
                `Confidence: ${prediction.confidence}%\n` +
                `Key Factor: ${prediction.top_factor}`
            );
        });
        
        // Command: /mlenable - Enable ML auto strategy selection
        this.onText(/\/mlenable/, (msg) => {
            // Update global ML setting
            mlAutoSelectEnabled = true;
            
            // Update UI if available
            const mlToggle = document.getElementById('ml-auto-select-toggle');
            if (mlToggle) {
                mlToggle.checked = true;
                updateToggleStatus(true);
            }
            
            // Save preference
            localStorage.setItem('mlAutoSelectEnabled', 'true');
            
            // Run prediction immediately
            runAndApplyPrediction();
            
            this.sendMessage(msg.chat.id, 
                `✅ ML strategy auto-selection ENABLED\n` +
                `The system will now automatically select strategies based on ML predictions.`
            );
        });
          // Command: /mldisable - Disable ML auto strategy selection
        this.onText(/\/mldisable/, (msg) => {
            // Update global ML setting
            mlAutoSelectEnabled = false;
            
            // Update UI if available
            const mlToggle = document.getElementById('ml-auto-select-toggle');
            if (mlToggle) {
                mlToggle.checked = false;
                updateToggleStatus(false);
            }
            
            // Save preference
            localStorage.setItem('mlAutoSelectEnabled', 'false');
            
            this.sendMessage(msg.chat.id, 
                `❌ ML strategy auto-selection DISABLED\n` +
                `The system will no longer automatically switch strategies.`
            );
        });
        
        // Command: /params - Get current trading parameters
        this.onText(/\/params/, async (msg) => {
            const params = await getCurrentParameters();
            this.sendMessage(msg.chat.id, 
                `📊 Current Parameters:\n` +
                `Stop Loss: ${params.stop_loss.toFixed(2)}%\n` +
                `Take Profit: ${params.take_profit.toFixed(2)}%\n` +
                `Position Size: ${params.position_size.toFixed(2)}%`
            );
        });
        
        // Command: /rlenable - Enable auto parameter tuning
        this.onText(/\/rlenable/, (msg) => {
            // Update UI if available
            const rlToggle = document.getElementById('auto-tune-toggle');
            if (rlToggle) {
                rlToggle.checked = true;
                // The change event will handle updating UI
                rlToggle.dispatchEvent(new Event('change'));
            }
            
            // Save preference
            localStorage.setItem('autoTuneEnabled', 'true');
            
            // Run tuning immediately if possible
            if (window.rlTuning && window.rlTuning.manualTuneParameters) {
                window.rlTuning.manualTuneParameters();
            }
            
            this.sendMessage(msg.chat.id, 
                `✅ Automatic parameter tuning ENABLED\n` +
                `The system will now automatically tune trading parameters using RL.`
            );
        });
        
        // Command: /rldisable - Disable auto parameter tuning
        this.onText(/\/rldisable/, (msg) => {
            // Update UI if available
            const rlToggle = document.getElementById('auto-tune-toggle');
            if (rlToggle) {
                rlToggle.checked = false;
                // The change event will handle updating UI
                rlToggle.dispatchEvent(new Event('change'));
            }
            
            // Save preference
            localStorage.setItem('autoTuneEnabled', 'false');
            
            this.sendMessage(msg.chat.id, 
                `❌ Automatic parameter tuning DISABLED\n` +
                `The system will no longer automatically adjust parameters.`
            );
        });
        
        // Command: /status
        this.onText(/\/status/, (msg) => {
            const status = autoTrader.enabled ? "✅ RUNNING" : "❌ PAUSED";
            
            // Check if tradeLogger exists and has the getTodaysTrades method
            let tradesCount = 0;
            if (typeof tradeLogger !== 'undefined' && typeof tradeLogger.getTodaysTrades === 'function') {
                tradesCount = tradeLogger.getTodaysTrades().length;
            } else {
                console.log("tradeLogger not available, using default value for trades count");
            }
            
            this.sendMessage(
                msg.chat.id, 
                `Bot Status: ${status}\nToday's Trades: ${tradesCount}`
            );
        });
          // Command: /pause
        this.onText(/\/pause/, (msg) => {
            if (typeof autoTrader !== 'undefined') {
                autoTrader.enabled = false;
                console.log("Auto trader paused via Telegram command");
                
                // Also update UI if possible
                const autoTradingToggle = document.getElementById('auto-trading-toggle');
                if (autoTradingToggle) {
                    autoTradingToggle.checked = false;
                    // Trigger change event to update UI
                    const event = new Event('change');
                    autoTradingToggle.dispatchEvent(event);
                }
                
                this.sendMessage(msg.chat.id, "🛑 Bot paused. Use /resume to restart.");
            } else {
                console.error("autoTrader object not available");
                this.sendMessage(msg.chat.id, "⚠️ Could not pause bot: AutoTrader not available");
            }
        });
        
        // Command: /resume
        this.onText(/\/resume/, (msg) => {
            if (typeof autoTrader !== 'undefined') {
                autoTrader.enabled = true;
                console.log("Auto trader resumed via Telegram command");
                
                // Also update UI if possible
                const autoTradingToggle = document.getElementById('auto-trading-toggle');
                if (autoTradingToggle) {
                    autoTradingToggle.checked = true;
                    // Trigger change event to update UI
                    const event = new Event('change');
                    autoTradingToggle.dispatchEvent(event);
                }
                
                this.sendMessage(msg.chat.id, "✅ Bot resumed and now running.");
            } else {
                console.error("autoTrader object not available");
                this.sendMessage(msg.chat.id, "⚠️ Could not resume bot: AutoTrader not available");
            }
        });
        
        // Command: /targets - Show active profit targets
        this.onText(/\/targets/, (msg) => {
            try {
                const targets = [2, 4, 6].filter(t => {
                    return document.getElementById(`target-${t}percent`).checked;
                });
                
                this.sendMessage(msg.chat.id, `✅ Active Profit Targets: ${targets.join('%, ')}%`);
            } catch (error) {
                console.error("Error processing /targets command:", error);
                this.sendMessage(msg.chat.id, "❌ Error retrieving profit targets");
            }
        });
        
        // Command: /emergency - Close all positions
        this.onText(/\/emergency/, (msg) => {
            if (typeof autoTrader !== 'undefined' && typeof autoTrader.closeAllPositions === 'function') {
                autoTrader.closeAllPositions()
                    .then(success => {
                        if (success) {
                            this.sendMessage(msg.chat.id, "🚨 ALL POSITIONS CLOSED - EMERGENCY STOP");
                        } else {
                            this.sendMessage(msg.chat.id, "❌ Failed to close all positions");
                        }
                    })
                    .catch(error => {
                        console.error("Error in emergency stop:", error);
                        this.sendMessage(msg.chat.id, "❌ Error during emergency stop: " + error.message);
                    });
            } else {
                console.error("closeAllPositions method not available");
                this.sendMessage(msg.chat.id, "❌ Emergency stop function not available");
            }
        });
          // Command: /stats - Show performance statistics
        this.onText(/\/stats/, async (msg) => {
            try {
                // Get performance stats
                const stats = await updatePerformanceStats();
                
                if (stats) {
                    this.sendMessage(msg.chat.id, 
                        `📊 Performance Stats:\n` +
                        `Win Rate: ${stats.winRate}%\n` +
                        `Avg Profit: ${stats.avgProfit}%\n` +
                        `This Month: ${stats.monthlyGain}%`
                    );
                } else {
                    this.sendMessage(msg.chat.id, "❌ Could not retrieve performance statistics");
                }
            } catch (error) {
                console.error("Error in /stats command:", error);
                this.sendMessage(msg.chat.id, "❌ Error retrieving performance data");
            }
        });
          // Command: /simulation
        this.onText(/\/simulation/, (msg) => {
            const simulationMode = document.getElementById('simulation-mode');
            
            if (!simulationMode) {
                this.sendMessage(msg.chat.id, "❌ Simulation mode not available");
                return;
            }
            
            // Toggle simulation mode
            simulationMode.checked = !simulationMode.checked;
            
            // Trigger the change event to update UI
            simulationMode.dispatchEvent(new Event('change'));
            
            this.sendMessage(
                msg.chat.id,
                simulationMode.checked ? 
                    "🧪 Simulation mode enabled - No real trades will be placed" : 
                    "🔄 Simulation mode disabled - Live trading resumed"
            );
        });
        
        // Command: /backtest
        this.onText(/\/backtest/, async (msg) => {
            if (!window.simulationEngine) {
                this.sendMessage(msg.chat.id, "❌ Simulation engine not available");
                return;
            }
            
            this.sendMessage(msg.chat.id, "🧪 Running 30-day backtest...");
            
            try {
                const result = await window.simulationEngine.runBacktest(30);
                
                this.sendMessage(
                    msg.chat.id,
                    `🧪 Backtest Results:\n` +
                    `Trades: ${result.totalTrades}\n` +
                    `Win Rate: ${result.winRate}%\n` +
                    `Final Balance: $${result.finalBalance.toFixed(2)}`
                );
            } catch (error) {
                console.error("Error running backtest from Telegram:", error);
                this.sendMessage(msg.chat.id, "❌ Error running backtest");
            }
        });
        
        // Command: /help
        this.onText(/\/help/, (msg) => {
            this.sendMessage(msg.chat.id, 
                "Available commands:\n" +                "/status - Check bot running status and today's trades\n" +
                "/pause - Pause the trading bot\n" +
                "/resume - Resume the trading bot\n" +
                "/targets - View active profit targets\n" +
                "/emergency - Emergency stop (close all positions)\n" +
                "/stats - View performance statistics\n" +
                "/simulation - Toggle simulation mode\n" +
                "/backtest - Run 30-day backtest\n" +
                "/analyze - Get AI trading recommendations\n" +                "/predict - Get ML strategy prediction\n" +
                "/mlenable - Enable ML auto strategy selection\n" +
                "/mldisable - Disable ML auto strategy selection\n" +
                "/beststrategy - View best performing strategy\n" +                "/params - View current trading parameters\n" +
                "/rlenable - Enable automatic parameter tuning\n" +
                "/rldisable - Disable automatic parameter tuning\n" +
                "/evolve - Run genetic algorithm evolution\n" +
                "/beststratdna - View best strategy DNA\n" +
                "/help - Show this help message"
            );
        });
    },
      // Register a command handler
    onText(regex, callback) {
        // Store the command name directly (without regex)
        const commandName = regex.toString().match(/\/(\w+)/)[1]; // Extract command name from regex
        console.log(`Registering command handler for: /${commandName}`);
        this.commands[commandName] = callback;
    },
    
    // Send message to Telegram
    async sendMessage(chatId, text) {
        return TelegramService.send(text);
    },
    
    // Simulate polling by checking for commands in incoming Telegram messages
    // In a real implementation, this would use webhook or long polling with the Telegram API
    startPolling() {
        // Instead of actual polling, we'll expose a function for handling incoming commands
        window.handleTelegramCommand = (command) => {
            console.log(`Received command: ${command}`);
            
            // Extract the command name without the slash
            const commandMatch = command.match(/\/(\w+)/);
            if (!commandMatch) {
                TelegramService.send("Invalid command format. Commands should start with /");
                console.error("Invalid command format:", command);
                return false;
            }
            
            const commandName = commandMatch[1];
            console.log(`Looking for handler for: ${commandName}`);
            
            const fakeMsgObj = {
                chat: { id: this.chatId },
                text: command
            };
            
            // Find the command handler by name
            if (this.commands[commandName]) {
                console.log(`Executing command: /${commandName}`);
                this.commands[commandName](fakeMsgObj);
                return true;
            }
            
            // No command match found
            TelegramService.send("Unknown command. Send /help for available commands.");
            return false;
        };
        
        console.log("Telegram Bot command interface initialized. Use window.handleTelegramCommand('/command') to test.");
    }
};

// Initialize the bot when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure other components are loaded
    setTimeout(() => {
        if (typeof autoTrader !== 'undefined' && typeof TelegramService !== 'undefined') {
            TelegramBot.init();
            console.log("Telegram Bot interface initialized");
        } else {
            console.error("Required components not loaded for Telegram Bot initialization");
        }
    }, 1000);
});
