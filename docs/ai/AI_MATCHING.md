# AI Labor Matching & Allocation System

## 1. Executive Summary

The **LabourLens AI Matching System** solves the challenge of sub-optimal worker assignment in labor-intensive enterprises. Instead of relying on manual dispatcher intuition or arbitrary seniority, the engine computes a multi-dimensional compatibility index between worker profiles and job requisitions.

---

## 2. Problem Formulation

Given a job requisition $J_k$ with required trade skills $T$, mandatory certifications $C_{req}$, geographic site location $L_{site}$, and target shift duration $[t_{start}, t_{end}]$, identify and rank candidate workers $\{W_1, W_2, \dots, W_n\}$ from the available labor pool.

### Objectives:
1. **Skill & Experience Alignment**: Maximize trade experience and skill relevance.
2. **Safety Compliance Maximization**: Favor workers with consistently high safety records and zero recent PPE infractions.
3. **Commute Distance Optimization**: Minimize transit overhead and transit fatigue for workers.
4. **Fairness & Non-Discrimination**: Prevent algorithmic bias against demographic protected classes; evaluate strictly on verified competence, reliability, and distance.

---

## 3. High-Level Architecture

```mermaid
flowchart TD
    JobReq[Job Requisition] --> Filter[Hard Constraint Filter<br/>(Certifications, Availability, Max Distance)]
    WorkerPool[Worker Pool Database] --> Filter
    
    Filter --> Candidates[Eligible Candidate Set]
    Candidates --> FeatureExtractor[Feature Vector Construction]
    
    FeatureExtractor --> Ranker[Gradient Boosted Ranking Model / Scoring Engine]
    Ranker --> Scores[Predicted Match Probability Score]
    
    Scores --> XAI[SHAP Explainability Layer]
    XAI --> FinalOutput[Ranked Candidates with Human-Readable Feature Explanations]
```

---

## 4. Key Input Features

| Feature Name | Type | Description |
|---|---|---|
| `trade_skill_match_score` | Float $[0, 1]$ | Semantic similarity between worker trades and job requirements |
| `years_trade_experience` | Integer | Total verified years operating in specific trade |
| `distance_to_site_km` | Float | Haversine distance between worker residence and worksite |
| `attendance_reliability_rate` | Float $[0, 1]$ | Past 90-day on-time clock-in percentage |
| `historical_safety_score` | Float $[0, 100]$ | 100 minus weighted penalties for past safety infractions |
| `has_all_mandatory_certs` | Boolean | Hard gate: worker possesses all required safety licenses |
| `overtime_fatigue_index` | Float $[0, 1]$ | Rolling 7-day cumulative work hours to prevent exhaustion |

