# IQTS AI Trading Dashboard Tutorial

## Overview
The IQTS AI Trading Dashboard is a comprehensive platform for AI-powered trading analysis, strategy optimization, and automated trading. This tutorial will guide you through all features and functionality of the dashboard.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Layout Options](#layout-options)
3. [Trading Controls](#trading-controls)
4. [AI Recommendations](#ai-recommendations)
5. [Performance Metrics](#performance-metrics)
6. [Trading Charts](#trading-charts)
7. [Watchlist](#watchlist)
8. [Auto-Trading](#auto-trading)
9. [Backend Services](#backend-services)
10. [Strategy Optimization](#strategy-optimization)
11. [Troubleshooting](#troubleshooting)

## Getting Started

### Opening the Dashboard
1. Open the `VC_IQTSChatBot.html` file in your web browser
2. The dashboard will load with the compact layout by default
3. Wait for all services to initialize and connect

### Understanding the Interface
The dashboard has two layouts:
- **Compact Layout**: All features on one screen with no scrolling
- **Standard Layout**: More detailed view with scrollable sections

## Layout Options

### Switching Layouts
1. **From Compact to Standard**:
   - Click the "Standard View" button in the top-right theme controls area
   
2. **From Standard to Compact**:
   - Click the "Switch to Compact View" button in the bottom-right corner

### Compact Layout Overview
The compact layout consists of:
1. **Header**: Title, connection status, and theme controls
2. **Stats Bar**: Key trading metrics and account information
3. **Left Panel**: AI recommendations, services, and quick controls
4. **Main Content Area**: Tabbed trading charts and data visualizations
5. **Right Panel**: Auto-trading controls and trade management

### Standard Layout Overview
The standard layout presents information in vertical scrolling sections:
1. **Header and Stats**: At the top of the page
2. **Panels**: Trading chart, watchlist, active trades, etc.
3. **Services and Trading Controls**: Located toward the bottom

## Trading Controls

### Theme Options
Located in the header, you can switch between:
- **Dark**: Dark monochrome theme (default)
- **Light**: Lighter theme for daytime use
- **Paper**: Paper trading mode display
- **Live**: Live trading mode display

### Connection Status
- **Connected**: Green indicator shows active connection to trading services
- **Disconnected**: Red indicator shows no connection
- **Click the status** to attempt reconnection

## AI Recommendations

### Viewing Recommendations
In the compact layout:
- AI recommendations appear in the left panel
- Green checkmark indicates best strategies
- Yellow/red warnings indicate potential issues

In the standard layout:
- AI recommendations appear in a dedicated panel
- Click on any recommendation for more details

### Refreshing Analysis
- Click the "Refresh Analysis" button to update AI recommendations
- The system will analyze current market conditions and update strategy suggestions

## Performance Metrics

### Stats Bar Overview
The stats bar shows key metrics:
- **Total Trades**: Number of completed trades
- **Win Rate**: Percentage of profitable trades
- **Avg. Gain**: Average percentage gain on profitable trades
- **Alpaca Value**: Total value of your Alpaca account
- **Buying Power**: Available funds for trading
- **Today's P/L**: Profit/loss for today
- **Avg. Loss**: Average percentage loss on losing trades
- **Risk/Reward**: Ratio of average gain to average loss
- **Profit Factor**: Ratio of gross profits to gross losses
- **Open Positions**: Number of current open positions
- **Cash**: Available cash in account
- **Cash Withdrawable**: Amount that can be withdrawn

## Trading Charts

### Viewing Charts
In the compact layout:
- Select the "Chart" tab in the main content area
- Use the timeframe selector to change the chart period

In the standard layout:
- The chart appears in a prominent panel
- Resize as needed by dragging panel edges

### Chart Controls
- **Symbol Selector**: Change the trading symbol
- **Timeframe**: Switch between timeframes (1m, 5m, 15m, 1h, 4h, 1D)
- **Indicators**: Add technical indicators to the chart

## Watchlist

### Managing Your Watchlist
In both layouts:
- Add symbols by entering them in the "Add Symbol" input
- Remove symbols by clicking the "X" next to them
- Click any symbol to display it on the chart

### Sorting and Filtering
- Sort by symbol, price, or change %
- Use the search box to filter symbols

## Auto-Trading

### Enabling Auto-Trading
1. Ensure your Alpaca account is connected
   - If not connected, click "Connect Alpaca" and enter credentials
2. Toggle the "Enable Auto-Trading" switch:
   - In compact layout: Right panel
   - In standard layout: Auto-trading panel
3. The toggle will turn green when active

### Trading Parameters
Configure auto-trading settings:
- **Max Position Size**: Maximum amount per trade
- **Risk per Trade**: Maximum risk percentage
- **Strategy**: Select trading strategy
- **Trade Frequency**: How often trades are executed

## Backend Services

### Managing Services
Each service has start/stop controls:
- **AI Analysis Service**: Market and strategy analysis
- **RL Tuning Service**: Reinforcement learning optimization
- **Strategy Evolution Service**: Genetic algorithm optimization

### Service Status Indicators
- **Green**: Service running
- **Red**: Service stopped
- **Yellow**: Service starting or has warnings

### Starting All Services
- Click "Start All" to start all services at once
- Alternatively, start individual services as needed

## Strategy Optimization

### Viewing Strategy Performance
1. Navigate to the Strategy Comparison tab
2. View performance metrics for each strategy
3. Compare strategies side by side

### Optimizing Strategies
1. Navigate to the Strategy Evolution tab
2. Click "Start Evolution" to begin optimization
3. Set parameters:
   - Population Size
   - Generations
   - Mutation Rate
4. View progress and results in real-time

## Troubleshooting

### Connection Issues
If the dashboard shows "Disconnected":
1. Check that backend services are running
2. Click the connection status to attempt reconnect
3. Restart services if necessary

### Service Errors
If services show errors:
1. Check the logs folder for error details
2. Restart the problematic service
3. Ensure all dependencies are installed

### Layout Issues
If the layout doesn't fit your screen:
1. Try switching between compact and standard layouts
2. Adjust your browser zoom level
3. Use a minimum resolution of 1366x768 for best results

---

## Quick Reference

### Keyboard Shortcuts
- **Ctrl+T**: Toggle between layouts
- **Ctrl+R**: Refresh analysis
- **Ctrl+S**: Start all services
- **Ctrl+X**: Stop all services

### Important Controls
- **Auto-Trading Toggle**: Enable/disable automated trading
- **Service Start/Stop**: Control backend services
- **Refresh Analysis**: Update AI recommendations
- **Symbol Selector**: Change the active trading symbol

### Color Indicators
- **Green**: Positive values, active services, enabled features
- **Red**: Negative values, stopped services, disabled features
- **Yellow/Orange**: Warnings, cautions, or mixed results
- **Blue**: Neutral information or selection indicators
