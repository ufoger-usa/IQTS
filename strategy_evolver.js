// strategy_evolver.js
class StrategyEvolver {
    constructor() {
        this.population = [];
        this.generation = 0;
        this.bestStrategy = null;
        this.evolutionInProgress = false;
        this.evolutionStats = [];
    }
    
    async initialize() {
        try {
            // Try to load best strategy from server
            const response = await fetch('http://localhost:7000/best');
            if (response.ok) {
                this.bestStrategy = await response.json();
                console.log('Loaded best strategy:', this.bestStrategy);
                
                // Update UI
                this.updateEvolutionUI();
            }
        } catch (error) {
            console.log('No previously evolved strategy found');
        }
    }
    
    async runGeneration(generations = 10, popSize = 50) {
        if (this.evolutionInProgress) {
            console.log('Evolution already in progress');
            return false;
        }
        
        this.evolutionInProgress = true;
        document.getElementById('run-evolution').disabled = true;
        document.getElementById('run-evolution').textContent = 'Evolution in progress...';
        
        try {
            const response = await fetch('http://localhost:7000/evolve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    generations: generations,
                    pop_size: popSize
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.bestStrategy = result;
                this.generation += generations;
                this.evolutionStats.push({
                    generation: this.generation,
                    fitness: result.fitness,
                    params: {
                        rsi: result.rsi_threshold,
                        macdFast: result.macd_fast,
                        macdSlow: result.macd_slow,
                        holdPeriod: result.hold_period
                    }
                });
                
                // Update the strategy in the trading system
                await this.applyStrategyToSystem();
                
                // Update UI
                this.updateEvolutionUI();
                
                console.log(`Evolution completed: generation ${this.generation}, fitness: ${result.fitness}`);
                return true;
            } else {
                console.error('Evolution failed:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('Evolution error:', error);
            return false;
        } finally {
            this.evolutionInProgress = false;
            document.getElementById('run-evolution').disabled = false;
            document.getElementById('run-evolution').textContent = 'Run Next Generation';
        }
    }
    
    async applyStrategyToSystem() {
        if (!this.bestStrategy) return;
        
        try {
            // Send the best strategy to the trading system
            // This would integrate with your existing system
            console.log('Applying strategy to trading system:', this.bestStrategy);
            
            // Example of how this might integrate with your existing code
            if (window.autoTrader) {
                // Update trading parameters based on evolved strategy
                await window.autoTrader.updateParameters({
                    rsiThreshold: this.bestStrategy.rsi_threshold,
                    macdFastPeriod: this.bestStrategy.macd_fast,
                    macdSlowPeriod: this.bestStrategy.macd_slow,
                    holdPeriodDays: this.bestStrategy.hold_period
                });
                
                console.log('Strategy applied to trading system');
            }
        } catch (error) {
            console.error('Failed to apply strategy:', error);
        }
    }
    
    updateEvolutionUI() {
        if (!this.bestStrategy) return;
        
        // Update generation counter
        document.getElementById('gen-counter').textContent = this.generation;
        
        // Update best fitness
        document.getElementById('best-fitness').textContent = this.bestStrategy.fitness.toFixed(4);
        
        // Update DNA strand visualization
        this.updateDNAVisualization();
    }
    
    updateDNAVisualization() {
        if (!this.bestStrategy) return;
        
        const dnaContainer = document.getElementById('best-dna');
        dnaContainer.innerHTML = '';
        
        // Create a visual representation of the strategy DNA
        const dnaParams = [
            { name: 'RSI', value: this.bestStrategy.rsi_threshold, max: 100 },
            { name: 'MACD Fast', value: this.bestStrategy.macd_fast, max: 50 },
            { name: 'MACD Slow', value: this.bestStrategy.macd_slow, max: 200 },
            { name: 'Hold Period', value: this.bestStrategy.hold_period, max: 30 }
        ];
        
        dnaParams.forEach(param => {
            const dnaGene = document.createElement('div');
            dnaGene.className = 'dna-gene';
            
            const geneLabel = document.createElement('div');
            geneLabel.className = 'gene-label';
            geneLabel.textContent = param.name;
            
            const geneValue = document.createElement('div');
            geneValue.className = 'gene-value';
            geneValue.textContent = param.value;
            
            const geneBar = document.createElement('div');
            geneBar.className = 'gene-bar';
            const geneBarFill = document.createElement('div');
            geneBarFill.className = 'gene-bar-fill';
            geneBarFill.style.width = `${(param.value / param.max) * 100}%`;
            geneBar.appendChild(geneBarFill);
            
            dnaGene.appendChild(geneLabel);
            dnaGene.appendChild(geneValue);
            dnaGene.appendChild(geneBar);
            
            dnaContainer.appendChild(dnaGene);
        });
    }
    
    // Helper method to get the best strategy for telegram or other components
    getBestStrategy() {
        return this.bestStrategy;
    }
}

// Initialize global instance
window.strategyEvolver = new StrategyEvolver();

// Set up event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the evolver
    window.strategyEvolver.initialize();
    
    // Set up run evolution button
    const runEvolutionBtn = document.getElementById('run-evolution');
    if (runEvolutionBtn) {
        runEvolutionBtn.addEventListener('click', async () => {
            await window.strategyEvolver.runGeneration(5, 30); // Run 5 generations with population size 30
        });
    }
});
