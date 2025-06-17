// Profit-Taking Strategies and Safety Enhancements

// Profit-Taking Strategies
class ProfitTaking {
    constructor() {
        this.targets = {
            partial1: 0.03,  // 3% - first profit target
            partial2: 0.06,  // 6% - second profit target
            full: 0.10       // 10% - full exit
        };
        
        this.portions = {
            partial1: 0.25,  // 25% of position on first target
            partial2: 0.50,  // 50% of remaining position on second target
            full: 1.00       // 100% of remaining position on final target
        };
        
        this.enabled = {
            partial1: true,
            partial2: true,
            full: true
        };
    }
    
    // Load saved settings
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('profitTakingSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.targets = {...this.targets, ...settings.targets};
                this.portions = {...this.portions, ...settings.portions};
                this.enabled = {...this.enabled, ...settings.enabled};
            }
        } catch (error) {
            console.error('Error loading profit-taking settings:', error);
        }
    }
    
    // Save settings
    saveSettings() {
        try {
            localStorage.setItem('profitTakingSettings', JSON.stringify({
                targets: this.targets,
                portions: this.portions,
                enabled: this.enabled
            }));
        } catch (error) {
            console.error('Error saving profit-taking settings:', error);
        }
    }
    
    // Check if profit target has been hit
    checkProfitTarget(entryPrice, currentPrice, targetLevel) {
        if (!this.enabled[targetLevel]) return false;
        
        const profitPercent = (currentPrice / entryPrice) - 1;
        return profitPercent >= this.targets[targetLevel];
    }
    
    // Calculate how many shares to sell at a given target
    calculateSellQuantity(position, targetLevel) {
        if (!position || position.qty <= 0) return 0;
        
        // Convert position.qty to a number if it's a string
        const totalQty = typeof position.qty === 'string' ? parseFloat(position.qty) : position.qty;
        
        // Calculate portion to sell based on target level
        let portionToSell = 0;
        switch(targetLevel) {
            case 'partial1':
                portionToSell = this.portions.partial1;
                break;
            case 'partial2': 
                portionToSell = this.portions.partial2;
                break;
            case 'full':
                portionToSell = this.portions.full;
                break;
            default:
                console.error(`Unknown target level: ${targetLevel}`);
                return 0;
        }
        
        // Calculate sell quantity and round to whole shares
        return Math.floor(totalQty * portionToSell);
    }
}

// Market Safety Checks
class SafetyChecks {
    constructor() {
        this.vixThreshold = 25; // Consider market volatile if VIX > 25
        this.emergencyMode = false;
        this.maxDrawdown = -0.15; // 15% max portfolio drawdown
    }
    
    // Load saved settings
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('safetySettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.vixThreshold = settings.vixThreshold || this.vixThreshold;
                this.maxDrawdown = settings.maxDrawdown || this.maxDrawdown;
            }
        } catch (error) {
            console.error('Error loading safety settings:', error);
        }
    }
    
    // Save settings
    saveSettings() {
        try {
            localStorage.setItem('safetySettings', JSON.stringify({
                vixThreshold: this.vixThreshold,
                maxDrawdown: this.maxDrawdown
            }));
        } catch (error) {
            console.error('Error saving safety settings:', error);
        }
    }
    
    // Check if market conditions are safe for trading
    isMarketSafe(vixValue, portfolioDrawdown) {
        if (this.emergencyMode) {
            return false; // Emergency mode - halt all trading
        }
        
        if (vixValue > this.vixThreshold) {
            console.log(`Market volatility high: VIX at ${vixValue} (threshold: ${this.vixThreshold})`);
            return false;
        }
        
        if (portfolioDrawdown < this.maxDrawdown) {
            console.log(`Exceeded max drawdown: ${(portfolioDrawdown * 100).toFixed(2)}% (threshold: ${(this.maxDrawdown * 100).toFixed(2)}%)`);
            return false;
        }
        
        return true;
    }
    
    // Toggle emergency mode
    toggleEmergencyMode(enabled) {
        this.emergencyMode = enabled;
        console.log(`Emergency mode ${enabled ? 'activated' : 'deactivated'}`);
        return this.emergencyMode;
    }
}

// Export for use in other files
window.ProfitTaking = ProfitTaking;
window.SafetyChecks = SafetyChecks;
