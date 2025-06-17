// Direct implementation of partial profit-taking logic
// This adds direct takePartialProfits method to AutoTrader as shown in Step 7

// Wait for DOM content to be loaded to ensure the AutoTrader class exists
document.addEventListener('DOMContentLoaded', function() {
    // Check if AutoTrader exists
    if (typeof AutoTrader !== 'undefined') {
        // Add takePartialProfits method to AutoTrader prototype
        AutoTrader.prototype.takePartialProfits = async function(symbol, entryPrice, currentPrice, positionQty) {
            const profitTargets = [0.02, 0.04, 0.06]; // 2%, 4%, 6%
            let profitTaken = false;
            
            for (const target of profitTargets) {
                const targetPrice = entryPrice * (1 + target);
                
                if (currentPrice >= targetPrice) {
                    // Calculate how many shares to sell (1/3 at each target)
                    const qtyToSell = Math.floor(positionQty * 0.33);
                    if (qtyToSell <= 0) return false;
                    
                    // Create sell order
                    await alpacaClient.createOrder({
                        symbol: symbol,
                        qty: qtyToSell,
                        side: 'sell',
                        type: 'market',
                        time_in_force: 'day'
                    });
                    
                    await TelegramService.send(`🎯 Partial profit taken: Sold ${qtyToSell} ${symbol} at ${(target * 100)}% gain`);
                    profitTaken = true;
                }
            }
            
            return profitTaken;
        };

        console.log("Added takePartialProfits method to AutoTrader");
    } else {
        console.error("AutoTrader class not found - could not add takePartialProfits method");
    }
});
