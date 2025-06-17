# IQTS AI Trading Dashboard - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard Layout](#dashboard-layout)
   - [Standard Layout](#standard-layout)
   - [Compact Layout](#compact-layout)
   - [Switching Between Layouts](#switching-between-layouts)
4. [Trading Features](#trading-features)
   - [Auto-Trading](#auto-trading)
   - [Manual Trading](#manual-trading)
   - [Trade Settings](#trade-settings)
5. [AI Analysis Services](#ai-analysis-services)
   - [AI Recommendations](#ai-recommendations)
   - [Strategy Comparison](#strategy-comparison)
   - [ML Predictions](#ml-predictions)
   - [RL Tuning](#rl-tuning)
   - [Strategy Evolution](#strategy-evolution)
6. [Performance Monitoring](#performance-monitoring)
7. [Service Management](#service-management)
8. [Troubleshooting](#troubleshooting)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Appendix](#appendix)

## Introduction

The IQTS AI Trading Dashboard is an advanced algorithmic trading platform that combines artificial intelligence, machine learning, and reinforcement learning to optimize trading strategies. The dashboard provides real-time market data, AI-driven trade recommendations, and both automated and manual trading capabilities.

### Key Features

- Real-time market monitoring and analysis
- AI-powered trade recommendations
- Automated trading with customizable strategies
- Performance tracking and reporting
- Multiple backend AI services for continuous strategy improvement
- Strategy backtesting and simulation
- Both standard and compact user interface layouts

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, or Edge recommended)
- Internet connection
- Alpaca trading account (if live trading)

### Connecting to Alpaca

1. Click on the "Disconnected" status in the top header
2. Enter your Alpaca API key and secret in the connection modal
3. Choose between paper trading or live trading
4. Click "Connect"
5. The connection status should change to "Connected" when successful

## Dashboard Layout

The IQTS AI Trading Dashboard offers two layout options to accommodate different display preferences and screen sizes.

### Standard Layout

The standard layout provides a spacious, detailed view of all trading data and controls:

![Standard Layout](standard-layout-screenshot.png)

Components are arranged vertically, with:
- Header with connection status and market information
- Statistics panel showing key performance metrics
- AI recommendations panel
- Auto-trading controls
- Backend services panel
- Various analysis and visualization panels

### Compact Layout

The compact layout fits all functionality on a single screen without scrolling, using a monochrome color scheme with red/green highlights for important toggles:

![Compact Layout](compact-layout-screenshot.png)

The compact layout is organized into three main areas:
1. **Header & Stats** (Top)
   - Dashboard title and connection status
   - Theme controls
   - Layout toggle
   - Key trading statistics
   
2. **Left Panel**
   - AI recommendations
   - Service controls
   - Navigation tabs
   
3. **Main Panel** (Center)
   - Tab-based interface for visualizations
   - Charts and data tables
   - Trading view
   
4. **Right Panel**
   - Auto-trading controls
   - Strategy selection
   - Trading parameters

### Switching Between Layouts

You can easily toggle between the standard and compact layouts:

1. **From Standard to Compact**: 
   - Click the "Switch to Compact View" button in the bottom-right corner

2. **From Compact to Standard**: 
   - Click the "Standard View" button in the theme controls section in the header

Your layout preference is saved between sessions.

## Trading Features

### Auto-Trading

The auto-trading feature allows the system to automatically execute trades based on AI recommendations and selected strategies.

#### To Enable Auto-Trading:

1. Ensure you are connected to Alpaca
2. Navigate to the Auto-Trading panel
3. Toggle the "Enable Auto-Trading" switch to ON
4. The status will change from "Disabled" (red) to "Enabled" (green)
5. Set your risk parameters (optional)
6. The system will now automatically execute trades based on your selected strategy

#### Auto-Trading Settings:

- **Max Position Size**: Maximum position size as a percentage of your portfolio
- **Stop Loss**: Automatic stop loss percentage
- **Take Profit**: Automatic take profit percentage
- **Strategy**: Select the trading strategy to use

### Manual Trading

You can also execute trades manually:

1. Navigate to the Trading panel
2. Enter the ticker symbol
3. Enter the quantity or dollar amount
4. Select Buy or Sell
5. Click "Execute"

### Trade Settings

Configure global settings for all trades:

- **Risk Level**: Set your preferred risk level (Conservative, Moderate, Aggressive)
- **Max Drawdown**: Set maximum acceptable drawdown percentage
- **Trading Hours**: Configure active trading hours
- **Excluded Symbols**: List of symbols to exclude from trading

## AI Analysis Services

The dashboard includes several AI services that analyze market data and optimize trading strategies.

### AI Recommendations

The AI recommendations panel shows the best current trading strategies and potential issues to watch out for:

- **Best Strategy**: Indicates the current top-performing strategy
- **Watch Out**: Highlights potential risks or issues to be aware of
- **Refresh Analysis**: Updates the AI recommendations with latest data

### Strategy Comparison

The Strategy Comparison panel allows you to compare the performance of different trading strategies:

1. Select strategies to compare from the dropdown menu
2. View the comparative performance chart
3. Sort by different metrics (Win Rate, Profit Factor, etc.)
4. Click on a strategy to view detailed performance metrics

### ML Predictions

The ML Predictions panel shows machine learning-based price predictions:

- View predicted price movements for various timeframes
- See confidence levels for each prediction
- Filter predictions by confidence threshold

### RL Tuning

The Reinforcement Learning (RL) Tuning panel allows you to optimize strategy parameters:

1. Select a strategy to tune
2. Set the tuning parameters (learning rate, episodes, etc.)
3. Click "Start Tuning"
4. Monitor the tuning progress
5. View results and apply the optimized strategy

### Strategy Evolution

The Strategy Evolution panel uses genetic algorithms to evolve new trading strategies:

1. Set the evolution parameters (generations, population size, etc.)
2. Click "Start Evolution"
3. Monitor the evolution progress
4. View the best-evolved strategies
5. Apply an evolved strategy to auto-trading

## Performance Monitoring

Monitor your trading performance through various metrics:

- **Total Trades**: Number of completed trades
- **Win Rate**: Percentage of profitable trades
- **Average Gain**: Average percentage gain on winning trades
- **Average Loss**: Average percentage loss on losing trades
- **Risk/Reward Ratio**: Ratio of average gain to average loss
- **Profit Factor**: Gross profits divided by gross losses
- **Alpaca Value**: Current account value
- **Buying Power**: Available funds for trading
- **Today's P/L**: Profit/loss for the current day

## Service Management

The dashboard relies on several backend services that can be managed through the Services panel:

### Available Services:

1. **AI Analysis Service**: Analyzes market data and provides recommendations
2. **RL Tuning Service**: Optimizes strategies using reinforcement learning
3. **Strategy Evolution Service**: Evolves new strategies using genetic algorithms

### Managing Services:

- **Start All**: Starts all backend services
- **Stop All**: Stops all backend services
- **Individual Controls**: Each service has its own start/stop buttons
- **Status Indicator**: Shows the current status of each service (Running, Stopped, Error)

## Troubleshooting

### Common Issues:

1. **Connection Problems**:
   - Ensure your Alpaca API key and secret are correct
   - Check your internet connection
   - Verify Alpaca service status at status.alpaca.markets

2. **Services Not Starting**:
   - Check the log files in the logs directory
   - Restart all services
   - Ensure required dependencies are installed

3. **Auto-Trading Not Working**:
   - Verify connection status is "Connected"
   - Check that auto-trading is enabled
   - Ensure at least one strategy is selected
   - Verify that backend services are running

4. **Performance Issues**:
   - Switch to compact layout on smaller screens
   - Close unused browser tabs
   - Clear browser cache and reload

## Keyboard Shortcuts

The dashboard supports several keyboard shortcuts for efficient operation:

- **Alt + C**: Switch to Compact Layout
- **Alt + S**: Switch to Standard Layout
- **Alt + A**: Toggle Auto-Trading
- **Alt + R**: Refresh Analysis
- **Alt + T**: Open Trading Panel
- **Alt + H**: Show This Help Menu

## Appendix

### Color Scheme

The dashboard uses a monochrome color scheme with specific accent colors:

- **Green**: Positive values, enabled states, buy signals
- **Red**: Negative values, disabled states, sell signals
- **Blue**: Neutral actions, information, navigation
- **Yellow**: Warnings, cautions
- **Grey**: Background, inactive elements

### Theme Options

The dashboard offers several themes that can be selected from the theme controls:

- **Dark**: Dark monochrome theme (default)
- **Light**: Light monochrome theme
- **Paper**: High-contrast theme for paper trading
- **Live**: High-visibility theme for live trading

---

For more information, please visit the IQTS AI Trading Dashboard documentation website or contact support.

Last Updated: June 17, 2025
