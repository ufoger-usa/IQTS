# Compact Monochrome Layout

This update introduces a new compact layout for the IQTS AI Trading Dashboard that fits all functionality on a single screen without scrolling and uses a monochromatic color scheme with red/green toggles for important controls.

## Key Features

1. **Single-page Layout**: All content fits on one screen without scrolling
2. **Monochrome Design**: Clean monochrome UI with red/green accents for important toggles
3. **Organized Panels**:
   - Left panel: Services and navigation controls
   - Middle panel: Charts and visualizations with tabbed interface
   - Right panel: Auto-trading controls and metrics
4. **Improved Organization**: 
   - Trading controls grouped in one area
   - Visualizations grouped separately
   - Auto-trading controls consolidated
5. **Maintained Functionality**: All original features remain intact

## How to Toggle Layouts

You can now easily switch between layouts with the layout toggle buttons:

1. In the **compact layout**, click the "Standard View" button in the theme controls section in the header.
2. In the **standard layout**, click the "Switch to Compact View" button in the bottom right corner.

Your layout preference will be saved between sessions.

Previously, you had to use the browser console:
document.querySelector('.compact-container').style.display = 'grid';
document.querySelector('.container').style.display = 'none';
```

## Technical Implementation

- `compact-layout.css`: Contains all styling for the compact monochrome UI
- `compact-layout.js`: Handles the layout reorganization and tab functionality
- Changes are non-destructive - original UI elements are preserved

## Auto-Trading Controls

All auto-trading controls are now consolidated in the right panel, including:
- Enable/disable toggle (with prominent red/green indicator)
- Risk management settings
- Strategy selection
- Stop loss configuration
- Profit target settings
- Active trading hours

## Services Management

Service controls are now more compact and accessible in the left panel:
- Start/stop all services
- Individual service controls
- Status indicators
- Quantum optimization settings

## Navigation

The new tabbed interface in the center panel provides quick access to all views:
- Trading Chart
- Active Trades
- Watchlist
- Performance
- AI Analysis
- Strategy Comparison
- Quantum Optimization
- Trade History
