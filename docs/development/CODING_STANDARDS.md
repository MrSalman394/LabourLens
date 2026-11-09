# Coding Standards & Conventions

## 1. Universal Monorepo Rules

- **Git Commit Convention**: Conventional Commits format:
  - `feat(web): add live video wall fullscreen mode`
  - `fix(api): handle null geofence polygon in site creation`
  - `docs(ai): update SHAP explanation math formulas`
  - `refactor(mobile): extract BLoC state into immutable freezed models`
- **Linting & Formatting**: Clean passes required on ESLint, Prettier, Black (Python), and `flutter analyze` prior to committing.

---

## 2. TypeScript & NestJS Standards (`apps/api`)

- **Strict Mode**: `"strict": true` enforced in `tsconfig.json`. Explicitly ban `any`; use `unknown` or specific interfaces.
- **DTO Validation**: Every incoming request payload must use a DTO class decorated with `class-validator` (`@IsString()`, `@IsUUID()`, `@IsNotEmpty()`).
- **Dependency Injection**: Use constructor injection for all services and repositories. Never use global singletons.
- **Error Handling**: Throw standard NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, `ForbiddenException`). Never return raw string errors.

---

## 3. React & Next.js Standards (`apps/web`)

- **Server-First Mindset**: Default to React Server Components (RSC) for data fetching. Add `"use client"` only for components requiring browser APIs, hooks, or event listeners.
- **Component Colocation**: Keep feature-specific helper components within their respective app route folders (e.g., `src/app/(dashboard)/sites/_components/`).
- **Tailwind Composition**: Use the `cn()` helper function (`clsx` + `tailwind-merge`) when conditionally merging CSS classes.

---

## 4. Flutter & Dart Standards (`apps/mobile`)

- **State Management**: Strictly use `flutter_bloc`. Never mutate state directly; always emit fresh state objects.
- **UI Decoupling**: Keep UI widgets stateless whenever possible. Business logic belongs in BLoCs, network queries belong in Repositories.
- **Offline Safety**: Always wrap network calls in `try/catch` and persist offline fallback records to local storage.

---

## 5. Python & AI Standards (`services/ai`)

- **Type Annotations**: Mandatory PEP 484 type hints for all function signatures:
  ```python
  def compute_iou(box_a: tuple[float, float, float, float], box_b: tuple[float, float, float, float]) -> float:
  ```
- **Async Safety**: Never perform blocking I/O or heavy computer vision tensor operations directly in FastAPI's main async event loop. Offload to `asyncio.to_thread` or background worker pools.
