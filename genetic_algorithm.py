import numpy as np
from deap import creator, base, tools, algorithms
import flask
from flask import Flask, jsonify, request
import threading
import json
import os

# Strategy DNA: [RSI_threshold, MACD_fast, MACD_slow, hold_period]
creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)

toolbox = base.Toolbox()
toolbox.register("attr_float", np.random.uniform, 0, 1)
toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr_float, n=4)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)

# Mock backtest function - in production this would call your actual backtesting engine
def backtest(params):
    # Convert normalized genes to actual strategy parameters
    rsi_threshold = int(params[0] * 100)  # 0-100
    macd_fast = int(params[1] * 50)       # 0-50
    macd_slow = int(macd_fast + params[2] * 150)  # macd_fast + (0-150)
    hold_period = int(params[3] * 30)     # 0-30 days
    
    # This is a mock fitness function - would be replaced with actual backtest results
    # Higher RSI threshold generally means more conservative entry
    # MACD parameters balance between responsiveness and noise reduction
    # Optimal hold period depends on the specific strategy
    fitness = (
        np.sin(rsi_threshold/20) * 0.4 +  # Optimal RSI around 50-60
        np.exp(-(macd_fast-12)**2/100) * 0.3 +  # Rewards MACD fast around 12
        np.exp(-(macd_slow-26)**2/400) * 0.2 +  # Rewards MACD slow around 26
        np.sin(hold_period/10) * 0.1      # Rewards moderate hold periods
    )
    
    # Add some noise to simulate market variability
    fitness += np.random.normal(0, 0.05)
    
    return (max(0, fitness),)  # Return as tuple for DEAP

def evalStrategy(individual):
    # Convert genes to actual parameters for readability
    rsi, macd_fast, macd_slow, hold = individual
    # Backtest with these parameters
    return backtest(individual)

def run_evolution(generations=10, pop_size=50):
    # Create initial population
    pop = toolbox.population(n=pop_size)
    
    # Register genetic operators
    toolbox.register("evaluate", evalStrategy)
    toolbox.register("mate", tools.cxBlend, alpha=0.5)
    toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=0.2, indpb=0.2)
    toolbox.register("select", tools.selTournament, tournsize=3)
    
    # Statistics setup
    stats = tools.Statistics(lambda ind: ind.fitness.values)
    stats.register("avg", np.mean)
    stats.register("std", np.std)
    stats.register("min", np.min)
    stats.register("max", np.max)
    
    # Run the algorithm
    pop, log = algorithms.eaSimple(pop, toolbox, cxpb=0.7, mutpb=0.2, 
                                  ngen=generations, stats=stats, 
                                  verbose=True)
    
    # Return the best individual
    best = tools.selBest(pop, 1)[0]
    return {
        "rsi_threshold": int(best[0] * 100),
        "macd_fast": int(best[1] * 50),
        "macd_slow": int(best[1] * 50 + best[2] * 150),
        "hold_period": int(best[3] * 30),
        "fitness": best.fitness.values[0],
        "generation_stats": log
    }

# Save the best strategy to a file
def save_best_strategy(strategy):
    with open('best_strategy.json', 'w') as f:
        json.dump(strategy, f)

# Load the best strategy from a file
def load_best_strategy():
    if os.path.exists('best_strategy.json'):
        with open('best_strategy.json', 'r') as f:
            return json.load(f)
    return None

# Flask API
app = Flask(__name__)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "Genetic Algorithm Strategy Evolution"})

@app.route('/evolve', methods=['POST'])
def evolve():
    data = request.json
    generations = data.get('generations', 10)
    pop_size = data.get('pop_size', 50)
    
    result = run_evolution(generations, pop_size)
    save_best_strategy(result)
    
    return jsonify(result)

@app.route('/best', methods=['GET'])
def get_best():
    best = load_best_strategy()
    if best:
        return jsonify(best)
    else:
        return jsonify({"error": "No evolved strategy found"}), 404

@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

def start_server():
    app.run(host='0.0.0.0', port=7000)

if __name__ == "__main__":
    print("Starting Genetic Algorithm Strategy Evolution server on port 7000...")
    start_server()
