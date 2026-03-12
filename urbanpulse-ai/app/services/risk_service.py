import joblib
import numpy as np
import os

model_path = "models/risk_model.pkl"
try:
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        model = None
        print(f"Warning: {model_path} not found. Using fallback logic.")
except Exception as e:
    model = None
    print(f"Error loading model: {e}")

def predict_risk(rainfall, complaints, road_density):
    features = np.array([[rainfall, complaints, road_density]])
    if model:
        score = model.predict(features)
        return float(score[0])
    return 0.5
