# Web Application Specification

## 1. Overview & Technology Choices

The **LabourLens Web Portal** (`apps/web`) is built with **Next.js 14+** (App Router) and TypeScript. It serves as the primary management, monitoring, and analytics command center for project managers, health and safety inspectors, HR personnel, and system administrators.

- **Framework**: Next.js 14+ (React 18+, App Router)
- **Styling**: Tailwind CSS & shadcn/ui component library
- **Icons**: Lucide React
- **Data Fetching & Cache**: TanStack Query (React Query v5) + Server Actions
- **State Management**: Zustand (for client-side UI states and alert modals)
- **Data Visualization**: Recharts / Tremor for charts, analytics, and heatmaps
- **Mapping & Geofence Drawing**: Mapbox GL JS / Leaflet for interactive site polygon configuration
- **Real-Time WebSockets**: Socket.io-client for live PPE violation notifications

---

## 2. Directory Structure & App Routing

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Sidebar, header, notification tray
│   │   │   ├── page.tsx                  # Executive dashboard overview
│   │   │   ├── sites/                    # Worksites management & geofence editor
│   │   │   ├── cameras/                  # Live RTSP stream feeds & detection overlays
│   │   │   ├── safety/                   # Safety violations feed & audit resolutions
│   │   │   ├── attendance/               # Timesheets, active roll-call, overtime
│   │   │   ├── workers/                  # Worker directory & skill credentials
│   │   │   └── analytics/                # Labor productivity & compliance reports
│   │   └── api/                          # Next.js API route proxies
│   ├── components/
│   │   ├── ui/                           # Button, Dialog, Dropdown, Table (shadcn)
│   │   ├── dashboard/                    # StatCard, TrendGraph, LiveWorkerCount
│   │   ├── map/                          # GeofenceDrawer, WorkerLiveMap
│   │   └── safety/                       # LiveCameraPlayer, IncidentBadge, AlertModal
│   ├── hooks/                            # useWebSocket, useAuth, useSiteAlerts
│   ├── lib/                              # Axios instance, formatting, constants
│   └── stores/                           # Zustand stores (useAlertStore, useUserStore)
```

---

## 3. Core Dashboard Modules

### 3.1 Executive Overview (`/`)
- **Key Metrics (KPIs)**: Total Active Workers On-Site, Attendance Rate (%), Safety Compliance Score (0-100), Active Violations (Open vs Resolved).
- **Incident Severity Chart**: Breakdown of violations across sites (Hard Hat vs Safety Vest vs Red Zone Entry).
- **Attendance Trend**: 30-day rolling chart of scheduled vs actual hours worked.

### 3.2 Real-Time Safety & CCTV Monitor (`/safety` & `/cameras`)
- **Video Feed Grid**: Up to 6 concurrent camera stream feeds displaying live WebRTC/HLS feeds.
- **Bounding-Box Overlays**: AI detections projected over live frames with color-coded safety indicators (Green = Compliant, Red = Missing PPE).
- **Audio-Visual Alert Bell**: Audible chime on `CRITICAL` safety violations with drawer animation highlighting snapshot, worker identifier, timestamp, and location.

### 3.3 Site & Geofence Management (`/sites`)
- Interactive map interface allowing administrators to:
  - Drop a marker to set site center coordinates.
  - Draw custom polygon boundaries using Mapbox draw tools.
  - Assign specific supervisor teams and active camera endpoints to each site.

### 3.4 Workforce & Timesheets (`/attendance`)
- Searchable and filterable data table with server-side pagination:
  - Filter by Site, Trade, Date Range, and Status (`ON_DUTY`, `LATE`, `OVERTIME`).
  - View individual worker clock-in/out snapshots and GPS coordinates.
  - One-click export to CSV / Excel for payroll processing.

---

## 4. Role-Based Access Control (RBAC) in UI

| Role | Accessible Sections | Permitted Actions |
|---|---|---|
| **System Admin** | All routes (`/sites`, `/workers`, `/cameras`, `/analytics`) | Create/delete sites, manage cameras, invite users |
| **Safety Officer** | `/safety`, `/cameras`, `/analytics` | Review violations, resolve incident tickets, export reports |
| **Project Manager** | `/`, `/attendance`, `/workers`, `/analytics` | View timesheets, approve overtime, track productivity |
| **HR / Payroll** | `/attendance`, `/workers` | Export payroll logs, view attendance records |
