from fastapi import FastAPI, File, UploadFile
from PIL import Image
import torch
import io
import json
from torchvision import transforms as T

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load classes ----
# with open("classess.json", "r") as f:
#     classes = json.load(f)

classes = {
    "Corn___Common_Rust": 0,
    "Corn___Gray_Leaf_Spot": 1,
    "Corn___Healthy": 2,
    "Corn___Northern_Leaf_Blight": 3,
    "Potato___Early_Blight": 4,
    "Potato___Healthy": 5,
    "Potato___Late_Blight": 6,
    "Rice___Brown_Spot": 7,
    "Rice___Healthy": 8,
    "Rice___Leaf_Blast": 9,
    "Rice___Neck_Blast": 10,
    "Sugarcane_Bacterial Blight": 11,
    "Sugarcane_Healthy": 12,
    "Sugarcane_Red Rot": 13,
    "Wheat___Brown_Rust": 14,
    "Wheat___Healthy": 15,
    "Wheat___Yellow_Rust": 16
}

idx_to_class = {v: k for k, v in classes.items()}

import timm
import torch

# Create EXACT same model
model = timm.create_model("rexnet_150", pretrained=False, num_classes=17)

# Load weights
model.load_state_dict(torch.load("crop_best_model.pth", map_location="cpu"))

model.eval()

# ---- Image Transform (same as training!) ----
transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(
        mean=[0.485, 0.456, 0.406],
        std =[0.229, 0.224, 0.225]
    )
])

@app.get("/")
def home():
    return {"message": "Model API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ---- Prediction Endpoint ----
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
 try:
    # Read image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Preprocess
    img_tensor = transform(image).unsqueeze(0)

    # Predict
    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs, dim=1)
        pred_idx = torch.argmax(probs, dim=1).item()

    class_name = idx_to_class[pred_idx]
    prob = torch.softmax(outputs, dim=1)
    confidence = prob[0][pred_idx].item()

    return {
        "prediction": class_name,
        "confidence": confidence
   }
 
 except Exception as e:
    return {"error": str(e)}