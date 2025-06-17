#!/usr/bin/env python
# prediction_service.py
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
import json
from flask import Flask, request, jsonify

class StrategyPredictor:
    def __init__(self):
        # Pre-trained model (will be created if it doesn't exist)
        try:
            self.model = joblib.load('strategy_model.pkl')
            print("Loaded pre-trained model")
        except:
            print("Creating new model (no pre-trained model found)")
            self.model = self._train_initial_model()
            joblib.dump(self.model, 'strategy_model.pkl')
    
    def _train_initial_model(self):
        """Create a simple initial model with sample data"""
        # Sample training data
        X = np.array([
            # VIX, Volume Ratio, Sector Strength
            [15, 1.2, 0.8],  # Swing favorable
            [18, 0.9, 0.7],  # Swing favorable
            [12, 1.5, 0.9],  # Swing favorable
            [25, 0.8, 0.5],  # Scalp favorable
            [28, 0.7, 0.4],  # Scalp favorable
            [30, 0.5, 0.3],  # Scalp favorable
        ])
        
        # 0 = swing, 1 = scalp
        y = np.array([0, 0, 0, 1, 1, 1])
        
        # Train a simple model
        model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        return model
    
    def predict_best_strategy(self, market_data):
        """Predict the best strategy based on market conditions"""
        features = np.array([
            market_data['vix'],
            market_data['volume_ratio'],
            market_data['sector_strength']
        ]).reshape(1, -1)
        
        prediction_value = self.model.predict(features)[0]
        
        # Determine strategy and confidence
        if prediction_value < 0.4:
            strategy = "swing"
            confidence = int((1 - prediction_value/0.4) * 100)
        elif prediction_value > 0.6:
            strategy = "scalp"
            confidence = int((prediction_value - 0.6) / 0.4 * 100)
        else:
            strategy = "mixed"
            confidence = int(50 - abs(prediction_value - 0.5) * 100)
        
        # Get feature importance
        feature_importance = list(zip(
            ["vix", "volume_ratio", "sector_strength"],
            self.model.feature_importances_
        ))
        
        top_factor = max(feature_importance, key=lambda x: x[1])[0]
        
        return {
            "strategy": strategy,
            "confidence": min(confidence, 99),  # Cap at 99%
            "top_factor": top_factor,
            "feature_importance": {
                "vix": float(self.model.feature_importances_[0]),
                "volume_ratio": float(self.model.feature_importances_[1]),
                "sector_strength": float(self.model.feature_importances_[2])
            }
        }


# Create Flask app for serving predictions
app = Flask(__name__)
predictor = StrategyPredictor()

@app.route('/predict', methods=['POST'])
def predict():
    """API endpoint for strategy prediction"""
    market_data = request.json
    
    # Validate required fields
    required_fields = ['vix', 'volume_ratio', 'sector_strength']
    for field in required_fields:
        if field not in market_data:
            return jsonify({
                "error": f"Missing required field: {field}"
            }), 400
    
    # Make prediction
    prediction = predictor.predict_best_strategy(market_data)
    return jsonify(prediction)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "prediction_service"})

if __name__ == '__main__':
    print("Starting ML prediction service on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)
