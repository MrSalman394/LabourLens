# Data Processing, Feature Engineering & Datasets

## 1. Computer Vision Data Processing

### 1.1 Dataset Sources & Composition
The safety detection vision model is trained on a composite dataset totaling 18,500 annotated images:
- **Pictor PPE Dataset**: 5,000 real-world construction site images.
- **CHUK-PPE / Roboflow Industrial Gear**: 8,500 images covering varied lighting and occlusions.
- **LabourLens Proprietary Augmentations**: 5,000 synthetically augmented and local site snapshots.

### 1.2 Annotation Format
Annotations conform to standard YOLO format:
`<class_id> <x_center> <y_center> <width> <height>` (normalized to $[0.0, 1.0]$).

### 1.3 Pre-Processing & Augmentation Pipeline
```mermaid
flowchart LR
    Raw[Raw High-Res Stream / Image] --> Crop[Letterbox Resize to 640x640]
    Crop --> Norm[Normalize Pixels [0, 1] & Standardize]
    Norm --> Aug[Augmentations:<br/>Mosaic 4-image blend, HSV Jitter, Affine Shift]
    Aug --> Batch[GPU Tensor Batch [B, 3, 640, 640]]
```

---

## 2. Tabular Matching Feature Engineering

### 2.1 Feature Preprocessing Matrix
| Feature | Raw Type | Preprocessing Transformation | Output Representation |
|---|---|---|---|
| Trade Skills | Array of strings | Multi-Hot Vector Encoding / Sentence-BERT Embedding | Dense vector |
| Certifications | Categorical set | Binary flag vector per mandatory certification | Binary Array |
| GPS Coordinates | Decimal Degrees | Haversine distance from site coordinates | Continuous float (km) |
| Work Hours | Integer minutes | Scaled to standard shift units (8h base) | Normalized float |
| Infraction Counts | Integer list | Exponential decay weighting based on recency | Continuous penalty score |

### 2.2 Missing Data Strategy
- Worker profiles missing historical attendance default to a neutral prior score ($0.50$) rather than zero, preventing starvation of newly onboarded workers.

