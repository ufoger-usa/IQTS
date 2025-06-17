# IQTS AI Trading Dashboard - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [System Requirements](#system-requirements)
   - [Launching the Dashboard](#launching-the-dashboard)
   - [Interface Overview](#interface-overview)
3. [Connectivity](#connectivity)
   - [Alpaca API Connection](#alpaca-api-connection)
   - [Connection Status](#connection-status)
4. [Trading Interface](#trading-interface)
   - [Market Information](#market-information)
   - [Performance Statistics](#performance-statistics)
   - [Watchlist Management](#watchlist-management)
   - [Active Trades](#active-trades)
5. [AI Analysis Tools](#ai-analysis-tools)
   - [AI Recommendations](#ai-recommendations)
   - [Machine Learning Predictions](#machine-learning-predictions)
   - [Reinforcement Learning Tuning](#reinforcement-learning-tuning)
6. [Strategy Management](#strategy-management)
   - [Strategy Selection](#strategy-selection)
   - [Strategy Comparison](#strategy-comparison)
   - [Strategy Evolution](#strategy-evolution)
7. [Automated Trading](#automated-trading)
   - [Enabling/Disabling Auto-Trading](#enablingdisabling-auto-trading)
   - [Trading Parameters](#trading-parameters)
   - [Risk Management Settings](#risk-management-settings)
8. [Simulation Mode](#simulation-mode)
   - [Running Simulations](#running-simulations)
   - [Analyzing Simulation Results](#analyzing-simulation-results)
9. [Backend Services](#backend-services)
   - [Service Management](#service-management)
   - [Monitoring Service Status](#monitoring-service-status)
10. [User Interface Options](#user-interface-options)
    - [Theme Settings](#theme-settings)
    - [Layout Options](#layout-options)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#faq)

---

## Introduction

The IQTS AI Trading Dashboard is an advanced algorithmic trading platform that integrates artificial intelligence, machine learning, and quantitative strategies to optimize trading decisions. This comprehensive platform enables users to analyze market data, implement trading strategies, and execute trades automatically.

Key features include:
- Real-time market data analysis
- AI-powered trading recommendations
- Automated trade execution
- Strategy evolution and optimization
- Performance tracking and analytics
- Simulation capabilities for strategy testing

This manual provides detailed instructions on using all aspects of the IQTS AI Trading Dashboard.

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Internet connection
- Alpaca trading account with API keys
- Recommended: 1920x1080 screen resolution or higher

### Launching the Dashboard
1. Open the `VC_IQTSChatBot.html` file in your web browser
2. The dashboard will initialize and attempt to connect to required services

### Interface Overview
The dashboard is organized into several key sections:

- **Header**: Contains the dashboard title, connection status, and theme controls
- **Market Information**: Displays pre/post market status and countdown timer
- **Performance Statistics**: Shows trading performance metrics and account information
- **AI Recommendations**: Displays AI-generated trading suggestions
- **Auto-Trading Controls**: Interface for enabling/disabling automated trading
- **Backend Services**: Monitoring and control panel for supporting services
- **Analysis Panels**: Various panels for different types of analysis and visualizations

---

## Connectivity

### Alpaca API Connection
To connect your Alpaca trading account:

1. Click on the "Disconnected" status indicator in the header
2. In the popup dialog, enter your Alpaca API Key and Secret Key
3. Select the appropriate environment (Paper or Live)
4. Click "Connect"
5. If successful, the status will change to "Connected"

### Connection Status
The connection status is displayed in the header:

- **Disconnected** (Red): No connection to Alpaca API
- **Connected - Paper** (Blue): Connected to Alpaca Paper Trading
- **Connected - Live** (Green): Connected to Alpaca Live Trading

To manually disconnect:
1. Click on the "Connected" status
2. Select "Disconnect" from the dropdown menu

---

## Trading Interface

### Market Information
The top section displays:
- Current market status (Pre-market, Regular hours, Post-market)
- Countdown timer to the next market status change
- Current date and time

### Performance Statistics
The statistics bar shows key performance metrics:

**Trading Performance:**
- **Total Trades**: Number of trades executed
- **Win Rate**: Percentage of profitable trades
- **Avg. Gain**: Average percentage gain on profitable trades
- **Avg. Loss**: Average percentage loss on unprofitable trades
- **Risk/Reward**: Ratio of average gain to average loss
- **Profit Factor**: Ratio of gross profits to gross losses

**Account Information:**
- **Alpaca Value**: Total account value
- **Buying Power**: Available funds for trading
- **Today's P/L**: Profit or loss for the current trading day
- **Open Positions**: Number of currently open positions
- **Cash**: Available cash
- **Cash Withdrawable**: Cash available for withdrawal

### Watchlist Management
The watchlist panel displays stocks you're monitoring:

**Adding a Symbol:**
1. Locate the watchlist panel
2. Enter a stock symbol in the input field
3. Click "Add" or press Enter

**Managing the Watchlist:**
- Click the chart icon to view a detailed chart
- Click the "×" icon to remove a symbol from the watchlist
- Click on a symbol to display detailed information

### Active Trades
This panel shows all currently open positions:

**For each position:**
- Symbol
- Entry price
- Current price
- Change (% and $)
- Quantity
- Value
- Action buttons (Close, Set Stop-Loss, Take Profit)

To close a position:
1. Find the position in the Active Trades panel
2. Click the "Close" button
3. Confirm the action in the prompt

---

## AI Analysis Tools

### AI Recommendations
The AI recommendations panel provides algorithmic trading suggestions:

**Types of Recommendations:**
- **Best Strategy**: The top-performing strategy based on recent market conditions
- **Watch Out**: Warnings about market conditions or potential risks

To refresh recommendations:
1. Click the "Refresh Analysis" button
2. Wait for the analysis to complete (this may take a few seconds)

### Machine Learning Predictions
The ML Predictions panel shows price prediction models:

**Using ML Predictions:**
1. Select a symbol from the dropdown
2. View the prediction chart showing historical prices and future predictions
3. Note the confidence level indicator (High, Medium, Low)

The prediction includes:
- Direction prediction (Up/Down)
- Price target range
- Confidence level
- Key factors influencing the prediction

### Reinforcement Learning Tuning
The RL Tuning panel allows optimization of trading parameters using reinforcement learning:

**Starting the RL Tuning Process:**
1. Ensure the RL Tuning service is running
2. Select a strategy to optimize
3. Set the learning parameters:
   - Learning rate
   - Episodes
   - Exploration rate
4. Click "Start Tuning"

**Monitoring Progress:**
- The progress bar indicates completion percentage
- The learning curve chart shows performance improvement
- Results display optimized parameter values

---

## Strategy Management

### Strategy Selection
To select a trading strategy:

1. Locate the strategy selector dropdown
2. Click to view available strategies
3. Select your desired strategy from the list

### Strategy Comparison
The Strategy Comparison panel allows you to compare performance of different strategies:

**Comparing Strategies:**
1. Navigate to the Strategy Comparison panel
2. Select strategies to compare using the checkboxes
3. Set the comparison timeframe
4. View the comparative performance chart

Key metrics displayed:
- Return percentage
- Win rate
- Maximum drawdown
- Sharpe ratio
- Profit factor

### Strategy Evolution
The Strategy Evolution panel uses genetic algorithms to evolve better trading strategies:

**Starting Evolution:**
1. Ensure the Strategy Evolution service is running
2. Set evolution parameters:
   - Population size
   - Generations
   - Mutation rate
   - Fitness metric
3. Click "Start Evolution"

**Monitoring Evolution:**
- The generations progress is displayed
- Best individual's performance is shown in real-time
- Evolved strategy parameters are displayed upon completion

---

## Automated Trading

### Enabling/Disabling Auto-Trading
To enable automated trading:

1. Ensure you're connected to Alpaca
2. Navigate to the Auto-Trading panel
3. Toggle the "Enable Auto-Trading" switch to ON
4. Confirm your decision in the prompt

To disable automated trading:
1. Toggle the "Enable Auto-Trading" switch to OFF

### Trading Parameters
Configure the auto-trading behavior:

**Basic Settings:**
- **Strategy**: Select the strategy to use
- **Symbols**: Enter trading symbols separated by commas
- **Max Positions**: Set maximum open positions
- **Position Size**: Set position size ($ or % of account)

**Advanced Settings:**
- **Trading Hours**: Set specific hours for trading
- **Max Daily Loss**: Set maximum daily loss limit
- **Trade Frequency**: Set minimum time between trades

### Risk Management Settings
Configure risk management parameters:

**Stop-Loss Settings:**
- **Stop-Loss Type**: Fixed, Percentage, ATR-based
- **Stop-Loss Value**: Value for the selected type
- **Trailing Stop**: Enable/disable trailing stops

**Take-Profit Settings:**
- **Take-Profit Type**: Fixed, Percentage, R-multiple
- **Take-Profit Value**: Value for the selected type
- **Partial Profits**: Enable/disable partial profit taking

---

## Simulation Mode

### Running Simulations
To test strategies without real trading:

1. Navigate to the Simulation panel
2. Select the strategy to test
3. Set simulation parameters:
   - Starting capital
   - Time period
   - Symbols
   - Position sizing
4. Click "Run Simulation"

### Analyzing Simulation Results
After the simulation completes:

**Performance Metrics:**
- Total return (% and $)
- Number of trades
- Win rate
- Maximum drawdown
- Profit factor
- Sharpe ratio

**Visual Analysis:**
- Equity curve
- Drawdown chart
- Trade distribution
- Monthly returns heatmap

---

## Backend Services

### Service Management
The Backend Services panel allows you to control the various supporting services:

**Available Services:**
- **AI Analysis Service**: Provides AI recommendations and analysis
- **RL Tuning Service**: Handles reinforcement learning optimization
- **Strategy Evolution Service**: Runs genetic algorithm evolution

**Controls for Each Service:**
- Start: Begin the service
- Stop: Halt the service
- Status indicator (Running/Stopped)

To start all services at once:
1. Click the "Start All" button in the services panel

To stop all services:
1. Click the "Stop All" button in the services panel

### Monitoring Service Status
Each service displays its current status:

- **Running** (Green): Service is active and functioning
- **Stopped** (Red): Service is currently inactive
- **Error** (Yellow): Service encountered an issue

To get service details:
1. Click on the service name
2. View the service logs and detailed status information

---

## User Interface Options

### Theme Settings
The dashboard offers multiple visual themes:

**Available Themes:**
- **Dark**: Dark background with light text (default)
- **Light**: Light background with dark text
- **Paper**: High-contrast theme for paper trading
- **Live**: Distinct theme for live trading

To change the theme:
1. Locate the theme buttons in the header
2. Click on your preferred theme

### Layout Options
The dashboard offers two layout options:

**Standard Layout** (Default):
- Full-featured with detailed information
- Scrollable interface with extensive metrics

**Compact Layout**:
- All content fits on a single screen without scrolling
- Tabbed interface to maximize space efficiency
- Monochromatic design with essential information

To switch layouts:
1. In standard view: Click "Switch to Compact View" button in the bottom-right corner
2. In compact view: Click "Standard View" button in the theme controls area

---

## Troubleshooting

### Common Issues

**Connection Problems:**
- Verify your internet connection
- Check that your Alpaca API keys are correct
- Ensure the Alpaca service is operational

**Service Startup Issues:**
- Check that Python is installed and in your system PATH
- Verify all required packages are installed
- Check service logs for specific error messages

**Data Not Updating:**
- Refresh the browser page
- Check connection status
- Restart the relevant service

**Auto-Trading Not Working:**
- Verify connection to Alpaca
- Check if auto-trading is enabled
- Ensure strategy is properly selected
- Check account has sufficient funds

### Error Messages

**"Service Unavailable"**:
1. Check if the service is running
2. Attempt to restart the service
3. Check service logs for errors

**"Authentication Failed"**:
1. Verify your API keys
2. Ensure keys have appropriate permissions

**"Rate Limit Exceeded"**:
1. Wait a few minutes before trying again
2. Reduce the frequency of requests

---

## FAQ

**Q: Can I use the dashboard with other brokers besides Alpaca?**
A: Currently, the dashboard only supports Alpaca trading integration.

**Q: How do I add my own custom strategy?**
A: Custom strategies can be added by creating a new strategy file in the appropriate format. Consult the developer documentation for details.

**Q: Is paper trading available?**
A: Yes, you can connect to Alpaca's paper trading environment for risk-free testing.

**Q: How often are the AI recommendations updated?**
A: Recommendations update automatically every 15 minutes, or you can manually refresh them.

**Q: Can I run the dashboard offline?**
A: The dashboard requires an internet connection for market data and trading.

**Q: How is my data protected?**
A: API keys and trading data are stored locally on your device. No data is sent to external servers except for communication with Alpaca.

---

*This manual is current as of June 17, 2025. Features and functionality may change with future updates.*
