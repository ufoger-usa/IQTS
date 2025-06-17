/**
 * tooltips.js - Adds helpful tooltips to IQTS Dashboard elements
 * This script enhances user experience by providing contextual help
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
});

/**
 * Initialize tooltips for dashboard elements
 */
function initializeTooltips() {
    // Create tooltip mapping - element selector to tooltip text
    const tooltips = {
        // Header elements
        '#connection-status': 'Shows connection status to Alpaca API. Click to connect/disconnect.',
        '.theme-btn': 'Change the visual theme of the dashboard',
        
        // Stats panel
        '.stats .stat:nth-child(1)': 'Total number of trades executed',
        '.stats .stat:nth-child(2)': 'Percentage of profitable trades',
        '.stats .stat:nth-child(3)': 'Average percentage gain on profitable trades',
        '.stats .stat:nth-child(4)': 'Average percentage loss on unprofitable trades',
        '.stats .stat:nth-child(5)': 'Ratio of average gain to average loss',
        '.stats .stat:nth-child(6)': 'Ratio of gross profits to gross losses',
        
        '.alpaca-stats .stat:nth-child(1)': 'Total account value',
        '.alpaca-stats .stat:nth-child(2)': 'Available funds for trading',
        '.alpaca-stats .stat:nth-child(3)': 'Profit or loss for the current trading day',
        '.alpaca-stats .stat:nth-child(4)': 'Cash available in your account',
        '.alpaca-stats .stat:nth-child(5)': 'Cash available for withdrawal',
        
        // AI recommendations
        '.ai-recommendations': 'AI-generated trading suggestions based on market analysis',
        '#refresh-analysis-btn': 'Update AI analysis with latest market data',
        
        // Auto-trading
        '#auto-trading-toggle': 'Enable or disable automated trading',
        '.auto-trading-params': 'Configure parameters for automated trading',
        
        // Service controls
        '#start-all-services': 'Start all backend services',
        '#stop-all-services': 'Stop all backend services',
        '.service-status': 'Current status of the backend service',
        
        // Strategy controls
        '#strategy-selector': 'Select the trading strategy to use',
        '.strategy-info-toggle': 'View detailed information about the selected strategy',
        
        // Watchlist
        '.watchlist-add': 'Add a new symbol to your watchlist',
        '.watchlist-item .chart-link': 'View detailed chart for this symbol',
        
        // Simulation
        '#run-simulation': 'Test the selected strategy using historical data',
        '#simulation-results': 'Performance metrics from the simulation'
    };
    
    // Apply tooltips to elements
    for (const [selector, text] of Object.entries(tooltips)) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.setAttribute('title', text);
            // For mobile/touch devices, add special handling 
            el.addEventListener('touchstart', showMobileTooltip);
        });
    }
    
    console.log('Tooltips initialized');
}

/**
 * Show tooltip on mobile/touch devices
 * @param {Event} event - Touch event
 */
function showMobileTooltip(event) {
    const element = event.currentTarget;
    const tooltipText = element.getAttribute('title');
    
    // Don't show default tooltip
    element.setAttribute('data-original-title', tooltipText);
    element.setAttribute('title', '');
    
    // Create custom tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'mobile-tooltip';
    tooltip.textContent = tooltipText;
    document.body.appendChild(tooltip);
    
    // Position tooltip near element
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
    
    // Hide tooltip after delay
    setTimeout(() => {
        document.body.removeChild(tooltip);
        // Restore original title
        element.setAttribute('title', element.getAttribute('data-original-title'));
        element.removeAttribute('data-original-title');
    }, 3000);
}

// Add CSS for mobile tooltips
const style = document.createElement('style');
style.textContent = `
.mobile-tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 9999;
    max-width: 250px;
    text-align: center;
    animation: fadeIn 0.3s;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;
document.head.appendChild(style);
