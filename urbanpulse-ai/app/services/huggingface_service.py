import requests
from app.config import HUGGINGFACE_API_KEY, HF_MODEL_URL

def classify_image(image_bytes):
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    response = requests.post(HF_MODEL_URL, headers=headers, data=image_bytes)
    return response.json()
