# LabourLens — System Architecture Specification
**Platform**: LabourLens — An Explainable AI-Based Platform for Trustworthy Matching of Domestic and Skilled Workers  
**Geography**: Pakistan (Primary: Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad)  
**Security & Trust Notice**: Identity verification and document checks provide transparency but **never guarantee personal safety**. LabourLens implements trust layers, explainable match scoring, and proactive safety guidelines across every interaction.

---

## 1. High-Level Architectural Topology

```mermaid
flowchart TB
    subgraph ClientTier["Client Applications Tier (Unified Backend Consumption)"]
        Web["Next.js 14+ App Router<br/>(Web Portal, SSR & Client UI)"]
        Mobile["Flutter 3.x Cross-Platform<br/>(Worker & Employer Mobile App)"]
    end

    subgraph GatewayTier["Ingress & Proxy Tier"]
        Nginx["Nginx Reverse Proxy / Load Balancer<br/>(SSL Termination, Rate Limiting, CORS)"]
    end

    subgraph ServiceTier["Application Services Tier"]
        CoreAPI["NestJS Core Backend API<br/>(Auth, RBAC, Profiles, Jobs, Reviews, Moderation)"]
        AIService["Python FastAPI Explainable AI Service<br/>(Scikit-Learn, Feature Extraction, XAI Ranking)"]
    end

    subgraph MapTier["Geographic & Spatial Infrastructure"]
        OSM["OpenStreetMap / Nominatim<br/>(Map Tiles, Geocoding, Place Lookup)"]
    end

    subgraph DataTier["Managed Cloud Persistence Tier"]
        NeonDB[("Neon Cloud PostgreSQL + PostGIS<br/>(Transactional Data, Spatial Geometry, Indices)")]
        RedisCache[("Upstash / Redis<br/>(Session Cache, Rate Limit Tokens, Real-time Queues)")]
        ObjectStore[("Cloud Storage / S3 / MinIO<br/>(Encrypted CNIC & Verification Docs, Avatars)")]
    end

    Web -->|HTTPS / REST / JSON| Nginx
    Mobile -->|HTTPS / REST / JSON| Nginx
    Nginx -->|Reverse Proxy| CoreAPI
    CoreAPI -->|Internal RPC / HTTP POST| AIService
    CoreAPI -->|Prisma ORM (SSL / Pooled)| NeonDB
    CoreAPI -->|Geocoding / Reverse Geocode| OSM
    CoreAPI -->|Cache & Blacklists| RedisCache
    CoreAPI -->|Presigned Uploads| ObjectStore
    Web -.->|OSM Tile Fetch| OSM
    Mobile -.->|OSM Tile Fetch| OSM
```

---

## 2. Core Architectural Principles

### 2.1 Unified API Contract
The web client (`apps/web`) and the mobile client (`apps/mobile`) communicate with the **identical NestJS REST API** (`apps/api`). No private frontend-only API routes bypass the NestJS business logic layer. All data contracts are versioned and strongly typed via DTOs and TypeScript interfaces.

### 2.2 Relational & Spatial Database (PostgreSQL 16+ & PostGIS 3.7.0)
LabourLens leverages a local high-performance PostgreSQL database (`labourlens_db`) with PostGIS 3.7.0 spatial extension:
- All connections use connection pooling and parameterized query execution via Prisma ORM 6.x.
- Geographic locations are persisted as PostGIS `geography(Point, 4326)` with dedicated spatial GiST indexes:
  ```sql
  -- Example: Find verified plumbers within 10 km radius of an employer coordinate in Gulberg, Lahore
  SELECT id, full_name, ST_Distance(location, ST_SetSRID(ST_MakePoint(74.3436, 31.5204), 4326)::geography) as distance_meters
  FROM worker_profiles
  WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(74.3436, 31.5204), 4326)::geography, 10000);
  ```

### 2.3 Explainable AI (XAI) Architecture
Rather than presenting an uninterpretable percentage score, the matching system decouples scoring into explicit, verifiable dimensions:
$$\text{MatchScore} = w_s \cdot S_{\text{skills}} + w_g \cdot S_{\text{geo}} + w_e \cdot S_{\text{exp}} + w_w \cdot S_{\text{wage}} + w_a \cdot S_{\text{avail}}$$

Each score is accompanied by:
1. **Positive Justifications**: Specific qualifications matching the employer's job posting.
2. **Missing Requirements**: Deficits or trade mismatches that the employer must consider.
3. **Evidence Tiers**:
   - `VERIFIED`: Confirmed via uploaded CNIC, police verification certificate, trade diploma, or employer phone verification.
   - `SELF_REPORTED`: Provided directly by the worker during profile onboarding without third-party proof.
   - `UNAVAILABLE`: Data omitted or pending review.

---

## 3. Subsystem Breakdown

### 3.1 Web Application (`apps/web`)
- **Framework**: Next.js 14+ (App Router, React Server Components, TypeScript).
- **Styling**: Tailwind CSS with custom design tokens, responsive breakpoints, and Accessible UI components.
- **Color Identity**: Emerald Forest (`#065f46`, `#047857`) denoting growth, trust, and Pakistani cultural identity, paired with warm amber accents and crisp slate neutrals.
- **Localization**: English primary with full Urdu language readiness (bilingual labels, RTL-compatible layout structure, accessible Urdu typography).
- **Maps**: OpenStreetMap integration via Leaflet / React-Leaflet with zero proprietary map license costs.

### 3.2 Backend Core API (`apps/api`)
- **Framework**: NestJS 12 (TypeScript, Express engine).
- **Security**: Argon2id password hashing (OWASP parameters: 64MB memory, 3 iterations, 4 parallelism, backwards-compatible bcrypt fallback), dual-token JWT architecture (15-minute access token + single-use refresh token rotation in database), httpOnly secure cookie session management (zero localStorage token storage), Helmet HTTP headers, CORS whitelisting, `@nestjs/throttler` rate limiting, and Role-Based Access Control (`ADMIN`, `EMPLOYER`, `WORKER`, `MODERATOR`).
- **ORM**: Prisma Client 6.19.0 connecting to local PostgreSQL `labourlens_db`.
- **Validation**: Strict runtime validation of incoming payloads using `class-validator` and `class-transformer` (whitelisting enabled, forbidding extraneous properties).

### 3.3 Explainable AI Engine (`services/ai`)
- **Framework**: Python 3.11+ with FastAPI and Scikit-learn.
- **Inference Pipeline**:
  - Request ingestion: Job details (trade, location, budget, shifts, required skills) and candidate pool.
  - TF-IDF and taxonomy matching over trade skills and task descriptions.
  - Spatial distance decay calculation via Haversine / PostGIS.
  - Salary compatibility scoring (hourly, daily, monthly/project).
  - Rule-based natural language explanation generator.
- **Evaluation Framework**: Precision@3 and NDCG@3 metrics against synthetic ground-truth benchmark datasets.

### 3.4 Mobile Application (`apps/mobile` — Future Phase)
- **Framework**: Flutter 3.x (Dart 3.x).
- **Architecture**: BLoC pattern for predictable state management.
- **Accessibility**: Simple iconography and Urdu voice/audio prompts designed for low-literacy trade workers across Pakistan.

---

## 4. Authentication, Authorization & Security Architecture

### 4.1 Token Lifecycle & Refresh Rotation
1. **Access Token**: Stateless, compact JWT signed with HMAC-SHA256 (`JWT_SECRET`). Contains claims: `sub` (User ID), `email`, `roles`, and `status`. Expires in 15 minutes.
2. **Refresh Token**: 40-byte cryptographically secure random hexadecimal string (`crypto.randomBytes(40)`). The client receives the raw token; the server persists only its **SHA-256 hash** in `auth_sessions`. Expires in 7 days.
3. **Single-Use Rotation**: Each call to `POST /auth/refresh` immediately sets `revokedAt = NOW()` on the presenting session and creates a fresh session record.
4. **Token Reuse Detection (Anti-Theft)**: If a revoked refresh token is presented, the system flags suspicious activity and immediately revokes **all** active sessions for that user account (`revokeAllUserSessions`), terminating any compromised sessions.

### 4.2 Role-Based Access Control (RBAC) & Guards
- **`JwtAuthGuard`**: Validates Authorization header Bearer token, checks user active status against database, and rejects suspended or banned accounts.
- **`RolesGuard`**: Reads `@Roles(...)` metadata and verifies that the authenticated user possesses at least one authorized role (`ADMIN`, `EMPLOYER`, `WORKER`, `MODERATOR`).
- **`OwnershipGuard`**: Verifies that the requested resource belongs to the current user (or user is `ADMIN`), preventing horizontal privilege escalation.
- **`@Public()` Decorator**: Selectively bypasses authentication for registration, login, token refresh, and public endpoints.
- **`@CurrentUser()` Decorator**: Extracts validated user payload directly into route handlers.

### 4.3 Brute-Force & Rate Limiting Protection
- Configured `@nestjs/throttler` with multi-tier limits:
  - Global default: 100 requests per 60 seconds.
  - Sensitive auth endpoints (login, forgot password): Throttled to 5 requests per 60 seconds to prevent credential stuffing.
- **Generic Error Messages**: Authentication failures always return generic messages (`"Invalid email or password"`) to eliminate user enumeration vectors.
- **Safe Forgot-Password**: Always returns `200 OK` regardless of whether the email exists in the database.

### 4.4 Password Policy & Single-Use Password Resets
- Enforces strong passwords (minimum 8 characters, uppercase, lowercase, numeric digit, and special symbol).
- Password reset tokens are single-use, 32-byte cryptographic hex tokens stored as SHA-256 hashes with a 15-minute expiration. Upon password reset, the token is marked consumed and all active sessions are instantly revoked.

### 4.5 Security, Trust, and Privacy Safeguards
1. **Safety Disclaimer Mandate**: Every public page, profile preview, and match card carries a clear notice:
   > *"LabourLens conducts identity and document verification to enhance transparency. However, verification does NOT guarantee personal safety or service outcome. Employers and workers must exercise independent judgment, verify references, and follow safety protocols."*
2. **Document Protection**: CNIC numbers and police verification images are never exposed in public API responses or browser code. They are accessible only by authorized platform administrators via audited access logs.
3. **Zero Secrets in Code**: Environment variables are managed strictly via `.env` files with sample placeholders in `.env.example`. Database connection strings and cryptographic secrets are never exposed to browser bundles.
4. **Response Sanitization**: Passwords, password hashes, and database session hashes are excluded at the database projection and DTO serialization layers.


### 4.6 Next.js Edge Middleware & Cookie-Based Web Security
- **Strict Cookie Management**: In compliance with security mandates, tokens are never stored in browser `localStorage`. Authentication tokens (`accessToken`, `refreshToken`, `labourlens_access_token`, `labourlens_refresh_token`, and `labourlens_user_role`) are persisted strictly as `httpOnly`, `SameSite=Lax` cookies.
- **Edge Route Protection (`apps/web/src/middleware.ts`)**:
  - `/employer/*`: Verified against authenticated session and required `EMPLOYER` or `ADMIN` role. Unauthorized requests redirect to `/login?redirect=...`; workers attempting unauthorized access are safely rerouted to `/worker/dashboard`.
  - `/worker/*`: Verified against authenticated session and required `WORKER` or `ADMIN` role. Unauthorized requests redirect to `/login?redirect=...`; employers attempting unauthorized access are safely rerouted to `/employer/dashboard`.
  - `/admin/*`: Verified against authenticated session and required `ADMIN` role. Unauthorized non-admins are rerouted according to their primary role.
  - Public Auth Pages (`/login`, `/register`, `/sign-in`): Authenticated users are automatically forwarded to their corresponding role dashboards.
- **Administrator Provisioning**: Public registration as an administrator is prohibited. The `ADMIN` account is provisioned exclusively via the backend server-side CLI (`npm run seed:admin`).
