// Simulation Engine for Paper Trading
// Allows risk-free testing of strategies with historical data

class SimulationEngine {
    constructor() {
        this.historicalData = {}; // Stores market data
        this.virtualBalance = 10000; // Starting balance
    }
    
    async simulateTrade(signal) {
        if (!document.getElementById('simulation-mode').checked) return;
        
        // Get historical prices for backtesting
        const prices = await this.loadHistoricalData(signal.symbol);
        const entryPrice = prices[signal.entryTime];
        const exitPrice = prices[signal.exitTime];
        
        // Calculate virtual P/L
        const pl = signal.type === 'buy'
            ? (exitPrice - entryPrice) * signal.quantity
            : (entryPrice - exitPrice) * signal.quantity;
        
        this.virtualBalance += pl;
        return pl;
    }
    
    async loadHistoricalData(symbol) {
        // Check if we already have data for this symbol
        if (this.historicalData[symbol]) {
            return this.historicalData[symbol];
        }
        
        try {
            // Fetch historical price data
            const response = await fetch(`https://api.example.com/historical/${symbol}`);
            
            // If the API is not available, use mock data for demo
            if (!response.ok) {
                console.log('Using mock historical data for simulation');
                // Generate mock historical data for demo purposes
                const mockData = this.generateMockHistoricalData();
                this.historicalData[symbol] = mockData;
                return mockData;
            }
            
            const data = await response.json();
            this.historicalData[symbol] = data.prices;
            return data.prices;
        } catch (error) {
            console.error('Error loading historical data:', error);
            // Generate fallback mock data
            const mockData = this.generateMockHistoricalData();
            this.historicalData[symbol] = mockData;
            return mockData;
        }
    }
    
    generateMockHistoricalData() {
        // Create mock price data for simulation purposes
        const now = new Date();
        const mockData = {};
        
        // Generate 30 days of hourly data
        for (let i = 0; i < 30; i++) {
            for (let h = 0; h < 24; h++) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                date.setHours(h, 0, 0, 0);
                const timestamp = date.toISOString();
                
                // Generate a somewhat realistic price with some randomness
                const basePrice = 100 + Math.sin(i/5) * 10;
                const noise = Math.random() * 5 - 2.5;
                mockData[timestamp] = basePrice + noise;
            }
        }
        
        return mockData;
    }
    
    // Run a backtest over a period of time
    async runBacktest(days = 30) {
        // Reset virtual balance before backtest
        const startingBalance = this.virtualBalance;
        this.virtualBalance = 10000;
        
        // Get signals from the strategy
        const signals = await this.generateBacktestSignals(days);
        
        let winCount = 0;
        let lossCount = 0;
        
        // Process each signal
        for (const signal of signals) {
            const pl = await this.simulateTrade(signal);
            
            if (pl > 0) winCount++;
            else if (pl < 0) lossCount++;
        }
        
        // Calculate win rate
        const totalTrades = winCount + lossCount;
        const winRate = totalTrades > 0 ? (winCount / totalTrades * 100).toFixed(1) : '0';
        
        // Update UI
        document.getElementById('virtual-balance').textContent = `$${this.virtualBalance.toFixed(2)}`;
        document.getElementById('sim-win-rate').textContent = `${winRate}%`;
        
        // Reset virtual balance to what it was before
        this.virtualBalance = startingBalance;
        
        return {
            winRate,
            finalBalance: this.virtualBalance,
            totalTrades
        };
    }
    
    // Generate test signals based on strategy rules
    async generateBacktestSignals(days) {
        // In a real implementation, this would use actual strategy rules
        // For demo, we'll generate random signals
        const signals = [];
        const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
        
        const now = new Date();
        
        // Generate signals for the past X days
        for (let i = 0; i < days; i++) {
            const day = new Date(now);
            day.setDate(day.getDate() - i);
            
            // Generate 1-3 signals per day
            const signalsPerDay = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < signalsPerDay; j++) {
                const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                const type = Math.random() > 0.5 ? 'buy' : 'sell';
                
                const entryTime = new Date(day);
                entryTime.setHours(9 + Math.floor(Math.random() * 6), 0, 0, 0);
                
                const exitTime = new Date(entryTime);
                exitTime.setHours(exitTime.getHours() + 1 + Math.floor(Math.random() * 5));
                
                signals.push({
                    symbol,
                    type,
                    quantity: 100 * (Math.floor(Math.random() * 5) + 1),
                    entryTime: entryTime.toISOString(),
                    exitTime: exitTime.toISOString()
                });
            }
        }
        
        return signals;
    }
}

// Create an instance and expose it globally
window.simulationEngine = new SimulationEngine();
console.log('Simulation Engine initialized');
