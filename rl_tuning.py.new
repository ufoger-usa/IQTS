#!/usr/bin/env python
# rl_tuning.py
import gym
from stable_baselines3 import PPO
import numpy as np
import json
from flask import Flask, request, jsonify

# Initialize Flask app at the module level
app = Flask(__name__)
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

# Enable CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

class TradingTuner(gym.Env):
    def __init__(self):
        super(TradingTuner, self).__init__()
        
        # Define action space (stop_loss, take_profit, position_size)
        self.action_space = gym.spaces.Box(low=0.1, high=5.0, shape=(3,))  # [stop_loss%, take_profit%, position_size%]
        
        # Define observation space (market features)
        self.observation_space = gym.spaces.Dict({
            'market_volatility': gym.spaces.Box(low=0, high=100),  # Market volatility index
            'strategy_performance': gym.spaces.Box(low=-1, high=1, shape=(3,))  # [swing, scalp, ai] performance scores
        })
        
        # Initialize state
        self.state = self._get_init_state()
        self.episode_length = 0
        self.max_episode_length = 100
        
        # Track trading performance
        self.trade_history = []
        
        # Initialize learning progress data for visualization
        self.learning_progress = {
            'episodes': [],
            'rewards': [],
            'stop_loss': [],
            'take_profit': [],
            'position_size': []
        }
        
        # Initialize model
        self.model = None
        try:
            self.model = PPO.load("trading_tuner_model")
            print("Loaded existing RL model")
        except:
            print("No existing model found, will train a new one")
            self._init_model()

    def _init_model(self):
        """Initialize a new RL model"""
        self.model = PPO('MultiInputPolicy', self, verbose=1)
        
    def _get_init_state(self):
        """Get initial state - random market conditions"""
        return {
            'market_volatility': np.array([np.random.uniform(5, 30)]),
            'strategy_performance': np.array([np.random.uniform(-0.5, 0.5) for _ in range(3)])
        }
        
    def reset(self):
        """Reset the environment to an initial state"""
        self.state = self._get_init_state()
        self.episode_length = 0
        return self.state
        
    def step(self, action):
        """
        Execute one time step within the environment
        action: [stop_loss%, take_profit%, position_size%]
        """
        # Unpack actions
        stop_loss, take_profit, position_size = action
        
        # Extract current market conditions
        volatility = self.state['market_volatility'].item()
        strategy_perfs = self.state['strategy_performance']
        
        # Calculate reward based on risk management principles
        reward = 0
        
        # 1. Reward for appropriate stop loss relative to volatility
        # Higher volatility should have wider stops
        ideal_stop = volatility * 0.1  # 10% of volatility
        stop_loss_score = 1 - min(1, abs(stop_loss - ideal_stop) / ideal_stop)
        reward += stop_loss_score * 2  # Weight: 2
        
        # 2. Risk-reward ratio: take_profit should generally be higher than stop_loss
        if take_profit > stop_loss:
            rr_ratio = take_profit / stop_loss
            # Reward peaks at RR of 2.0, then decreases
            rr_score = min(1, rr_ratio / 2.0) if rr_ratio < 3.0 else 3.0 / rr_ratio
            reward += rr_score * 3  # Weight: 3
        else:
            reward -= 1  # Penalty for inverted risk-reward
            
        # 3. Position sizing should be proportional to strategy confidence
        # We take the best strategy performance as our confidence level
        confidence = max(strategy_perfs)
        
        # Scale confidence to 0-1 range from -1 to 1 original range
        confidence = (confidence + 1) / 2
        
        # Ideal position size scales with confidence
        ideal_position = max(0.2, min(1.0, confidence)) * 2.0  # Scale to reasonable size
        position_score = 1 - min(1, abs(position_size - ideal_position) / ideal_position)
        reward += position_score * 2  # Weight: 2
            
        # 4. Penalize extreme position sizes
        if position_size > 3.0:
            reward -= (position_size - 3.0) * 2
            
        # Record trading performance
        self.trade_history.append({
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'position_size': position_size,
            'reward': reward,
            'volatility': volatility,
            'strategy_performance': strategy_perfs.tolist()
        })
        
        # Update learning progress data periodically
        if len(self.trade_history) % 10 == 0:
            self.learning_progress['episodes'].append(len(self.trade_history))
            self.learning_progress['rewards'].append(
                sum(t['reward'] for t in self.trade_history[-10:]) / 10
            )
            self.learning_progress['stop_loss'].append(stop_loss)
            self.learning_progress['take_profit'].append(take_profit)
            self.learning_progress['position_size'].append(position_size)
            
            # Save model periodically
            if len(self.trade_history) % 100 == 0:
                self.model.save("trading_tuner_model")
                print(f"Model saved at episode {len(self.trade_history)}")
        
        # Transition to new market state - randomly perturb current state
        new_volatility = max(5, min(50, volatility + np.random.normal(0, 2)))
        new_strategy_perfs = np.clip(
            strategy_perfs + np.random.normal(0, 0.1, size=3),
            -1, 1
        )
        
        # Update state
        self.state = {
            'market_volatility': np.array([new_volatility]),
            'strategy_performance': new_strategy_perfs
        }
        
        # Increment episode length
        self.episode_length += 1
        
        # Check if episode is done
        done = (self.episode_length >= self.max_episode_length)
        
        return self.state, reward, done, {}
        
    def tune_parameters(self, market_data):
        """
        Use the trained model to determine optimal trading parameters
        given current market conditions
        
        market_data: {'volatility': float, 'strategy_performance': {'swing': float, 'scalp': float, 'ai': float}}
        """
        if not self.model:
            self._init_model()
            
        # Convert market data to observation format
        observation = {
            'market_volatility': np.array([market_data.get('volatility', 20.0)]),
            'strategy_performance': np.array([
                market_data.get('strategy_performance', {}).get('swing', 0.0),
                market_data.get('strategy_performance', {}).get('scalp', 0.0),
                market_data.get('strategy_performance', {}).get('ai', 0.0)
            ])
        }
        
        # Get action from model
        action, _ = self.model.predict(observation)
        stop_loss, take_profit, position_size = action
        
        return {
            'stop_loss_percent': float(stop_loss),
            'take_profit_percent': float(take_profit),
            'position_size_percent': float(position_size)
        }
        
    def train_model(self, iterations=1000):
        """Train the RL model for a specified number of iterations"""
        start_time = json.dumps(json.loads(json.dumps({})), indent=4)
        
        # If model doesn't exist, create it
        if not self.model:
            self._init_model()
            
        # Train the model
        self.model.learn(total_timesteps=iterations)
        
        # Save the model
        self.model.save("trading_tuner_model")
        
        # Return training results summary
        return {
            'iterations': iterations,
            'final_reward': float(self.learning_progress['rewards'][-1]) if self.learning_progress['rewards'] else 0,
            'parameters': {
                'stop_loss': float(self.learning_progress['stop_loss'][-1]) if self.learning_progress['stop_loss'] else 0,
                'take_profit': float(self.learning_progress['take_profit'][-1]) if self.learning_progress['take_profit'] else 0,
                'position_size': float(self.learning_progress['position_size'][-1]) if self.learning_progress['position_size'] else 0
            }
        }
        
    def get_learning_progress(self):
        """Get learning progress data for visualization"""
        return self.learning_progress

# Create RL tuner instance globally so it can be accessed by routes
tuner = TradingTuner()

@app.route('/tune', methods=['GET', 'POST', 'OPTIONS'])
def tune_endpoint():
    """API endpoint for compatibility with frontend that expects a /tune endpoint"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return '', 200
        
    # For GET or POST requests, return parameters similar to get-params
    market_data = request.json if request.is_json else None
    
    # Default data if not provided
    if not market_data:
        market_data = {
            'volatility': 20.0,
            'strategy_performance': {
                'swing': 0.1,
                'scalp': 0.0,
                'ai': 0.2
            }
        }
        
    # Get tuned parameters
    params = tuner.tune_parameters(market_data)
    return jsonify(params)

@app.route('/get-params', methods=['POST'])
def get_parameters():
    """API endpoint for getting tuned parameters"""
    market_data = request.json
    
    # Default data if not provided
    if not market_data:
        market_data = {
            'volatility': 20.0,
            'strategy_performance': {
                'swing': 0.1,
                'scalp': 0.0,
                'ai': 0.2
            }
        }
        
    # Get tuned parameters
    params = tuner.tune_parameters(market_data)
    return jsonify(params)

@app.route('/train', methods=['POST'])
def train():
    """API endpoint for training the model"""
    data = request.json
    iterations = data.get('iterations', 1000) if data else 1000
    result = tuner.train_model(iterations)
    return jsonify(result)

@app.route('/learning-progress', methods=['GET'])
def learning_progress():
    """API endpoint for getting learning progress data"""
    progress = tuner.get_learning_progress()
    return jsonify(progress)

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for service status checks"""
    return jsonify({"status": "ok", "service": "RL Parameter Tuning"})

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "rl_tuning_service"})

if __name__ == '__main__':
    print("Starting RL parameter tuning service on port 6001...")
    # Run the app
    app.run(host='0.0.0.0', port=6001, debug=False)
