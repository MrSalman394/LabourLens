# Explainable AI (XAI) & Algorithmic Transparency

## 1. Motivation for Explainability

In labor management and job assignment, "black-box" algorithmic decisions cause distrust, worker friction, and legal liability. Supervisors must understand **why** an algorithm recommended Worker A over Worker B.

LabourLens integrates **Explainable AI (XAI)** directly into both the matching engine and computer vision pipelines to guarantee full auditability and procedural fairness.

---

## 2. SHAP (SHapley Additive exPlanations) in Labor Matching

LabourLens leverages **TreeSHAP** to quantify the marginal contribution of each candidate attribute toward their overall match score:

$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$

Where:
- $f(x)$ is the model's output prediction score for candidate $x$.
- $\phi_0$ is the base expected value across the general labor pool.
- $\phi_i(x)$ is the Shapley attribution value for feature $i$.

### 2.1 Visual Scorecard Generation
For each ranked candidate, the backend computes local SHAP values and outputs human-readable explanation badges:

```json
{
  "workerId": "usr_781293ac",
  "matchScore": 0.92,
  "topPositiveFactors": [
    { "feature": "required_trade_certifications", "impact": "+0.32", "explanation": "Holds OSHA-30 & Scaffolding Cert" },
    { "feature": "distance_to_site_km", "impact": "+0.24", "explanation": "Located only 4.2 km from worksite" },
    { "feature": "historical_safety_score", "impact": "+0.18", "explanation": "Zero safety infractions over 12 months" }
  ],
  "topNegativeFactors": [
    { "feature": "overtime_fatigue_index", "impact": "-0.08", "explanation": "Worked 46 hours over past 6 days" }
  ]
}
```

---

## 3. Computer Vision Explainability (Visual Evidence)

For computer vision safety infractions:
1. **Explicit Bounding-Box Overlay**: Detections explicitly highlight the exact pixels containing the person, the missing gear region (e.g. head box without hard hat), and the confidence percentage.
2. **Zone Intersection Polygon**: For Red Zone breaches, the system draws the zone perimeter polygon and highlights the intersection coordinates between the worker's feet keypoints and the hazard polygon.
3. **Temporal Verification**: The system stores a 5-second video buffer around the event to prove sustained non-compliance rather than a 1-frame camera occlusion.

