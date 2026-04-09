---
stepsCompleted:
  - step-01-init
  - step-02-project-context
  - step-03-system-boundaries
  - step-04-key-decisions
  - step-05-component-stack
  - step-06-risks-compliance
  - step-07-summary
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/index.md
  - docs/project-overview.md
  - docs/source-tree-analysis.md
  - docs/architecture-backend.md
  - docs/architecture-frontend.md
  - docs/api-contracts-backend.md
  - docs/data-models-backend.md
  - docs/integration-architecture.md
  - docs/component-inventory-frontend.md
  - docs/development-guide.md
workflowType: architecture
project_name: HamzaTex
user_name: mhamzaog
date: "2025-01-29"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project context

**Product:** HamzaTex — brownfield full-stack (API + mobile) evolving toward enterprise-ready, offline-first.

**Scope (from PRD):**

- **Backend:** ASP.NET Core 9 Web API, EF Core 9, MySQL; JWT + refresh; policies (AdminOnly, StaffOnly, Authenticated). Controllers: Login, Refresh, Users, UserRoles, ChangePassword, Client, ClientType; more (invoicing, reports) as features grow.
- **Mobile:** React Native (Expo); staff in the field; offline-first (local storage e.g. SQLite, sync when online, no data loss); push notifications in scope for MVP.
- **Users:** Staff (mobile), accountants, managers; customers indirectly. Success hinges on correct data, no data loss when offline, monthly reporting from a single source of truth.

**Current technical baseline:**

- **Backend:** Layered API (Controllers → Services → Data); Identity + JWT; FluentValidation, Swagger; BCrypt; entities (Client, Product, Order, OrderLine, Payment, Transaction, etc.) and views (VClientBalance, VMonthlyProfitLoss).
- **Frontend:** Screen-based app (Home, AddItem, ItemDetails); Redux Toolkit; React Navigation; API client in `src/utils/api.js`; AsyncStorage today; planned SQLite + Firebase for offline-first.
- **Integration:** REST; frontend calls backend at configured base URL; JWT Bearer auth.

**Key constraints and direction:**

- Offline-first required: local persistence, sync, conflict handling, no data loss.
- Security baseline: JWT, secure storage, role-based access; planned: email verification, password reset.
- Monthly reporting (e.g. P&L, client balances) from single source of truth; data quality and validation to avoid wrong calculations.
- MVP must deliver: offline-first mobile, auth (JWT + roles), core entities (clients, orders, products, payments, transactions), push notifications, invoicing support, record-keeping, data retention ≥ 1 year, monthly reports; rate limits and API versioning deferred to post-MVP.

This context is the basis for the architectural decisions that follow.

---

## System boundaries & context

**In-scope system:** HamzaTex — the backend API plus the mobile app. The backend is the single source of truth for business data; the mobile app is a first-class client that can operate offline and sync when online.

**Actors:**

| Actor           | Touchpoint                         | Notes                                                            |
| --------------- | ---------------------------------- | ---------------------------------------------------------------- |
| **Staff**       | Mobile app (primary)               | Field/shop floor; offline capture, sync when online.             |
| **Accountants** | Backend / API or reports           | Correct data, monthly reports (P&L, client balances, movements). |
| **Managers**    | Backend / API or dashboards        | Visibility, decisions from same data as accountants.             |
| **Admins**      | Backend / API (or future admin UI) | User and role management.                                        |
| **Customers**   | Indirect (via staff)               | Correct orders and service; no direct system access.             |

**External systems (current & planned):**

| System                         | Relationship                               | MVP                    | Post-MVP |
| ------------------------------ | ------------------------------------------ | ---------------------- | -------- |
| **MySQL**                      | Backend persistence                        | In use                 | —        |
| **Push notification provider** | Notify mobile app (e.g. sync done, alerts) | In scope; provider TBD | —        |
| **Firebase** (e.g. Auth, FCM)  | Auth, sync, or analytics                   | Optional               | Planned  |
| **App Store / Play Store**     | Distribution, compliance                   | Plan for submission    | —        |

**Boundary decisions:**

- **Backend** owns identity, business rules, and persistence; it does not store mobile-only state. Sync is client-initiated (mobile pushes/pulls when online).
- **Mobile app** owns local persistence (SQLite), offline UX, and sync client logic; it is not a source of truth until data is accepted by the backend.
- **Third-party services** (push, optional Firebase) are at the edge: mobile and/or backend integrate with them; no business data is the primary store in external SaaS beyond what’s needed for delivery (e.g. FCM tokens).

---

## Key architectural decisions

### AD-1: Offline & sync

| Decision              | Choice                                      | Rationale                                                                                 |
| --------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Local persistence** | SQLite on mobile (MVP)                      | Durable offline storage; supports queries and sync queue.                                 |
| **Sync initiator**    | Client-initiated (mobile)                   | Mobile detects connectivity and pushes/pulls; backend stays stateless for sync.           |
| **Conflict handling** | Strategy to be defined in implementation    | PRD requires “correct data preserved”; last-write-wins vs server-wins vs merge rules TBD. |
| **Sync visibility**   | UI and/or push when sync completes or fails | FR16: staff informed when sync completes or fails.                                        |

**Implications:** Mobile needs a sync layer (queue of local changes, pull of server state); backend may need batch or bulk endpoints for efficient sync; conflict resolution must be documented once chosen.

### AD-2: Authentication & identity

| Decision                   | Choice                                          | Rationale                                                                   |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| **Identity provider**      | Backend (ASP.NET Identity)                      | Already in place; single source of truth for users and roles.               |
| **Tokens**                 | JWT access + refresh token                      | PRD and current implementation; refresh reduces re-login when offline.      |
| **Token storage (mobile)** | Secure storage (e.g. secure enclave / keychain) | NFR-S2: protect credentials at rest; avoid plain AsyncStorage for tokens.   |
| **Offline auth**           | Valid local session from last successful login  | User can use app offline until token expiry; re-auth when online if needed. |

**Implications:** Mobile must attach Bearer token to API calls (interceptor); refresh flow when access token expires; planned: email verification and password reset on backend.

### AD-3: Data authority & quality

| Decision            | Choice                                                            | Rationale                                                                                 |
| ------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Source of truth** | Backend (MySQL)                                                   | Reports and accountants use backend data; synced mobile data becomes truth once accepted. |
| **Validation**      | Backend authoritative; mobile can mirror rules                    | FluentValidation on API; mobile validation improves UX but backend rejects invalid data.  |
| **Reporting**       | From backend only (views e.g. VMonthlyProfitLoss, VClientBalance) | Single source of truth; no reporting from mobile-only data.                               |

**Implications:** Sync must ensure accepted entities (clients, orders, payments, etc.) are reflected on backend; duplicate or invalid submissions must be handled by API and sync strategy.

### AD-4: API & integration

| Decision         | Choice                  | Rationale                              |
| ---------------- | ----------------------- | -------------------------------------- |
| **API style**    | REST, JSON              | Current design; Swagger maintained.    |
| **Versioning**   | Deferred post-MVP       | PRD: rate limits and versioning later. |
| **Auth on wire** | HTTPS (TLS); Bearer JWT | NFR-S2: protect in transit.            |

**Implications:** No `/api/v1` until versioning is introduced; same contract for mobile and any future web/admin clients.

### AD-5: Push notifications (MVP)

| Decision     | Choice                                          | Rationale                                                         |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------- |
| **Scope**    | In scope for MVP (e.g. sync completion, alerts) | PRD and FR23.                                                     |
| **Provider** | TBD (e.g. FCM, Expo push)                       | To be chosen in implementation; store compliance when submitting. |

**Implications:** Backend and/or mobile will integrate with chosen provider; device tokens stored and used for targeted push; privacy/data handling documented for stores.

---

## Component & technology stack

**Confirmed stack** (aligned with current codebase and PRD):

### Backend (HamzaTex.Api)

| Layer / concern | Technology                    | Note                                                 |
| --------------- | ----------------------------- | ---------------------------------------------------- |
| Runtime         | .NET 9                        | —                                                    |
| Web API         | ASP.NET Core 9                | REST under `/api`                                    |
| ORM             | Entity Framework Core 9       | MySQL (Pomelo)                                       |
| Database        | MySQL 8.x                     | Single instance; migrations on startup in dev        |
| Auth            | ASP.NET Identity + JWT Bearer | BCrypt; policies AdminOnly, StaffOnly, Authenticated |
| Validation      | FluentValidation              | DTOs and request validation                          |
| API docs        | Swashbuckle (Swagger)         | `/swagger`                                           |

**Decision:** Retain current backend stack for MVP; add email verification and password reset (post-MVP or as MVP follow-on) without changing runtime or database.

### Mobile (React Native / Expo)

| Layer / concern             | Technology               | Note                                                   |
| --------------------------- | ------------------------ | ------------------------------------------------------ |
| Framework                   | React Native             | 0.81+                                                  |
| Tooling / build             | Expo                     | Managed workflow; iOS, Android, web                    |
| State                       | Redux Toolkit            | Slices; serializable check config as needed            |
| Navigation                  | React Navigation (stack) | —                                                      |
| HTTP                        | Axios                    | Centralized in `src/utils/api.js`                      |
| Local persistence (current) | AsyncStorage             | Interim; replace with SQLite for offline-first         |
| Local persistence (MVP)     | SQLite                   | Library TBD (e.g. expo-sqlite, react-native-quick-sql) |
| Push (MVP)                  | Provider TBD             | FCM, Expo Push, or other; store-compliant              |

**Decision:** Keep Expo for MVP (build, OTA, push options); add SQLite for offline-first; choose push provider and SQLite library in implementation phase.

### Integration

| Concern      | Choice                                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| Protocol     | REST, JSON                                                                       |
| Auth         | HTTPS + `Authorization: Bearer <access_token>`; refresh via `/api/Login/refresh` |
| API base URL | Configurable on mobile (e.g. `src/utils/api.js`)                                 |

**Deferred:** API versioning, rate limiting, Firebase (optional post-MVP).

---

## Risks & compliance

**Architectural commitments** that address PRD success criteria and NFRs:

### Security (NFR-S1–S4)

| Requirement         | Architectural commitment                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**            | JWT with secure signing; refresh token storage and rotation (backend); mobile stores tokens in secure storage (not plain AsyncStorage).       |
| **In transit**      | HTTPS (TLS) for all API traffic.                                                                                                              |
| **At rest**         | Backend: DB and app config protected; mobile: sensitive data (tokens, PII) in secure storage; SQLite and app data per platform best practice. |
| **Access control**  | Role-based policies (AdminOnly, StaffOnly, Authenticated) enforced on backend; mobile respects same roles for UI and API calls.               |
| **Password policy** | Backend: complexity, lockout (current); planned: password reset and email verification.                                                       |

**Risks:** Token theft if device compromised; mitigate with secure storage and refresh rotation. Email verification not yet enforced; document as known gap until implemented.

### Data retention & record-keeping (FR20–FR22, domain)

| Requirement      | Architectural commitment                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retention**    | Business-critical data (transactions, clients, orders, invoices) retained **at least 1 year**; retention policy and deletion process to be defined in implementation. |
| **Auditability** | Backend maintains auditable records (who, what, when); sync and conflict handling must not break audit trail.                                                         |
| **Invoicing**    | Format and workflow for invoice generation/storage to be detailed in implementation.                                                                                  |

**Risks:** Local-only data on mobile not yet synced is not in backend audit; sync and conflict strategy must ensure accepted data is persisted and traceable on backend.

### Performance & reliability (NFR-P, NFR-R)

| Requirement     | Architectural commitment                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **API latency** | Key endpoints (login, client list, order create) target &lt; 3 s under normal load; measure and tune in implementation.         |
| **Mobile UX**   | Key actions (save client, save order) within agreed limits; offline path must feel immediate (local write, sync in background). |
| **Sync**        | Sync completes within agreed limits when online; retries and backoff to avoid thrashing.                                        |
| **Uptime**      | Target high availability (e.g. 99%+ for core operations); to be set and monitored.                                              |
| **Offline**     | No data loss; local persistence and sync queue; sync resumes when connectivity returns.                                         |

**Risks:** Sync backlog or conflicts can delay visibility; conflict strategy and sync status UI (or push) reduce user uncertainty.

### Data quality (PRD risk: wrong data → wrong calculation)

| Mitigation                 | Architectural commitment                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Validation**             | Backend authoritative (FluentValidation); mobile can mirror rules for UX; invalid data rejected by API.          |
| **Single source of truth** | Reports and decisions from backend data only; synced mobile data becomes truth once accepted.                    |
| **Conflict handling**      | Strategy TBD; must preserve correct data and report consistency (document when chosen).                          |
| **Reconciliation**         | Where feasible, support checks to detect/correct wrong data before it impacts reporting (implementation detail). |

### Store & distribution (App Store / Play Store)

| Concern              | Architectural commitment                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Privacy**          | Document what data is collected, stored, and sent; align with store policies and privacy labels.                            |
| **Offline behavior** | Describe offline-first behavior and data handling (local storage, sync) in store listing and compliance.                    |
| **Push**             | When push provider is chosen, document data sent to provider (e.g. device tokens); comply with store and provider policies. |

**Risks:** Store rejection if privacy or data handling is unclear; address during implementation and before submission.

---

## Summary & next steps

**Architecture workflow:** Complete. This document captures project context, system boundaries, key decisions (AD-1–AD-5), component stack, and risks & compliance for HamzaTex.

**Decisions to carry into implementation:**

- **Offline & sync:** SQLite on mobile; client-initiated sync; conflict strategy TBD; sync status via UI and/or push.
- **Auth:** Backend IdP; JWT + refresh; secure token storage on device; offline use with last valid session.
- **Data authority:** Backend is source of truth; validation authoritative on API; reporting from backend only.
- **API:** REST/JSON, no versioning in MVP; HTTPS + Bearer JWT.
- **Push:** In scope for MVP; provider TBD; store-compliant.
- **Stack:** Backend (.NET 9, MySQL, Identity, JWT); mobile (React Native, Expo, Redux; SQLite + push TBD).

**Implementation-phase decisions (TBD):**

- Conflict resolution strategy (last-write-wins vs server-wins vs merge rules).
- Push notification provider (FCM, Expo Push, or other).
- SQLite library on mobile (e.g. expo-sqlite, react-native-quick-sql).
- Retention policy and deletion process for data ≥ 1 year.
- Invoice format and workflow.

**Suggested next workflow:** Create epics and stories (or implementation readiness) using this architecture and the PRD as inputs.
