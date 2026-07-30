# 🏗️ APEX FEMME — SOFTWARE ARCHITECTURE & ENGINEERING MANUAL (V12)
> *"Build Software That Can Last 10 Years"*

This document outlines the system architecture, design patterns, security rules, and code organization conventions of **Apex Femme**, the elite performance platform for women's football.

---

## 📐 1. ARCHITECTURAL LAYERS & SEPARATION OF CONCERNS

Apex Femme follows **Clean Architecture** principles to separate UI components, domain logic, telemetry adapters, and data persistence:

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│  (React 18 Components: DashboardView, CoachView, etc.)  │
└────────────────────────────┬────────────────────────────┘
                             │ (Props & Custom Hooks)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    DOMAIN / BUSINESS                    │
│   (AnalyticsEngine, AI Engine, Wearable Manager)        │
└────────────────────────────┬────────────────────────────┘
                             │ (Pure Interfaces & Adapters)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                  │
│ (Web BLE, ProfileStorage with Schema Migration, Utils)   │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities
- **`src/components/`**: Pure UI rendering components. Must NOT contain complex mathematical formulas or raw localStorage calls.
- **`src/services/analyticsEngine.ts`**: Pure functional sports science engine (ACWR, Readiness Index, sRPE Load, Tonnage, LCA Risk).
- **`src/services/aiEngineService.ts`**: AI Coach Engine with confidence scoring (`AIConfidenceEngine`) and proactive pattern detection.
- **`src/services/wearables/`**: Provider adapter layer supporting Web BLE, Garmin, Polar, Apple HealthKit, and Catapult GPS.
- **`src/services/profileStorage.ts`**: Data persistence engine with automated schema versioning (`v1.2`) and XSS sanitization.
- **`src/utils/security.ts`**: Input sanitization, safe JSON parsing, rate limiting, and parameter bounds clamping.

---

## ⌚ 2. WEARABLE & TELEMETRY ADAPTER PATTERN

All telemetry sources inherit from the standard `WearableAdapter` contract:

```typescript
export interface WearableAdapter {
  providerId: WearableProviderId;
  name: string;
  isAvailable(): boolean;
  connect(): Promise<{ success: boolean; device?: WearableDevice; error?: string }>;
  disconnect(): Promise<boolean>;
  getTelemetry(): Promise<TelemetryPayload>;
}
```

This design allows adding new providers (e.g., Catapult GPS, Garmin Connect OAuth API, Polar AccessLink) without altering any UI components.

---

## 🔒 3. SECURITY & DATA SANITIZATION

1. **XSS Protection**: All user input text (player names, match notes, custom workout exercises) is sanitized using `sanitizeString()` and `sanitizeObject()` before storage or rendering.
2. **Safe JSON Parsing**: Client data retrieval uses `safeJsonParse<T>()` with schema fallback values to prevent runtime crashes caused by corrupted data.
3. **Parameter Clamping**: Numerical metrics (e.g., HRV, RPE, Heart Rate) are clamped within realistic physiological bounds using `clampNumber()`.
4. **Client Rate Limiting**: AI and telemetry calls are regulated by `ClientRateLimiter` to prevent main thread blocking and unintended API loops.

---

## 💾 4. DATA MODEL & SCHEMA MIGRATION

Storage records use explicit Schema Versioning (`CURRENT_SCHEMA_VERSION = '1.2'`).
When reading stored data from `localStorage`, `migrateProfileRecord(raw)` upgrades legacy schemas gracefully to avoid broken state.

```typescript
export interface FullProfileRecord {
  schemaVersion?: string;
  id: string;
  lastActive: string;
  profile: PlayerProfile;
  weeklySchedule: ScheduleDay[];
  matchLogs: MatchLog[];
  chatHistory: ChatMessage[];
  challenges: Challenge[];
  badges: Badge[];
}
```

---

## ⚡ 5. PERFORMANCE & CODE SPLITTING

- Component dynamic loading via `React.lazy()` and `Suspense` in `App.tsx` ensures fast initial bundle loading (TTI < 1.2s).
- All heavy sports science computations are wrapped in `useMemo` hooks or executed inside pure functions to eliminate unnecessary re-renders.

---

## 🧪 6. DOMAIN TESTING & VERIFICATION

Automated verification tests in `src/utils/engineVerification.ts` validate mathematical correctness of:
- Readiness Index formulas (Flatt & Esco, 2017 framework).
- ACWR ratio calculation.
- Session RPE training load (AU).
- Female-specific LCA injury risk assessment.
- Security sanitization and bounds clamping.

---

*APEX FEMME V12 — Designed for long-term scalability, clean code quality, and maintainability.*
