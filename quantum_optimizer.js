/**
 * quantum_optimizer.js - Client-side interface for quantum optimization features
 * Provides a JavaScript interface to the quantum optimization service
 */

class HybridOptimizer {
    constructor(serviceUrl = 'http://localhost:9000') {
        this.serviceUrl = serviceUrl;
        this.isReady = false;
        this.lastResult = null;
        
        // Initialize connection to quantum service
        this._checkServiceConnection();
    }
    
    /**
     * Check if the quantum optimization service is available
     */
    async _checkServiceConnection() {
        try {
            const response = await fetch(`${this.serviceUrl}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    strategies: [{ id: 'test', performance: 1.0 }]
                })
            });
            
            if (response.ok) {
                this.isReady = true;
                document.getElementById('quantum-state').textContent = 'Connected';
                document.getElementById('quantum-state').className = 'status-connected';
            } else {
                this.isReady = false;
                document.getElementById('quantum-state').textContent = 'Error';
                document.getElementById('quantum-state').className = 'status-error';
            }
        } catch (error) {
            console.error('Quantum service connection failed:', error);
            this.isReady = false;
            
            // Update UI if the quantum-state element exists
            const stateElement = document.getElementById('quantum-state');
            if (stateElement) {
                stateElement.textContent = 'Unavailable';
                stateElement.className = 'status-error';
            }
        }
    }
    
    /**
     * Create a QUBO matrix representation for quantum optimization
     * @param {Array} strategies - Array of trading strategy objects
     * @returns {Object} - QUBO matrix
     */
    createQuboMatrix() {
        // Get the active trading strategies from the global state
        const strategies = window.tradingStrategies || [];
        
        if (!strategies.length) {
            console.warn('No strategies available for optimization');
            return {};
        }
        
        // Create a simple QUBO matrix based on strategy performance and correlations
        const quboMatrix = {};
        
        strategies.forEach((strategy, i) => {
            // Diagonal terms represent individual strategy performance
            // Higher performance = more negative value (we want to minimize energy)
            const key = `${i},${i}`;
            // Normalize performance to a value between -1 and 0
            const performance = strategy.performance || 0;
            quboMatrix[key] = -Math.min(Math.max(performance, 0), 1);
            
            // Add correlation terms (off-diagonal)
            strategies.forEach((otherStrategy, j) => {
                if (i < j) {
                    const correlationKey = `${i},${j}`;
                    const correlation = strategy.correlation?.[otherStrategy.id] || 0;
                    
                    // Positive correlation = positive QUBO value (penalize similar strategies)
                    quboMatrix[correlationKey] = correlation * 0.5;
                }
            });
        });
        
        return quboMatrix;
    }
    
    /**
     * Run quantum optimization on the current trading strategies
     * @returns {Promise<Object>} - Optimization results
     */
    async runQuantumOptimization() {
        if (!this.isReady) {
            console.warn('Quantum optimization service not available');
            return { error: 'Service not available' };
        }
        
        try {
            // Get current strategies for optimization
            const strategies = window.tradingStrategies || [];
            
            if (!strategies.length) {
                return { error: 'No strategies available' };
            }
            
            // Show loading state
            const stateElement = document.getElementById('quantum-state');
            if (stateElement) {
                stateElement.textContent = 'Optimizing...';
                stateElement.className = 'status-processing';
            }
            
            // Call the quantum optimization service
            const response = await fetch(`${this.serviceUrl}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    strategies: strategies.map(s => ({
                        id: s.id,
                        performance: s.performance || 0,
                        correlation: s.correlation || {}
                    }))
                })
            });
            
            if (!response.ok) {
                throw new Error(`Service returned status ${response.status}`);
            }
            
            const result = await response.json();
            
            // Update state
            this.lastResult = result;
            
            // Update UI
            if (stateElement) {
                stateElement.textContent = 'Ready';
                stateElement.className = 'status-connected';
            }
            
            return this.interpretResults(result);
        } catch (error) {
            console.error('Error in quantum optimization:', error);
            
            // Update UI on error
            const stateElement = document.getElementById('quantum-state');
            if (stateElement) {
                stateElement.textContent = 'Error';
                stateElement.className = 'status-error';
            }
            
            return { error: error.message };
        }
    }
    
    /**
     * Interpret the results from quantum optimization
     * @param {Object} result - Raw optimization result
     * @returns {Object} - Interpreted results with strategy recommendations
     */
    interpretResults(result) {
        if (!result || result.error) {
            return { error: result?.error || 'Invalid result' };
        }
        
        const strategies = window.tradingStrategies || [];
        
        // Map selected indices back to strategy objects
        const selectedStrategies = (result.selected_strategies || [])
            .map(index => strategies[index])
            .filter(Boolean);
        
        // Generate portfolio recommendation
        return {
            recommendedStrategies: selectedStrategies.map(s => s.id),
            portfolioWeight: this._calculatePortfolioWeights(selectedStrategies),
            executionTime: result.execution_time || 0,
            quantum: !result.solver || result.solver !== 'classical_fallback',
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Calculate optimal weights for the selected strategies
     * @param {Array} selectedStrategies - Array of selected strategy objects
     * @returns {Object} - Map of strategy IDs to their optimal weights
     */
    _calculatePortfolioWeights(selectedStrategies) {
        if (!selectedStrategies.length) return {};
        
        // Simple weighting by performance
        const totalPerformance = selectedStrategies.reduce(
            (sum, s) => sum + (s.performance || 0), 0
        );
        
        // If total performance is zero, use equal weighting
        if (totalPerformance <= 0) {
            const equalWeight = 1 / selectedStrategies.length;
            return selectedStrategies.reduce((weights, s) => {
                weights[s.id] = equalWeight;
                return weights;
            }, {});
        }
        
        // Weight proportionally to performance
        return selectedStrategies.reduce((weights, s) => {
            weights[s.id] = (s.performance || 0) / totalPerformance;
            return weights;
        }, {});
    }
}

// Create a global instance
window.hybridOptimizer = new HybridOptimizer();