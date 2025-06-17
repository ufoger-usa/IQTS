# IQTS Trading Bot with Telegram Notifications

## Implementation Details

This implementation adds Telegram bot notifications and mobile optimization to the IQTS Trading Bot.

## Setup Instructions

### Step 1: Set Up Telegram Bot

1. ✅ Telegram bot set up complete with:
   - Bot name: IQTSChatBot (@IQTSChatBot)
   - Token: 8181620031:AAG-CBhE6qu3zoQuCvHtWOawyCSEfnnLwWQ
   - Chat ID: 1399354687

Both the token and chat ID have been configured in the code and are ready to use.

### Step 2: Telegram Integration Implementation

The integration has been added in two places:
- `script.js` - External file with TelegramService class
- Directly inside the HTML file as a backup

### Step 3: AutoTrader Enhancement

The `placeTrade()` method has been modified to:
- Send trade notifications to Telegram with symbol, type, quantity, and price
- Send error notifications when trades fail

### Step 4: Trailing Stops Implementation

- Added trailing stop functionality to automatically adjust stop-loss levels as price moves favorably
- Added UI control to set trailing stop percentage (1-5%)
- Sends notifications when trailing stops are updated

### Step 4: Mobile Optimization

Added responsive design elements:
- Improved viewport meta tag
- Media queries for mobile screens
- Optimized grid layouts and watchlist items for small screens
- Better modal display on mobile devices

## UI Improvements

### Added Features:
1. **Visible Telegram Integration Panel**
   - Added a dedicated Telegram section in the Auto-Trading System panel
   - Shows connection status with the Telegram bot
   - Direct access to Telegram commands from the UI

### Step 9: AI Trade Analysis & Strategy Optimization

1. **AI Performance Analysis**
   - Implemented a Python microservice (`analysis_service.py`) that analyzes trade data
   - Uses machine learning (RandomForest) to identify the most important trading factors
   - Auto-detects optimal trading strategy based on historical performance

2. **Dashboard Integration**
   - Added an AI insights panel to the main dashboard
   - Displays recommended strategy and warning signals
   - Updates automatically and can be manually refreshed

3. **Strategy Auto-Adjustment**
   - AutoTrader class optimizes trade parameters based on AI recommendations
   - Adjusts trading frequency, timeframes, and risk per trade
   - Supports different strategies: momentum, scalping, swing trading, and volume-based

4. **Telegram Command**
   - Added `/analyze` command to request AI analysis via Telegram
   - Returns most profitable strategy and any warnings

### Step 10: Paper Trading Simulation Mode

1. **Simulation Toggle**
   - Added a simulation mode toggle in the Auto-Trading panel
   - When enabled, trades are simulated without using real money
   - Visual indicator shows when simulation mode is active

2. **Simulation Engine**
   - Created `simulationEngine.js` with virtual balance tracking
   - Simulates trades using historical price data
   - Calculates profit/loss based on entry/exit prices

3. **Trading Logic Integration**
   - Modified trading functions to use simulation when enabled
   - Added Telegram notifications for simulated trades
   - Preserves all strategy logic during simulation

4. **Simulation Dashboard**
   - Added Simulation Results panel to display virtual balance
   - Shows win rate from backtest results
   - One-click 30-day backtest capability

5. **Telegram Commands**
   - Added `/simulation` command to toggle simulation mode
   - Added `/backtest` command to run 30-day backtest remotely
   - Returns most profitable strategy and any warnings

2. **Enhanced Slider Functionality**
   - Fixed issue with sliders not working properly
   - Added visual feedback when slider values change
   - Improved slider appearance for better usability
   
3. **Visual Feedback System**
   - Added toast notifications for Telegram actions
   - Visual confirmation when commands are sent
   - Error feedback if commands fail

## Usage

When the AutoTrader executes a trade, you'll receive a notification in your Telegram chat with the trade details. The format is:
```
BUY/SELL {Symbol} {Quantity} @ {Price}
```

For failed trades, you'll receive:
```
❌ FAILED: {Symbol} - {Error Message}
```

## Testing

To test the Telegram integration:

### Method 1: Using the test script
1. Include the telegram-test.js file in your HTML:
   ```html
   <script src="telegram-test.js"></script>
   ```
2. Open your browser console and run:
   ```javascript
   testTelegramNotification();
   ```
3. You should receive a test notification in your Telegram chat

### Method 2: Via trading functionality
1. Execute a trade through the platform
2. The AutoTrader will automatically send a notification
3. Check your Telegram for the trade notification

## Testing the Trailing Stops

To test the trailing stop functionality:

1. **Adjust the trailing stop percentage**:
   - Use the "Trailing Stop (%)" slider in the Auto-Trading System panel
   - This sets how far below the highest price the stop order will be placed

2. **Execute a trade**:
   - When a buy trade is executed, a trailing stop will be automatically set
   - You'll receive a Telegram notification that says: 🔹 Trailing stop (X%) set for SYMBOL

3. **Price updates**:
   - As the price of the asset moves up, the trailing stop will be adjusted automatically
   - You'll receive notifications when trailing stops are updated: 🔵 Trailing stop updated for SYMBOL: PRICE

4. **Simulating price changes**:
   - For testing purposes, you can simulate price changes using the console:
   ```javascript
   // Replace SYMBOL with the actual symbol and PRICE with the new price
   window.onPriceUpdate('AAPL', 185.50, 0.02);
   ```

## Telegram Commands

You can control the trading bot through Telegram by sending these commands:
- `/status` - Check if the bot is running and view today's trades
- `/pause` - Pause the trading bot
- `/resume` - Resume the trading bot
- `/help` - Show available commands

To test Telegram commands from your browser console:
```javascript
window.handleTelegramCommand('/status');
window.handleTelegramCommand('/help');
```

## Telegram Command Buttons

The Telegram section in the UI includes several command buttons that allow you to control the trading bot directly from the interface. Each button simulates sending a command to the Telegram bot.

### Button Functions

1. **/status**
   - **Purpose**: Check the current operational status of the trading bot
   - **What it does**: Reports whether the bot is currently running or paused
   - **Example response**: "Bot Status: ✅ RUNNING" or "Bot Status: ❌ PAUSED"
   - **Additional info**: Also shows the number of trades executed today

2. **/pause**
   - **Purpose**: Temporarily stop the bot from executing any new trades
   - **What it does**: Sets the autoTrader.enabled property to false
   - **Effect**: The bot will not place any new trades until resumed
   - **UI change**: The Auto-Trading toggle will be unchecked

3. **/resume**
   - **Purpose**: Restart the bot after it has been paused
   - **What it does**: Sets the autoTrader.enabled property to true
   - **Effect**: The bot will resume placing trades based on signals
   - **UI change**: The Auto-Trading toggle will be checked

4. **/help**
   - **Purpose**: View a list of all available commands
   - **What it does**: Sends a message with all command descriptions
   - **When to use**: If you're unsure about what commands are available

5. **Test Notification**
   - **Purpose**: Verify that Telegram notifications are working
   - **What it does**: Sends a test message to your Telegram chat
   - **When to use**: To confirm the connection between the app and Telegram
   - **Not a command**: This button doesn't simulate a command, it just sends a test message

### How to Use

1. Click any command button in the Telegram section of the UI
2. A toast notification will appear indicating the command was sent
3. Check your Telegram chat to see the response from the bot
4. The UI will update to reflect any changes (for pause/resume)

### Troubleshooting

If commands aren't working:
- Check the browser console for error messages
- Verify that your Telegram bot token is correct
- Make sure the chat ID is properly configured
- Confirm that the TelegramBot service has initialized correctly
