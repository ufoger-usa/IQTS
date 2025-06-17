import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def analyze_trades():
    try:
        if os.path.exists('trades.csv'):
            df = pd.read_csv('trades.csv')
            model = RandomForestClassifier()
            model.fit(df[['RSI', 'Volume', 'HoldTime']], df['Profit'])
            return model.feature_importances_
        else:
            print("Warning: trades.csv file not found. Using default values.")
            # Return default feature importances based on common trading knowledge
            return np.array([0.45, 0.30, 0.25])  # RSI, Volume, HoldTime
    except Exception as e:
        print(f"Error in analyze_trades: {str(e)}")
        return np.array([0.45, 0.30, 0.25])  # Default values

# Returns: {'RSI': 0.45, 'Volume': 0.3, 'HoldTime': 0.25}

@app.route('/', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'AI Analysis Service'
    })

@app.route('/analyze', methods=['GET'])
def analyze_endpoint():
    try:
        # Get feature importance
        importances = analyze_trades()
        
        # Determine best strategy based on feature importance
        strategies = ['momentum', 'volume_based', 'day_trading', 'swing_trading', 'scalping']
        top_feature_idx = importances.argmax()
        
        if top_feature_idx == 0:  # RSI is most important
            top_strategy = 'momentum'
        elif top_feature_idx == 1:  # Volume is most important
            top_strategy = 'volume_based'
        else:  # HoldTime is most important
            if importances[2] > 0.4:  # If HoldTime is very significant
                top_strategy = 'scalping'
            else:
                top_strategy = 'swing_trading'
        
        # Generate warnings based on the data
        warnings = []
        try:
            with open('credentials.json') as f:
                credentials = json.load(f)
                if 'tech_stocks' in credentials.get('watchlist', []):
                    warnings.append('High volatility in tech stocks')
        except Exception as e:
            print(f"Warning generation error: {str(e)}")
            
        return jsonify({
            'top_strategy': top_strategy,
            'feature_importance': {
                'RSI': float(importances[0]) if len(importances) > 0 else 0.0,
                'Volume': float(importances[1]) if len(importances) > 1 else 0.0,
                'HoldTime': float(importances[2]) if len(importances) > 2 else 0.0
            },
            'warnings': warnings
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
