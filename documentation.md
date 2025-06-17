# IQTS Trading Bot Documentation

## Overview

The IQTS Trading Bot has been enhanced with Telegram integration and AI trade analysis capabilities. This provides mobile notifications, remote control, and intelligent trading strategy optimization based on historical performance.

## UI Fixes and Improvements

### Alpaca Connection Modal Fix

A fix has been implemented for issues with the Alpaca connection modal:

1. **Issues Fixed**: 
   - Modal not appearing when clicking the "Connect Alpaca" button
   - "Cannot read properties of null (reading 'style')" error in console
   
2. **Solution**: 
   - Added direct inline modal creation in the `showAlpacaModal()` function
   - Changed `alpacaModal` from `const` to `let` so it can be reassigned
   - Added robust error handling in modal-related functions
   - Added additional CSS styles to ensure proper display
   
3. **Technical Details**:
   - Modal is now created dynamically if it doesn't exist in the DOM
   - Event listeners for tabs and connection buttons are properly initialized
   - Error handling prevents JavaScript errors from breaking functionality

If you still experience issues with the Alpaca connection button:
1. Make sure your browser has JavaScript enabled
2. Check the browser console (F12) for any error messages
3. Try refreshing the page completely (Ctrl+F5)
4. Try the alternative connection method described below

## Paper Trading Simulation Mode

The Trading Bot now includes a simulation mode for paper trading and strategy backtesting.

### Features

- **Risk-Free Testing**: Test strategies without risking real money
- **Realistic Simulation**: Uses actual historical price movements
- **Simulated P/L Tracking**: Tracks virtual balance and performance metrics
- **30-Day Backtesting**: Test strategies against 30 days of market data
- **Telegram Integration**: Toggle simulation mode and run backtests remotely

### Setup

1. Enable Simulation Mode using the toggle in the Auto-Trading panel
2. All trades will be simulated with virtual money instead of real funds
3. Use the "Run 30-Day Test" button to backtest your current strategy
4. View results in the Simulation Results panel

### Telegram Commands

- `/simulation` - Toggle simulation mode on/off
- `/backtest` - Run a 30-day backtest on current strategy

## AI Trade Analysis & Strategy Optimization

The Trading Bot now features AI-powered trade analysis to optimize strategies based on historical performance.

### Python Analysis Microservice

The system includes a Python backend service (`analysis_service.py`) that:
- Analyzes trading history from your Google Sheet
- Uses machine learning to determine most important trading factors
- Identifies optimal trading strategies based on past performance
- Provides warnings based on market conditions

### Setup Instructions

1. Make sure you have Python installed (3.7+ recommended)
2. Install required libraries:
   ```bash
   pip install flask flask-cors pandas scikit-learn
   ```
3. Start the analysis service:
   - Run the included batch file: `start_analysis_service.bat`
   - Or start manually: `python analysis_service.py`
4. The service runs on http://localhost:8000

### AI Insights Panel

The dashboard now includes an AI insights panel showing:
- Best trading strategy based on your historical data
- Warning signals for market conditions
- One-click refresh button for updated analysis

### Strategy Auto-Optimization

The bot can automatically optimize trading parameters based on AI recommendations:
- Adjusts maximum daily trades limit
- Modifies preferred timeframes
- Tunes risk per trade settings
- Adapts to different strategy types (momentum, scalping, swing trading, volume-based)

### Telegram Commands

New Telegram commands related to AI analysis:
- `/analyze` - Get the current AI trading recommendations and warnings

## Alternative Alpaca Connection Method

If you're experiencing issues connecting to Alpaca through the regular UI method, an alternative connection approach has been implemented:

### Using alpaca-credentials.json

1. Locate the `alpaca-credentials.json` file in the root directory
2. Edit the file to include your Alpaca API credentials:
   ```json
   {
     "paper": {
       "keyId": "YOUR_PAPER_KEY_ID",
       "secretKey": "YOUR_PAPER_SECRET_KEY"
     },
     "live": {
       "keyId": "YOUR_LIVE_KEY_ID",
       "secretKey": "YOUR_LIVE_SECRET_KEY"
     }
   }
   ```
3. Save the file and refresh the dashboard

### Using the Alternative Connection Button

The system automatically adds an "Connect Alpaca (Alternative)" button to the trading panel that will:
1. Attempt to load credentials from the `alpaca-credentials.json` file
2. Connect to Alpaca using those credentials
3. Enable trading functionality if successful

For detailed instructions, see the `alpaca-connection-guide.html` file.

## Components

### 1. TelegramService

The `TelegramService` class is responsible for sending notifications to Telegram. It has the following methods:

- **send(message)**: Sends a basic text message to the configured Telegram chat
- **sendFormatted(title, content)**: Sends a message with a formatted title and content
- **sendAlert(content)**: Sends an alert message with special formatting
- **sendTradeNotification(action, symbol, quantity, price)**: Sends a trade notification with relevant details

### 2. TelegramBot

The `TelegramBot` object handles command processing from Telegram messages. It:

- Registers command handlers for /status, /pause, /resume, and /help
- Processes incoming commands from the Telegram API
- Responds with appropriate actions and information

### 3. TelegramDebug

A utility for diagnosing and fixing Telegram integration issues:

- **checkIntegration()**: Verifies all components are correctly loaded and connected
- **testAllCommands()**: Tests execution of all registered commands
- **repairIntegration()**: Attempts to fix common integration issues

## Configuration

Telegram-related settings are centralized in the `TelegramConfig` object:

```javascript
const TelegramConfig = {
    token: "8181620031:AAG-CBhE6qu3zoQuCvHtWOawyCSEfnnLwWQ",  // Bot token
    chatId: "1399354687"  // Default chat ID
};
```

This allows easy updating of settings without changing multiple files.

## Events and Notifications

The system automatically sends notifications for the following events:

1. **Trade Execution**: When auto-trading places a buy or sell order
2. **Trailing Stop Updates**: When a trailing stop is adjusted
3. **Profit Taking**: When profit targets are hit and positions closed
4. **Error States**: When trading errors occur
5. **Command Responses**: When commands are processed from Telegram

## Available Commands

Users can send the following commands via Telegram:

- **/status**: Check if the trading bot is currently running and how many trades have been executed today
- **/pause**: Pause the auto-trading functionality
- **/resume**: Resume the auto-trading functionality
- **/help**: Display the list of available commands

## Testing Tools

### Telegram Tester

A web interface for testing the Telegram integration is provided in `telegram-tester.html`. This tool allows:

- Sending test messages
- Executing test commands
- Checking integration status
- Repairing integration issues

### Console Testing

The following functions are available in the browser console for testing:

- **testTelegramNotification()**: Send a test notification
- **testTelegramCommand('/command')**: Test a specific command
- **showTelegramCommands()**: List available commands
- **TelegramDebug.checkIntegration()**: Run diagnostics

## Security Considerations

1. Bot token and chat ID are hardcoded in the application. In a production environment, these should be:
   - Stored in environment variables or a secure configuration file
   - Not committed to version control
   - Potentially encrypted at rest

2. The current implementation does not authenticate command senders. In a more secure implementation, you would:
   - Verify the sender's chat ID before processing commands
   - Implement command authorization levels
   - Add a command password for sensitive operations

## Extending the System

To add new commands:

1. Register them in `telegramBot.js`:
```javascript
TelegramBot.onText(/\/mycommand/, (msg) => {
    // Command implementation
    TelegramBot.sendMessage(msg.chat.id, "Command response");
});
```

2. Add them to the help message
3. Include them in testing procedures

## Troubleshooting

If the Telegram integration is not working:

1. Check the browser console for errors
2. Use the `TelegramDebug.checkIntegration()` function to diagnose issues
3. Verify the bot token and chat ID are correct
4. Ensure the Telegram bot is active and has been started by the user
5. Check for network connectivity issues

## Future Enhancements

Potential improvements for the Telegram integration:

1. Multi-user support with different permission levels
2. Two-factor authentication for sensitive commands
3. Rich media messages with charts and graphs
4. Scheduled status reports
5. Custom alerts based on price movements or portfolio performance
