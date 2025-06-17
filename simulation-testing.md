# Paper Trading Simulation Mode Testing Checklist

## Basic Functionality
- [ ] Simulation toggle correctly shows on/off state
- [ ] Toggling simulation mode shows appropriate notifications
- [ ] Badge appears in header when simulation mode is enabled
- [ ] Settings are preserved when page is refreshed
- [ ] Dark mode styling works correctly for simulation elements

## Trade Simulation
- [ ] Trades in simulation mode do not affect real balance
- [ ] Simulated trades show correct P/L calculations
- [ ] Telegram notifications show "SIMULATION" prefix for simulated trades
- [ ] Strategy rules are still applied in simulation mode
- [ ] Risk management limits are respected in simulation mode

## Backtesting
- [ ] "Run 30-Day Test" button initiates backtesting
- [ ] Progress indication shows during test
- [ ] Results are displayed after test completion
- [ ] Win rate percentage is calculated correctly
- [ ] Virtual balance updates to show backtest outcome

## Telegram Integration
- [ ] `/simulation` command correctly toggles simulation mode
- [ ] `/backtest` command runs 30-day test and returns results
- [ ] Simulation status is included in `/status` command response
- [ ] Help command includes simulation-related commands
- [ ] Error handling works for non-available simulation engine

## Edge Cases
- [ ] Handles case when historical data is not available
- [ ] Gracefully manages errors during backtest
- [ ] Works correctly with AI analysis integration
- [ ] Handles rapid toggling of simulation mode
- [ ] Correctly manages state when Telegram commands are issued rapidly

## Mobile Experience
- [ ] Simulation toggle is easily clickable on mobile
- [ ] Simulation results panel displays correctly on mobile
- [ ] Backtest button is functional on touch devices
- [ ] Notifications are visible on mobile screens
- [ ] Dark mode simulation UI works correctly on mobile

## Notes
- Write any issues or observations below:
