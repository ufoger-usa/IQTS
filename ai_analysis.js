// AI Analysis Module for IQTS ChatBot

class AIAnalyzer {
    constructor() {
        this.lastAnalysis = null;
        this.refreshInterval = 3600000; // Default: refresh every hour
    }    // Initialize the analyzer
    async init() {
        try {
            // Add AI analysis section to the UI if it doesn't exist
            this.ensureUIElements();
            
            // Check and apply dark mode if needed
            this.applyTheme();
            
            // Listen for theme changes
            this.setupThemeListener();
            
            // Get initial analysis
            await this.refreshAnalysis();
            
            // Set up refresh timer
            this.startRefreshTimer();
            
            console.log('AI Analyzer initialized');
        } catch (error) {
            console.error('Failed to initialize AI Analyzer:', error);
        }
    }
      // Make sure the UI elements exist
    ensureUIElements() {
        // Check if the AI insights section already exists
        if (!document.getElementById('ai-insights-container')) {
            // Find where to insert our panel (first panel or top of page)
            const firstPanel = document.querySelector('.panel');
            
            if (!firstPanel) {
                console.error('No suitable location found to add AI insights panel');
                return;
            }
              // Create and insert AI insights container
            const aiContainer = document.createElement('div');
            aiContainer.id = 'ai-insights-container';
            aiContainer.className = 'panel';
            
            // Check if dark mode is active on creation
            if (this.isDarkMode()) {
                aiContainer.classList.add('dark');
            }
            
            aiContainer.innerHTML = `
                <div class="ai-insights">
                    <h3>🤖 AI Recommendations</h3>
                    <div class="insight positive">
                        <span>✅</span> Best Strategy: <span id="ai-best-strategy">Loading...</span>
                    </div>
                    <div class="insight warning">
                        <span>⚠️</span> Watch Out: <span id="ai-warning">Analyzing...</span>
                    </div>
                    <button id="refresh-ai-analysis">
                        <i class="fas fa-sync-alt"></i> Refresh Analysis
                    </button>
                </div>
            `;
            
            // Insert before the first panel
            firstPanel.parentNode.insertBefore(aiContainer, firstPanel);
            
            console.log('Added AI insights panel to the DOM');
            
            // Add event listener to refresh button
            const refreshBtn = document.getElementById('refresh-ai-analysis');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.refreshAnalysis();
                });
            }
            
            // Load CSS if not already loaded
            if (!document.querySelector('link[href="ai_analysis.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'ai_analysis.css';
                document.head.appendChild(link);
            }
        }
    }
      // Refresh the analysis data
    async refreshAnalysis() {
        try {
            // Check if elements exist
            const strategyEl = document.getElementById('ai-best-strategy');
            const warningEl = document.getElementById('ai-warning');
            const insightsEl = document.querySelector('.ai-insights');
            
            if (!strategyEl || !warningEl || !insightsEl) {
                console.error('AI analysis UI elements not found');
                return null;
            }
            
            // Show loading state
            strategyEl.textContent = 'Loading...';
            warningEl.textContent = 'Analyzing...';
            insightsEl.classList.add('refreshing');
            
            // Get fresh analysis
            this.lastAnalysis = await getAIAnalysis();
            
            // Check if analysis was successful
            if (this.lastAnalysis && this.lastAnalysis.top_strategy !== 'unavailable') {
                // Apply strategy recommendations if AutoTrader is available
                if (typeof autoTrader !== 'undefined' && 
                    typeof autoTrader.optimizeStrategy === 'function') {
                    autoTrader.optimizeStrategy();
                }
            } else {
                console.warn('Analysis returned unavailable status');
            }
            
            // Remove loading state
            insightsEl.classList.remove('refreshing');
            
            return this.lastAnalysis;
        } catch (error) {
            console.error('Failed to refresh AI analysis:', error);
            
            const strategyEl = document.getElementById('ai-best-strategy');
            const warningEl = document.getElementById('ai-warning');
            const insightsEl = document.querySelector('.ai-insights');
            
            if (strategyEl) strategyEl.textContent = 'Error';
            if (warningEl) warningEl.textContent = 'Analysis service unavailable';
            if (insightsEl) insightsEl.classList.remove('refreshing');
            
            return null;
        }
    }
      // Start the refresh timer
    startRefreshTimer() {
        setInterval(() => {
            this.refreshAnalysis();
        }, this.refreshInterval);
    }
    
    // Apply current theme to AI analysis panel
    applyTheme() {
        const isDarkMode = this.isDarkMode();
        const aiContainer = document.getElementById('ai-insights-container');
        
        if (aiContainer) {
            if (isDarkMode) {
                aiContainer.classList.add('dark');
            } else {
                aiContainer.classList.remove('dark');
            }
        }
    }
      // Check if dark mode is active
    isDarkMode() {
        // Check for dark-mode class on body (main app's dark mode implementation)
        if (document.body.classList.contains('dark-mode')) {
            return true;
        }
        
        // Fallbacks for other dark mode implementations
        if (document.body.classList.contains('dark') || 
            document.documentElement.classList.contains('dark')) {
            return true;
        }
        
        // Check for data-theme attribute
        if (document.body.getAttribute('data-theme') === 'dark' || 
            document.documentElement.getAttribute('data-theme') === 'dark') {
            return true;
        }
        
        // Check if background is dark (as a fallback)
        const bgColor = window.getComputedStyle(document.body).backgroundColor;
        if (bgColor) {
            // Convert rgb to brightness
            const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
            if (match) {
                const brightness = (parseInt(match[1]) * 299 + 
                                 parseInt(match[2]) * 587 + 
                                 parseInt(match[3]) * 114) / 1000;
                return brightness < 128; // If less than 128, it's dark
            }
        }
        
        return false;
    }
    
    // Set up listener for theme changes
    setupThemeListener() {
        // Using MutationObserver to detect theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' || 
                    mutation.attributeName === 'data-theme') {
                    this.applyTheme();
                }
            });
        });
        
        // Observe body and html for class or data-theme changes
        observer.observe(document.body, { attributes: true });
        observer.observe(document.documentElement, { attributes: true });
        
        // Also listen for custom theme change events that might be fired
        window.addEventListener('themechange', () => this.applyTheme());
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the AI analyzer
    window.aiAnalyzer = new AIAnalyzer();
    window.aiAnalyzer.init();
});
