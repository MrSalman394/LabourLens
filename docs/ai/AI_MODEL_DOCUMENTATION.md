# AI Model Specifications & Architectures

## 1. Overview of AI Models

LabourLens operates two distinct machine learning models:
1. **Model A (Vision)**: `YOLOv8x-PPE` — Deep learning convolutional/transformer backbone for real-time Personal Protective Equipment detection and spatial zone analysis.
2. **Model B (Tabular Ranker)**: `XGBoost-Ranker` / LightGBM — Gradient-boosted decision tree model evaluating multi-feature worker-job compatibility.

---

## 2. Model A: YOLOv8 PPE & Safety Detector

### 2.1 Model Architecture
- **Framework**: Ultralytics YOLOv8 (PyTorch)
- **Weights Precision**: FP16 / INT8 via TensorRT for edge deployment
- **Input Dimensions**: $640 \times 640 \times 3$ RGB
- **Detection Classes**:
  - `0: person`
  - `1: hard_hat`
  - `2: no_hard_hat`
  - `3: safety_vest`
  - `4: no_safety_vest`
  - `5: safety_boots`
  - `6: safety_harness`
  - `7: machinery_crane`

### 2.2 Hyperparameters & Training Configuration
- **Optimizer**: AdamW ($\beta_1=0.9, \beta_2=0.999$, weight decay $0.0005$)
- **Learning Rate**: Initial $1\times 10^{-3}$, cosine annealing decay to $1\times 10^{-5}$
- **Batch Size**: 32 on 2x NVIDIA RTX 4090 GPUs
- **Epochs**: 150 with early stopping patience of 15 epochs
- **Data Augmentations**: Mosaic, MixUp, HSV color jitter, random horizontal flip, affine rotation ($\pm 10^\circ$).

---

## 3. Model B: XGBoost Job-Worker Matching Ranker

### 3.1 Model Architecture
- **Objective Function**: `rank:ndcg` or `binary:logistic` probability of successful job completion with $>90\%$ performance score.
- **Tree Depth**: Max depth 6
- **Subsample**: 0.8
- **Colsample_bytree**: 0.85
- **Early Stopping**: 20 rounds evaluated on Normalized Discounted Cumulative Gain (NDCG@10).

---

## 4. Inference & Serving Infrastructure

- **Serving Framework**: FastAPI with Uvicorn worker threads.
- **Hardware Profile**:
  - Cloud / Server: 8 vCPUs, 32GB RAM, 1x NVIDIA T4 / A10G GPU.
  - Edge Gateway (Optional On-Site): NVIDIA Jetson Orin Nano / AGX.
