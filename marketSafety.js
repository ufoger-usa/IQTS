// Direct implementation of market safety conditions as shown in Step 7

document.addEventListener('DOMContentLoaded', function() {
    // Check if AutoTrader exists
    if (typeof AutoTrader !== 'undefined') {
        // Add checkMarketConditions method to AutoTrader prototype
        AutoTrader.prototype.checkMarketConditions = async function() {
            const vix = await this.fetchVIX();
            
            if (vix > 30) { // High volatility
                await TelegramService.send(`⚠️ Pausing trades: VIX > 30 (High Volatility)`);
                this.enabled = false;
            }
            
            return vix;
        };
        
        // Helper method to fetch VIX value
        AutoTrader.prototype.fetchVIX = async function() {
            // In a real implementation, this would connect to a market data provider API
            // For now, we'll simulate a VIX value (between 10-40)
            // This could be replaced with actual API call to get real VIX value
            
            try {
                console.log("Fetching VIX value...");
                // Simulate network request
                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Return a random VIX value between 10 and 40
                        const vix = Math.floor(Math.random() * 30) + 10;
                        console.log(`Current VIX value: ${vix}`);
                        resolve(vix);
                    }, 500);
                });
            } catch (error) {
                console.error("Error fetching VIX:", error);
                return 15; // Default to a moderate value on error
            }
        };
        
        // Add closeAllPositions method for emergency handling
        AutoTrader.prototype.closeAllPositions = async function() {
            try {
                if (typeof alpacaClient === 'undefined') {
                    console.error("Alpaca client not available");
                    return false;
                }
                
                // Get all open positions
                const positions = await alpacaClient.getPositions();
                
                // Close each position
                for (const position of positions) {
                    await alpacaClient.createOrder({
                        symbol: position.symbol,
                        qty: position.qty,
                        side: position.side === 'long' ? 'sell' : 'buy',
                        type: 'market',
                        time_in_force: 'day'
                    });
                    
                    console.log(`Closed position for ${position.symbol}`);
                }
                
                console.log("All positions closed");
                return true;
            } catch (error) {
                console.error("Error closing positions:", error);
                return false;
            }
        };

        console.log("Added market safety methods to AutoTrader");
    } else {
        console.error("AutoTrader class not found - could not add safety methods");
    }
});
