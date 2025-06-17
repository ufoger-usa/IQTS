/**
 * Live Strategy Optimization Engine
 * Tracks performance of different strategies and automatically adjusts weights
 */

class OptimizationEngine {
  constructor() {
    this.performanceLog = [];
  }
  
  /**
   * Logs performance of a strategy execution
   * @param {string} strategy - Name of the strategy
   * @param {object} result - Execution result with profit and other metrics
   */
  logStrategyPerformance(strategy, result) {
    this.performanceLog.push({
      strategy,
      date: new Date(),
      profit: result.profit,
      winRate: result.winRate
    });
    
    // Auto-adjust strategy weights every 24h
    if (this.performanceLog.length % 100 === 0) {
      this.rebalanceStrategies();
    }
  }
  
  /**
   * Rebalances strategy weights based on performance
   */
  rebalanceStrategies() {
    const bestStrategy = this.calculateBestStrategy();
    
    autoTrader.setStrategyWeights({
      [bestStrategy]: 0.6,  // 60% allocation
      secondary: 0.4        // 40% to others
    });
  }
  
  /**
   * Calculates which strategy has performed best
   * @returns {string} Name of best performing strategy
   */
  calculateBestStrategy() {
    // Get last 100 trades or all if fewer
    const recentTrades = this.performanceLog.slice(-100);
    
    // Group by strategy
    const strategyPerformance = {};
    
    recentTrades.forEach(trade => {
      if (!strategyPerformance[trade.strategy]) {
        strategyPerformance[trade.strategy] = {
          totalProfit: 0,
          count: 0
        };
      }
      
      strategyPerformance[trade.strategy].totalProfit += trade.profit;
      strategyPerformance[trade.strategy].count++;
    });
    
    // Calculate average profit per strategy
    let bestStrategy = 'swing';  // default
    let bestPerformance = -Infinity;
    
    Object.keys(strategyPerformance).forEach(strategy => {
      const avgProfit = strategyPerformance[strategy].totalProfit / 
                        strategyPerformance[strategy].count;
      
      if (avgProfit > bestPerformance) {
        bestPerformance = avgProfit;
        bestStrategy = strategy;
      }
    });
    
    console.log(`Best strategy: ${bestStrategy} with avg profit: ${bestPerformance.toFixed(2)}%`);
    return bestStrategy;
  }
  
  /**
   * Gets the current best strategy recommendation
   * @returns {object} Strategy recommendation object
   */
  getBestStrategy() {
    const strategy = this.calculateBestStrategy();
    
    // Get all trades for this strategy
    const strategyTrades = this.performanceLog.filter(t => t.strategy === strategy);
    
    // Calculate total profit
    const totalProfit = strategyTrades.reduce((sum, trade) => sum + trade.profit, 0);
    
    return {
      name: strategy,
      profit: totalProfit.toFixed(2) + '%',
      allocation: strategy === 'ai-optimized' ? '60%' : '20%'  // Example allocation
    };
  }
}

// Create global instance of the optimization engine
const optimizationEngine = new OptimizationEngine();

// Event listener for when a trade is completed
document.addEventListener('tradecompleted', function(event) {
  const tradeResult = event.detail;
  
  // Log the trade to the optimization engine
  optimizationEngine.logStrategyPerformance(
    tradeResult.strategy || 'swing',
    {
      profit: tradeResult.profitPercent || 0,
      winRate: tradeResult.isWin ? 1 : 0
    }
  );
});

// Initialize with some example data
function initOptimizationEngine() {
  // Sample data to initialize the engine
  const sampleData = [
    { strategy: 'swing', profit: 2.5, winRate: 1 },
    { strategy: 'scalp', profit: 1.2, winRate: 1 },
    { strategy: 'ai-optimized', profit: 3.1, winRate: 1 },
    { strategy: 'swing', profit: -1.3, winRate: 0 },
    { strategy: 'ai-optimized', profit: 2.8, winRate: 1 }
  ];
  
  sampleData.forEach(data => {
    optimizationEngine.logStrategyPerformance(data.strategy, data);
  });
}

// Initialize optimization engine when the document is ready
document.addEventListener('DOMContentLoaded', initOptimizationEngine);