# UI / UX Guidelines & Principles

## 1. Design Philosophy: Industrial Pragmatism

LabourLens serves users in radically contrasting physical environments:
- **Site Supervisors & Field Workers**: Operating outdoors under direct sunlight, wearing protective gloves, with noisy surroundings.
- **Safety Officers & Operations Directors**: Operating in indoor control rooms with multi-monitor desktop setups, demanding dense data dashboards and instant visual alert cues.

Therefore, the UX guidelines prioritize:
1. **High Contrast & Legibility Over Subtle Aesthetics**: Large typefaces, heavy contrast ratios ($\ge 7:1$), and vivid state colors.
2. **Generous Touch Targets**: Minimum $48 \times 48\text{ px}$ interactive touch targets on mobile to ensure usability with heavy work gloves.
3. **Glanceable Information**: Safety alerts and attendance states must be readable within 1.5 seconds without deep navigation.

---

## 2. Color Semantics & Meaning

| Role | Color | Hex Code | Meaning / Usage |
|---|---|---|---|
| **Primary Brand** | Safety Navy | `#0F172A` | Core navigation, headers, dark backgrounds |
| **Accent / Highlight** | High-Vis Amber | `#F59E0B` | Action buttons, active site markers, alerts |
| **Success / Safe** | Emerald Green | `#10B981` | Fully compliant PPE, verified geofence, on-time shift |
| **Warning** | Safety Orange | `#F97316` | Minor gear discrepancy, late attendance, low battery |
| **Critical Danger** | Hazard Red | `#EF4444` | Red Zone breach, missing hard hat, fall detected |

---

## 3. Audio & Haptic Feedback Rules

- **Mobile Clock-In Success**: Satisfying single medium haptic impact + brief green checkmark animation.
- **Geofence Boundary Breach**: Heavy double haptic pulse + high-contrast red boundary warning.
- **Web Safety Officer Alert**: Distinctive 800Hz two-tone audio chime when a `CRITICAL` safety violation is triggered, auto-pausing when the incident card is clicked.

