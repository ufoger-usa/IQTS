// Enhanced Telegram Integration Module
// This module extends the base TelegramService with additional features

// Centralized configuration for telegram bot - better than hardcoding values in multiple files
const TelegramConfig = {
    token: "8181620031:AAG-CBhE6qu3zoQuCvHtWOawyCSEfnnLwWQ", // Bot token
    chatId: "1399354687", // Default chat ID
    
    // Helper method to change the configuration
    updateConfig(newConfig) {
        if (newConfig.token) this.token = newConfig.token;
        if (newConfig.chatId) this.chatId = newConfig.chatId;
        console.log("Telegram configuration updated");
    }
};

// Enhanced TelegramService with additional features
class EnhancedTelegramService {
    static async send(message, chatId = null) {
        // Use default chatId if not specified
        const targetChatId = chatId || TelegramConfig.chatId;
        const url = `https://api.telegram.org/bot${TelegramConfig.token}/sendMessage?chat_id=${targetChatId}&text=${encodeURIComponent(message)}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.ok) {
                throw new Error(`Telegram API error: ${data.description}`);
            }
            
            console.log(`Telegram notification sent to chat ID ${targetChatId}`);
            return data;
        } catch (error) {
            console.error("Error sending Telegram message:", error);
            throw error;
        }
    }
    
    // Send a formatted message with a title
    static async sendFormatted(title, content, chatId = null) {
        const message = `📝 *${title}*\n\n${content}`;
        return this.send(message, chatId);
    }
    
    // Send an alert message (for urgent notifications)
    static async sendAlert(content, chatId = null) {
        const message = `🚨 *ALERT*\n\n${content}`;
        return this.send(message, chatId);
    }
    
    // Send a trade notification
    static async sendTradeNotification(action, symbol, quantity, price, chatId = null) {
        const emoji = action.toLowerCase() === 'buy' ? '🟢' : '🔴';
        const message = `${emoji} *${action.toUpperCase()}* ${symbol}\n${quantity} @ $${price}`;
        return this.send(message, chatId);
    }
}

// Export the EnhancedTelegramService to replace the basic one
// This preserves backward compatibility while adding new features
window.TelegramService = EnhancedTelegramService;
window.TelegramConfig = TelegramConfig;

console.log("Enhanced Telegram service loaded");
