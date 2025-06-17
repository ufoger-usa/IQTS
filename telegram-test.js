// Simple script to test Telegram integration
async function testTelegramNotification() {
    try {
        console.log("Sending test notification to Telegram...");
        await TelegramService.send("🔔 Test notification from IQTS Trading Bot. If you're receiving this, the Telegram integration is working correctly!");
        console.log("Test notification sent successfully!");
        return true;
    } catch (error) {
        console.error("Failed to send test notification:", error);
        return false;
    }
}

// Test function for Telegram bot commands
async function testTelegramCommand(command) {
    try {
        console.log(`Testing Telegram command: ${command}`);
        
        if (window.handleTelegramCommand) {
            const result = window.handleTelegramCommand(command);
            console.log(`Command processed: ${result ? "Success" : "Not found"}`);
            return result;
        } else {
            console.error("Telegram command handler not found. Make sure telegramBot.js is loaded.");
            return false;
        }
    } catch (error) {
        console.error(`Error testing Telegram command: ${error.message}`);
        return false;
    }
}

// Helper function to show available commands
function showTelegramCommands() {
    console.log("Available Telegram commands:");
    console.log("/status - Check bot running status and today's trades");
    console.log("/pause - Pause the trading bot");
    console.log("/resume - Resume the trading bot");
    console.log("/help - Show this help message");
    
    return "Use testTelegramCommand('/command') to test a specific command";
}

// Helper function to show feedback in the UI
function showFeedback(message, type = "info", duration = 2000) {
    // Find feedback container or create one
    let container = document.getElementById('telegram-feedback');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'telegram-feedback';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.padding = '10px 15px';
        container.style.borderRadius = '4px';
        container.style.color = '#fff';
        container.style.fontSize = '14px';
        container.style.zIndex = '9999';
        container.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(container);
    }
    
    // Set styles based on message type
    switch(type) {
        case "success":
            container.style.backgroundColor = '#27ae60';
            break;
        case "error":
            container.style.backgroundColor = '#e74c3c';
            break;
        default:
            container.style.backgroundColor = '#3498db';
    }
    
    // Display the message
    container.textContent = message;
    container.style.opacity = '1';
    
    // Hide the message after duration
    setTimeout(() => {
        container.style.opacity = '0';
    }, duration);
}

// Enhance the original functions to provide visual feedback
const originalTestNotification = testTelegramNotification;
testTelegramNotification = async function() {
    try {
        showFeedback("Sending test notification to Telegram...");
        const result = await originalTestNotification();
        if (result) {
            showFeedback("Test notification sent successfully! Check your Telegram app.", "success", 3000);
        }
        return result;
    } catch (error) {
        showFeedback("Failed to send notification: " + error.message, "error", 3000);
        return false;
    }
};

// Enhance the command test function
const originalTestCommand = testTelegramCommand;
testTelegramCommand = async function(command) {
    showFeedback(`Sending command: ${command}...`);
    try {
        const result = await originalTestCommand(command);
        if (result) {
            showFeedback(`Command ${command} executed successfully`, "success", 3000);
        } else {
            showFeedback(`Command not recognized: ${command}`, "error", 3000);
        }
        return result;
    } catch (error) {
        showFeedback(`Error: ${error.message}`, "error", 3000);
        return false;
    }
};

// Export the test function so it can be called from the browser console
window.testTelegramNotification = testTelegramNotification;

// Export the command test function to the global scope
window.testTelegramCommand = testTelegramCommand;

// Export the helper function
window.showTelegramCommands = showTelegramCommands;

// Export the enhanced functions
window.showTelegramFeedback = showFeedback;
