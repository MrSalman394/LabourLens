# Matching Algorithm & Mathematical Formulation

## 1. Multi-Objective Scoring Formulation

The composite suitability score $S(w, j) \in [0.0, 1.0]$ for worker $w$ and job $j$ is calculated as a convex combination of normalized criteria:

$$S(w, j) = \sum_{k=1}^{K} w_k \cdot f_k(w, j), \quad \text{where } \sum_{k=1}^{K} w_k = 1, \quad w_k \ge 0$$

---

## 2. Component Sub-Functions

### 2.1 Skill Similarity Sub-Score $f_{\text{skill}}(w, j)$
Let $T_j$ be the set of required trade competencies and $T_w$ be the verified trade competencies of the worker. Using Jaccard similarity augmented with proficiency depth:

$$f_{\text{skill}}(w, j) = \frac{|T_w \cap T_j|}{|T_j|} \times \min\left(1.0, \frac{\text{exp}(w)}{\text{req\_exp}(j)}\right)$$

### 2.2 Geographic Proximity Sub-Score $f_{\text{dist}}(w, j)$
Let $d(w, j)$ be the Haversine distance in kilometers between the worker's home address and the jobsite:

$$f_{\text{dist}}(w, j) = \begin{cases} 
1.0 & \text{if } d(w, j) \le d_{\text{ideal}} \ (5\text{km}) \\
\max\left(0.0, 1.0 - \frac{d(w, j) - d_{\text{ideal}}}{d_{\text{max}} - d_{\text{ideal}}}\right) & \text{if } d_{\text{ideal}} < d(w, j) \le d_{\text{max}} \ (40\text{km}) \\
0.0 & \text{if } d(w, j) > d_{\text{max}}
\end{cases}$$

### 2.3 Attendance & Reliability Sub-Score $f_{\text{rel}}(w, j)$
Computed based on completed shifts over the past 90 days:

$$f_{\text{rel}}(w, j) = 0.70 \times \left(\frac{N_{\text{on\_time}}}{N_{\text{scheduled}}}\right) + 0.30 \times \left(1.0 - \frac{N_{\text{unexcused\_absence}}}{N_{\text{scheduled}}}\right)$$

### 2.4 Safety Record Sub-Score $f_{\text{safe}}(w, j)$
Penalizes verified PPE or zone violations over the past 180 days:

$$f_{\text{safe}}(w, j) = \max\left(0.0, 1.0 - \sum_{i \in \text{violations}} \text{penalty}(v_i)\right)$$

Where penalties are calibrated:
- Low severity: $0.05$
- Medium severity: $0.10$
- High severity (e.g. no hard hat): $0.20$
- Critical severity (Red Zone breach): $0.40$

---

## 3. Algorithmic Complexity

- **Candidate Filtering**: $O(N)$ filter where $N$ is total pool size (typically reduced to $M \ll N$ candidates, $M \approx 100$).
- **Scoring & Ranking**: $O(M \log M)$ to sort top-$k$ matches.
- Total execution time is $< 50\text{ ms}$ for $N=10,000$ in memory.

