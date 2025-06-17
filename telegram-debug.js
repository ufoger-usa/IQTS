// Telegram Debug Utility
// Use this script to diagnose issues with the Telegram integration

/**
 * Debug utility for Telegram integration
 * This script helps debug issues with commands and notifications
 */
const TelegramDebug = {
    /**
     * Checks if the Telegram integration is properly initialized
     * @returns {Object} Status object with initialization information
     */
    checkIntegration: function() {
        console.log("Checking Telegram integration status...");
        
        const status = {
            telegramServicePresent: typeof TelegramService !== 'undefined',
            telegramBotPresent: typeof TelegramBot !== 'undefined',
            commandHandlerPresent: typeof window.handleTelegramCommand === 'function',
            testNotificationPresent: typeof testTelegramNotification === 'function',
            autoTraderPresent: typeof autoTrader !== 'undefined'
        };
        
        console.table(status);
        
        // Check for registered commands
        if (status.telegramBotPresent && TelegramBot.commands) {
            console.log("Registered commands:", Object.keys(TelegramBot.commands).map(cmd => `/${cmd}`));
        }
        
        return status;
    },
    
    /**
     * Tests each command and logs the result
     */
    testAllCommands: async function() {
        console.log("Testing all Telegram commands...");
        
        const commands = ['/status', '/pause', '/resume', '/help'];
        const results = {};
        
        for (const cmd of commands) {
            console.log(`Testing command: ${cmd}`);
            try {
                if (typeof window.handleTelegramCommand === 'function') {
                    const result = window.handleTelegramCommand(cmd);
                    results[cmd] = result ? "Success" : "Failed";
                } else {
                    results[cmd] = "Handler not available";
                }
            } catch (error) {
                results[cmd] = `Error: ${error.message}`;
            }
        }
        
        console.table(results);
        return results;
    },
    
    /**
     * Repairs common issues with the Telegram integration
     */
    repairIntegration: function() {
        console.log("Attempting to repair Telegram integration...");
        
        // Re-initialize TelegramBot if needed
        if (typeof TelegramBot !== 'undefined' && typeof TelegramBot.init === 'function') {
            TelegramBot.init();
            console.log("Re-initialized TelegramBot");
        }
        
        // Fix command handling
        if (typeof TelegramBot !== 'undefined' && typeof TelegramBot.commands === 'object') {
            // Make sure basic commands exist
            if (!TelegramBot.commands.status) {
                TelegramBot.commands.status = (msg) => {
                    const status = typeof autoTrader !== 'undefined' && autoTrader.enabled 
                        ? "✅ RUNNING" : "❌ PAUSED";
                    TelegramService.send(`Bot Status: ${status}\nToday's Trades: 0`);
                };
                console.log("Repaired /status command");
            }
            
            if (!TelegramBot.commands.pause) {
                TelegramBot.commands.pause = (msg) => {
                    if (typeof autoTrader !== 'undefined') {
                        autoTrader.enabled = false;
                        TelegramService.send("🛑 Bot paused. Use /resume to restart.");
                    }
                };
                console.log("Repaired /pause command");
            }
            
            if (!TelegramBot.commands.resume) {
                TelegramBot.commands.resume = (msg) => {
                    if (typeof autoTrader !== 'undefined') {
                        autoTrader.enabled = true;
                        TelegramService.send("✅ Bot resumed and now running.");
                    }
                };
                console.log("Repaired /resume command");
            }
        }
        
        return "Repair attempt completed";
    }
};

// Export to global scope for console access
window.TelegramDebug = TelegramDebug;

// Auto-run a check when loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log("Running automatic Telegram integration check...");
        TelegramDebug.checkIntegration();
    }, 2000);
});
