import requests
from app.config import ROBOFLOW_API_KEY, ROBOFLOW_MODEL

def detect_pothole(image_bytes):
    url = f"https://detect.roboflow.com/{ROBOFLOW_MODEL}?api_key={ROBOFLOW_API_KEY}"
    response = requests.post(url, files={"file": image_bytes})
    return response.json()
