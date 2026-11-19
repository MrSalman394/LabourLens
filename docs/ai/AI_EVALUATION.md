# AI Evaluation, Metrics & Validation

## 1. Computer Vision Model Evaluation

### 1.1 Object Detection Metrics (YOLOv8x-PPE)
Evaluated on a held-out test split of 3,700 images:

| Class | Precision ($P$) | Recall ($R$) | mAP@0.5 | mAP@0.5:0.95 |
|---|:---:|:---:|:---:|:---:|
| `person` | 0.942 | 0.915 | 0.952 | 0.741 |
| `hard_hat` | 0.928 | 0.904 | 0.938 | 0.712 |
| `no_hard_hat` | 0.891 | 0.875 | 0.894 | 0.655 |
| `safety_vest` | 0.934 | 0.911 | 0.941 | 0.728 |
| `no_safety_vest` | 0.887 | 0.862 | 0.881 | 0.642 |
| `safety_boots` | 0.852 | 0.814 | 0.849 | 0.589 |
| **All Classes (Mean)** | **0.906** | **0.880** | **0.909** | **0.678** |

### 1.2 Latency & Throughput Benchmark
- **Inference Time (TensorRT FP16, RTX 4090)**: $8.4\text{ ms/frame}$ (~119 FPS throughput).
- **Inference Time (ONNX CPU, Intel i7-13700K)**: $42\text{ ms/frame}$ (~24 FPS throughput).
- **End-to-End Alert Latency**: Average $1.82\text{ seconds}$ from camera capture to web dashboard WebSocket alert delivery.

---

## 2. Matching Engine Evaluation

### 2.1 Ranking Performance (NDCG)
Evaluated on a historical benchmark of 500 completed job postings with supervisor satisfaction ratings:
- **NDCG@5**: $0.884$
- **NDCG@10**: $0.912$
- **Recall@5**: $0.796$ (percentage of supervisor-selected top candidates present in AI top-5 recommendations).

### 2.2 Fairness & Demographic Parity Audit
- Disparate Impact Ratio across protected demographic proxies: $\ge 0.92$ (comfortably exceeding the 80% four-fifths rule for algorithmic fairness).
- Explanations generated via SHAP demonstrate zero dependency on non-occupational traits.

