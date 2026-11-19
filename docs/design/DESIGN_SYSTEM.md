# Design System & Component Library

## 1. Web Component Architecture (`apps/web`)

The web frontend implements **Tailwind CSS** paired with **shadcn/ui** (built on Radix UI primitives) to ensure full keyboard navigation, ARIA accessibility compliance, and modern look and feel.

### 1.1 Typography Hierarchy
- **Font Family**: Inter / Plus Jakarta Sans (sans-serif)
- **H1 (Page Titles)**: `text-3xl font-bold tracking-tight text-slate-900 dark:text-white`
- **H2 (Card Headers)**: `text-xl font-semibold text-slate-800 dark:text-slate-100`
- **Body Text**: `text-sm text-slate-600 dark:text-slate-400`
- **Metric Numbers (KPIs)**: `text-4xl font-extrabold tracking-tight font-mono`

### 1.2 Core Reusable Components
- `<LiveCameraFeed />`: Renders WebRTC/HLS stream canvas with SVG bounding-box coordinate layers and class labels.
- `<GeofenceEditor />`: Mapbox GL JS wrapper allowing interactive polygon drawing with coordinate export.
- `<IncidentTriageDrawer />`: Slide-out panel displaying high-res violation snapshot, worker ID, confidence score, and one-click "Acknowledge" button.
- `<StatCard />`: Metric container with title, large numeric value, trend indicator (green arrow up / red arrow down), and sparkline graph.

---

## 2. Mobile Design System (`apps/mobile`)

The mobile app follows a custom industrial Material 3 theme:

```dart
final ThemeData industrialDarkTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  colorScheme: ColorScheme.dark(
    primary: const Color(0xFFF59E0B), // High-Vis Amber
    surface: const Color(0xFF0F172A), // Slate 900
    background: const Color(0xFF020617), // Deep Navy
    error: const Color(0xFFEF4444),
  ),
  textTheme: const TextTheme(
    displayMedium: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
    labelLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
  ),
);
```

---

## 3. Iconography Guidelines
- **Web**: `lucide-react` icons (consistent 2px stroke width, 20x20px standard size).
- **Mobile**: Lucide Flutter icons or Material Symbols Outlined.

