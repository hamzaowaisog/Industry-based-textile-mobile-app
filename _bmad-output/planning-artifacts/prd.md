---
stepsCompleted:
  [
    "step-01-init",
    "step-02-discovery",
    "step-03-success",
    "step-04-journeys",
    "step-05-domain",
    "step-06-innovation",
    "step-07-project-type",
    "step-08-scoping",
    "step-09-functional",
    "step-10-nonfunctional",
    "step-11-polish",
    "step-12-complete",
  ]
classification:
  projectType: "multi-part (api_backend + mobile_app)"
  domain: "business/trading/ERP"
  complexity: "medium-high"
  projectContext: "brownfield"
inputDocuments:
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
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 10
workflowType: prd
---

# Product Requirements Document - HamzaTexGithub

**Author:** mhamzaog
**Date:** 2025-01-29

## Executive Summary

HamzaTex is a brownfield full-stack product (API + mobile) evolving toward an enterprise-ready, offline-first system. **Target users:** staff (mobile), accountants, managers, and—indirectly—customers. **Differentiator:** correct data, no data loss when offline, monthly reporting from a single source of truth, and low-cost architecture. Success depends on security, sync reliability, and data quality so that wrong data does not drive wrong calculations or performance view.

## Success Criteria

### User Success

- **Security:** Users trust that their data is secure (authentication, encryption, access control).
- **Offline resilience:** When the internet is unavailable, data is not lost; actions are stored locally and sync when connectivity returns.
- **Reliability:** Users can complete core tasks (e.g. client/order entry, viewing data) without losing work or hitting unexplained failures.

### Business Success

- **Customer acquisition:** The product supports higher customer acquisition (e.g. more sign-ups, onboarded clients, or active users than before).
- **Profitability:** The system contributes to more profits (e.g. through efficiency, fewer errors, better visibility, or faster operations).
- **Adoption:** Target users (e.g. field staff, office) actually use the app for daily work instead of workarounds.

### Technical Success

- **Uptime:** High availability of the API and critical flows (target to be set, e.g. 99%+ for core operations).
- **Data sync reliability:** Local changes sync to the backend reliably; conflicts are handled and data stays consistent.
- **Performance:** Good response times and smooth UX (e.g. key screens load and sync within agreed limits).

### Measurable Outcomes (to refine later)

- **User:** % of key actions completed offline without data loss; user-reported "data feels secure."
- **Business:** Change in customer count / active users; change in profit or key efficiency metrics.
- **Technical:** Uptime %, sync success rate, P95/P99 latency for main APIs/screens.

## Product Scope

### MVP - Minimum Viable Product

- Core flows working with **offline-first**: data stored locally (e.g. SQLite), synced when online, no data loss when offline.
- **Security baseline:** Auth (e.g. JWT), secure storage, and basic access control.
- Essential business features (e.g. clients, orders, products) usable on mobile and via API, with reliable sync.

### Growth Features (Post-MVP)

- **Enterprise security:** Email verification, password reset, stronger auth and session handling.
- **Firebase** (and related services) integrated where you want them (e.g. auth, sync, or analytics).
- Improved sync (conflict handling, retries, visibility) and performance.
- Features that directly support **customer acquisition** and **profit** (e.g. reporting, workflows, or integrations).

### Vision (Future)

- Full **enterprise** posture: security, compliance, scalability.
- **Offline-first** as a differentiator: best-in-class offline experience and sync.
- Product as a key driver of **high customer acquisition** and **more profits**, with high uptime, data sync reliability, and good performance as standard.

## User Journeys

### 1. Staff with Mobile App (Primary User)

**Opening:** Staff are in the field or on the shop floor with spotty or no internet. They need to record client visits, orders, or transactions without losing data or waiting for connectivity.

**Rising action:** They open the mobile app, enter data (e.g. client, order, amount). The app stores it locally so it's not lost. When back online, changes sync to the backend. They trust that what they enter is what the business sees.

**Climax:** They finish the day knowing every entry is saved and will sync—no re-entry, no "lost paper," and correct data flows to accountants and managers.

**Resolution:** Daily work is faster and more reliable; offline-first architecture keeps the solution low-cost (no constant connectivity required) while keeping data correct and available for reports.

### 2. Accountants

**Opening:** Accountants need correct, complete data to close books and produce monthly reports without chasing staff for missing or wrong entries.

**Rising action:** They use the system (via backend/API or reports) to see transactions, clients, and payments. Data entered by staff (and synced from the mobile app) is the single source of truth. They run or export monthly reports (e.g. P&amp;L, client balances, movements).

**Climax:** Monthly report is generated from accurate, up-to-date data—no manual reconciliation of paper or scattered spreadsheets.

**Resolution:** Reliable monthly reporting on time; trust in data quality; less time fixing input errors.

### 3. Managers

**Opening:** Managers need visibility into operations, correct data to make decisions, and regular summaries (e.g. monthly reports) without extra cost or complex infrastructure.

**Rising action:** They view dashboards or reports (from the same backend data that staff and accountants use). They see performance, client activity, and trends. Monthly reports give a clear picture of results.

**Climax:** They make decisions based on accurate data and monthly reports instead of gut feel or incomplete information.

**Resolution:** Better oversight and planning; alignment with accountants and staff on one set of correct data; low-cost architecture (offline-first, efficient sync) keeps TCO manageable.

### 4. Customers

**Opening:** Customers interact with the business through staff (e.g. orders, payments, follow-up). They expect correct orders, clear statements, and reliable service.

**Rising action:** Staff use the mobile app (often offline) to capture orders and payments. Data syncs so the business has correct records. Customers get accurate info when they call or when staff follow up.

**Climax:** Customers receive correct orders, accurate balances, and consistent service because staff input is correct and available across the system.

**Resolution:** Higher trust and satisfaction; fewer disputes; correct data and monthly reporting support fair, transparent dealings with customers.

### Journey Requirements Summary

| Capability area                     | What the journeys need                                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Correct data input**              | Validation and clear flows on mobile (and backend) so staff enter complete, valid data; single source of truth for accountants and managers.         |
| **Monthly report**                  | Reporting (e.g. P&amp;L, client balances, movements) from the same data; export or run monthly; usable by accountants and managers.                  |
| **Offline architecture (low cost)** | Mobile app works offline; local storage and sync; conflict handling; no dependency on constant connectivity; architecture stays simple and low-cost. |
| **User types**                      | Staff (mobile), Accountants (reports/backend), Managers (reports/dashboards), Customers (indirectly via correct data and service).                   |

## Domain-Specific Requirements

### Compliance & Regulatory

- **Invoicing:** Support generation and storage of invoices (format and workflow to be defined in functional requirements).
- **Record-keeping:** Maintain clear, auditable records of transactions, clients, orders, and payments so the business can demonstrate what happened and when.
- **Data retention:** Retain business-critical data (e.g. transactions, clients, orders, invoices) for **at least 1 year**; retention policy and deletion process to be defined.

### Technical Constraints

- No additional technical constraints beyond those already in Success Criteria and scope (auth, encryption, sync, performance).

### Risk Mitigations

- **Wrong data → wrong calculation and performance view:** Data quality directly drives calculation accuracy and how the company's performance is seen (reports, P&amp;L, decisions).  
  **Mitigations:** Strong validation and correct data input (as in User Journeys); single source of truth; sync and conflict handling so reports use consistent data; where possible, checks or reconciliations to detect and correct wrong data before it affects reports and performance discovery.

## API Backend & Mobile App Specific Requirements

### Project-Type Overview

- **Backend:** REST API (.NET 9) for clients, orders, users, auth; JWT + refresh; Swagger docs.
- **Mobile:** React Native (Expo) for staff; offline-first (local storage + sync); iOS/Android (and web via Expo); **push notifications in scope for MVP.**

### API Backend – Technical

- **Endpoint specs:** Login, Refresh, Users, UserRoles, ChangePassword, Client, ClientType; pagination where needed; additional endpoints as features grow (e.g. invoicing, reports).
- **Auth model:** JWT Bearer; refresh token; policies (AdminOnly, StaffOnly, Authenticated). Planned: email verification, password reset.
- **Data formats:** JSON request/response; DTOs and validation (e.g. FluentValidation).
- **Error codes:** HTTP status codes and consistent error shape (existing helpers).
- **Rate limits:** **Deferred to post-MVP** (e.g. per user/IP when needed).
- **Versioning:** **Deferred to post-MVP** (e.g. `/api/v1/` when needed).
- **API docs:** Swagger/OpenAPI maintained (e.g. `/swagger`).

### Mobile App – Technical

- **Platform requirements:** React Native with Expo; iOS and Android primary; web secondary.
- **Device permissions:** Only what's needed for core flows (e.g. network, storage). No extra device features for MVP.
- **Offline mode:** Required. Local persistence (e.g. SQLite); sync when online; conflict handling; no data loss.
- **Push strategy:** **In scope for MVP** (e.g. sync completion, alerts—implementation details in implementation phase).
- **Store compliance:** Plan for App Store / Play Store (privacy, data handling, offline behavior). Details when preparing store submissions.

### Implementation Considerations

- **Backend:** Add rate limiting and API versioning when decided post-MVP.
- **Mobile:** Implement offline-first, sync, and **push notifications** for MVP; align with Success Criteria (correct data, no data loss, low cost).

## Project Scoping & Phased Development

This section refines and phases the Product Scope above into an actionable roadmap.

### MVP Strategy & Philosophy

- **MVP Approach:** Problem-solving MVP—smallest set that makes staff/accountants/managers say "this is useful" (correct data, no data loss, works offline, monthly report possible).
- **Resource Requirements:** To be defined (team size/skills). Assume small team; MVP scoped so it can be delivered with limited resources.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:** Staff (mobile, offline capture and sync); Accountants (correct data, monthly reports); Managers (visibility and decisions from same data); Customers (correct orders and service via staff input).

**Must-Have Capabilities:**

- Offline-first mobile: local storage (e.g. SQLite), sync, conflict handling, no data loss.
- Auth: JWT + refresh; role-based access (Admin/Staff/Authenticated).
- Core entities: clients, orders, products, payments, transactions (as today); correct data input and validation.
- Push notifications (e.g. sync completion, alerts).
- Invoicing support, record-keeping, data retention ≥ 1 year (format/policy to be detailed in functional requirements).
- Monthly reporting (e.g. P&amp;L, client balances) from single source of truth.
- API: existing endpoints; rate limits and versioning deferred.

### Post-MVP Features

**Phase 2 (Growth):** Enterprise security (email verification, password reset); Firebase and related services; improved sync and performance; features that support customer acquisition and profit (e.g. reporting, workflows, integrations).

**Phase 3 (Expansion):** Full enterprise posture; offline-first as differentiator; product as key driver of acquisition and profit; high uptime and sync reliability.

### Risk Mitigation Strategy

- **Technical:** Validate offline + sync early (proof-of-concept); push and conflict handling in MVP to de-risk.
- **Market:** MVP delivers "correct data + no data loss + monthly report" so adoption can be measured.
- **Resource:** MVP kept to must-haves above; optional: define minimum team size and cut scope if needed (e.g. defer some reporting or invoicing detail).

## Functional Requirements

### Authentication & Identity

- FR1: A user can sign in with username and password and receive a valid access token and refresh token.
- FR2: A user can refresh an access token using a valid refresh token.
- FR3: A user can change their password when authenticated (and, when implemented, via a secure reset flow).
- FR4: The system enforces role-based access (e.g. Admin, Staff, Authenticated) so that only authorized users can perform protected actions.
- FR5: An admin can manage users (create, update, list) and assign roles.
- FR6: The system can support email verification and password reset flows (planned; details in implementation).

### Client & Order Management

- FR7: Staff can create, view, and update client records (e.g. name, type, contact, credit limit, opening balance).
- FR8: Staff can create, view, and update orders and order lines linked to clients and products.
- FR9: Staff can view and manage products (as needed for orders and reporting).
- FR10: Staff can record payments and link them to clients/orders/transactions as required by the business.
- FR11: Staff can view client list with pagination and filtering (e.g. by user or role).
- FR12: Admins can view all clients; staff can view clients scoped to their access (e.g. by user).

### Offline & Sync

- FR13: Staff can capture and edit clients, orders, payments, and related data on the mobile app when offline, with data stored locally and not lost.
- FR14: The system syncs locally created or updated data to the backend when connectivity is available.
- FR15: The system handles sync conflicts so that correct data is preserved and reports remain consistent (strategy to be defined in implementation).
- FR16: Staff can see sync status or be informed when sync completes or fails (e.g. via UI or push).

### Reporting & Data

- FR17: Accountants and managers can obtain monthly reports (e.g. P&amp;L, client balances, movements) from the same data used for daily operations.
- FR18: Reports are generated from a single source of truth (backend data, including synced mobile data).
- FR19: The system supports export or access to report data (e.g. for download or integration) as needed for accounting and management.

### Invoicing & Record-Keeping

- FR20: The system supports generation and storage of invoices (format and workflow to be detailed in implementation).
- FR21: The system maintains auditable records of transactions, clients, orders, and payments so the business can demonstrate what happened and when.
- FR22: The system retains business-critical data (e.g. transactions, clients, orders, invoices) for at least 1 year in line with domain requirements.

### Notifications

- FR23: The system can send push notifications to the mobile app (e.g. sync completion or alerts) in line with MVP scope.

### User & Role Management

- FR24: Admins can manage user roles (e.g. create/assign roles; list roles).
- FR25: The system exposes client types (or equivalent lookups) so staff can classify clients correctly.
- FR26: The system supports listing and managing users and their roles for administration.

### Data Quality & Validation

- FR27: The system validates input (e.g. required fields, formats, business rules) so that incorrect data is rejected or corrected before it affects calculations and reports.
- FR28: The system supports reconciliation or checks (where feasible) to detect and correct wrong data before it impacts reporting and company performance view.

## Non-Functional Requirements

### Performance

- NFR-P1: Key API endpoints (e.g. login, client list, order create) respond within agreed limits (e.g. under 3 s under normal load) so staff and accountants are not blocked.
- NFR-P2: The mobile app completes key user actions (e.g. save client, save order) within agreed limits so workflows remain smooth.
- NFR-P3: Sync of locally created or updated data completes within agreed limits when connectivity is available, so users are not left waiting unnecessarily.

### Security

- NFR-S1: Authentication uses industry-standard mechanisms (e.g. JWT with secure signing; refresh token storage and rotation) so tokens cannot be forged or reused inappropriately.
- NFR-S2: Sensitive data (e.g. credentials, PII, business data) is protected in transit (e.g. TLS) and at rest (e.g. encryption) as appropriate to risk.
- NFR-S3: Access control enforces role-based permissions (Admin, Staff, Authenticated) so users can only perform actions they are allowed to.
- NFR-S4: The system supports secure password policy (e.g. complexity, lockout) and, when implemented, secure password reset and email verification flows.

### Reliability

- NFR-R1: The API and critical flows maintain high availability (target to be set, e.g. 99%+ for core operations) so staff and accountants can work when needed.
- NFR-R2: Sync is reliable: local changes are sent to the backend when online, with retries and conflict handling so data is not lost and reports stay consistent.
- NFR-R3: When offline, the mobile app stores data locally so that no user data is lost due to connectivity failure; sync resumes when connectivity returns.

### Scalability

- NFR-X1: The system is designed so it can support growth in users and data (e.g. more staff, more clients, more transactions) without fundamental rework; specific targets to be set as the product scales.
- NFR-X2: Rate limiting and API versioning are deferred to post-MVP; when introduced, they will be defined so that growth does not compromise stability or compatibility.
