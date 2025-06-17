#!/usr/bin/env python
# quantum_optimizer.py - Quantum-inspired optimization for trading strategies
# Uses D-Wave's Leap hybrid sampler for quantum annealing

from flask import Flask, request, jsonify
import numpy as np
import json
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    filename='logs/quantum_optimizer.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Initialize Flask app
app = Flask(__name__)

# Try to import D-Wave tools, with fallback for environments without D-Wave SDK
try:
    from dwave.system import LeapHybridSampler
    DWAVE_AVAILABLE = True
    logging.info("D-Wave Leap SDK available - using quantum capabilities")
except ImportError:
    DWAVE_AVAILABLE = False
    logging.warning("D-Wave Leap SDK not available - using classical optimization fallback")

def create_qubo_matrix(strategies):
    """
    Create a QUBO (Quadratic Unconstrained Binary Optimization) matrix
    from trading strategy parameters
    """
    n = len(strategies)
    # Initialize QUBO matrix (Q)
    Q = np.zeros((n, n))
    
    # Populate the matrix based on strategy correlations and performance
    for i in range(n):
        # Diagonal terms represent individual strategy performance
        Q[i, i] = -strategies[i].get('performance', 0)
        
        # Off-diagonal terms represent interaction/correlation between strategies
        for j in range(i+1, n):
            correlation = strategies[i].get('correlation', {}).get(strategies[j]['id'], 0)
            # Penalize highly correlated strategies to promote diversity
            Q[i, j] = correlation * 0.5
            Q[j, i] = correlation * 0.5
            
    return Q

def decode_quantum_solution(response):
    """
    Decode the solution from the quantum annealer
    """
    # Extract the solution with the lowest energy
    solution = response.first.sample
    
    # Convert to strategy weights (0 = exclude, 1 = include in portfolio)
    selected_indices = [i for i, val in solution.items() if val == 1]
    
    # Return the optimized portfolio configuration
    return {
        "selected_strategies": selected_indices,
        "energy": float(response.first.energy),
        "execution_time": response.info.get("run_time", 0)
    }

def optimize_portfolio(strategies):
    """
    Optimize the trading strategy portfolio using quantum annealing
    """
    # Create the QUBO problem definition
    Q = create_qubo_matrix(strategies)
    
    if DWAVE_AVAILABLE:
        try:
            # Use D-Wave's hybrid quantum-classical solver
            sampler = LeapHybridSampler()
            response = sampler.sample_qubo(Q)
            return decode_quantum_solution(response)
        except Exception as e:
            logging.error(f"Error using D-Wave solver: {e}")
            # Fall back to classical optimization
            return classical_optimization_fallback(Q)
    else:
        # Use classical optimization as fallback
        return classical_optimization_fallback(Q)

def classical_optimization_fallback(Q):
    """
    Classical optimization fallback when quantum resources are unavailable
    """
    import scipy.optimize as opt
    
    n = Q.shape[0]
    
    # Define objective function for classical optimization
    def objective(x):
        return sum(Q[i, j] * x[i] * x[j] for i in range(n) for j in range(n))
    
    # Binary constraint
    bounds = [(0, 1) for _ in range(n)]
    
    # Run classical optimization
    result = opt.minimize(objective, np.random.rand(n), bounds=bounds)
    
    # Convert continuous solution to binary
    binary_solution = [1 if val > 0.5 else 0 for val in result.x]
    
    # Return in a format similar to quantum solution
    return {
        "selected_strategies": [i for i, val in enumerate(binary_solution) if val == 1],
        "energy": float(result.fun),
        "execution_time": 0,
        "solver": "classical_fallback"
    }

@app.route('/optimize', methods=['POST'])
def api_optimize():
    """
    API endpoint for strategy optimization
    """
    try:
        data = request.json
        strategies = data.get('strategies', [])
        
        if not strategies:
            return jsonify({"error": "No strategies provided"}), 400
        
        result = optimize_portfolio(strategies)
        return jsonify(result)
    
    except Exception as e:
        logging.error(f"Error in optimization API: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Configuration for the Flask server
    port = int(os.environ.get("QUANTUM_OPTIMIZER_PORT", 9000))
    
    print(f"Starting Quantum Optimizer Service on port {port}")
    print(f"Quantum capabilities: {'ENABLED' if DWAVE_AVAILABLE else 'DISABLED (using classical fallback)'}")
    
    # Start the Flask server
    app.run(host='0.0.0.0', port=port, debug=False)