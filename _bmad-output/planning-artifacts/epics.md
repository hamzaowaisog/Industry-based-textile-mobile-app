---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# HamzaTex - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for HamzaTex, decomposing the requirements from the PRD and Architecture into implementable stories. The project is a brownfield full-stack (API + mobile) system with offline-first mobile, JWT auth, and monthly reporting from a single source of truth.

## Requirements Inventory

### Functional Requirements

- FR1: A user can sign in with username and password and receive a valid access token and refresh token.
- FR2: A user can refresh an access token using a valid refresh token.
- FR3: A user can change their password when authenticated (and, when implemented, via a secure reset flow).
- FR4: The system enforces role-based access (e.g. Admin, Staff, Authenticated) so that only authorized users can perform protected actions.
- FR5: An admin can manage users (create, update, list) and assign roles.
- FR6: The system can support email verification and password reset flows (planned; details in implementation).
- FR7: Staff can create, view, and update client records (e.g. name, type, contact, credit limit, opening balance).
- FR8: Staff can create, view, and update orders and order lines linked to clients and products.
- FR9: Staff can view and manage products (as needed for orders and reporting).
- FR10: Staff can record payments and link them to clients/orders/transactions as required by the business.
- FR11: Staff can view client list with pagination and filtering (e.g. by user or role).
- FR12: Admins can view all clients; staff can view clients scoped to their access (e.g. by user).
- FR13: Staff can capture and edit clients, orders, payments, and related data on the mobile app when offline, with data stored locally and not lost.
- FR14: The system syncs locally created or updated data to the backend when connectivity is available.
- FR15: The system handles sync conflicts so that correct data is preserved and reports remain consistent (strategy to be defined in implementation).
- FR16: Staff can see sync status or be informed when sync completes or fails (e.g. via UI or push).
- FR17: Accountants and managers can obtain monthly reports (e.g. P&L, client balances, movements) from the same data used for daily operations.
- FR18: Reports are generated from a single source of truth (backend data, including synced mobile data).
- FR19: The system supports export or access to report data (e.g. for download or integration) as needed for accounting and management.
- FR20: The system supports generation and storage of invoices (format and workflow to be detailed in implementation).
- FR21: The system maintains auditable records of transactions, clients, orders, and payments so the business can demonstrate what happened and when.
- FR22: The system retains business-critical data (e.g. transactions, clients, orders, invoices) for at least 1 year in line with domain requirements.
- FR23: The system can send push notifications to the mobile app (e.g. sync completion or alerts) in line with MVP scope.
- FR24: Admins can manage user roles (e.g. create/assign roles; list roles).
- FR25: The system exposes client types (or equivalent lookups) so staff can classify clients correctly.
- FR26: The system supports listing and managing users and their roles for administration.
- FR27: The system validates input (e.g. required fields, formats, business rules) so that incorrect data is rejected or corrected before it affects calculations and reports.
- FR28: The system supports reconciliation or checks (where feasible) to detect and correct wrong data before it impacts reporting and company performance view.

### Non-Functional Requirements

- NFR-P1: Key API endpoints (e.g. login, client list, order create) respond within agreed limits (e.g. under 3 s under normal load).
- NFR-P2: The mobile app completes key user actions (e.g. save client, save order) within agreed limits so workflows remain smooth.
- NFR-P3: Sync of locally created or updated data completes within agreed limits when connectivity is available.
- NFR-S1: Authentication uses industry-standard mechanisms (e.g. JWT with secure signing; refresh token storage and rotation).
- NFR-S2: Sensitive data is protected in transit (e.g. TLS) and at rest (e.g. encryption) as appropriate to risk.
- NFR-S3: Access control enforces role-based permissions (Admin, Staff, Authenticated).
- NFR-S4: The system supports secure password policy (e.g. complexity, lockout) and, when implemented, secure password reset and email verification flows.
- NFR-R1: The API and critical flows maintain high availability (target to be set, e.g. 99%+ for core operations).
- NFR-R2: Sync is reliable: local changes are sent to the backend when online, with retries and conflict handling so data is not lost and reports stay consistent.
- NFR-R3: When offline, the mobile app stores data locally so that no user data is lost due to connectivity failure; sync resumes when connectivity returns.
- NFR-X1: The system is designed to support growth in users and data without fundamental rework.
- NFR-X2: Rate limiting and API versioning are deferred to post-MVP.

### Additional Requirements

- Backend: REST under `/api`; JWT Bearer; refresh via `/api/Login/refresh`; policies AdminOnly, StaffOnly, Authenticated.
- Mobile: React Native (Expo); secure token storage (not plain AsyncStorage); offline use with last valid session.
- Sync: Client-initiated; SQLite on mobile; conflict strategy TBD in implementation.
- Push: In scope for MVP; provider TBD; store-compliant.
- Data retention: Business-critical data retained at least 1 year; retention policy and deletion process TBD in implementation.
- Invoicing: Format and workflow to be detailed in implementation.

### FR Coverage Map

- FR1: Epic 1 — Sign in and receive tokens
- FR2: Epic 1 — Refresh access token
- FR3: Epic 1 — Change password
- FR4: Epic 1 — Role-based access enforced
- FR5: Epic 2 — Admin manage users and assign roles
- FR6: Epic 1 (planned) — Email verification and password reset
- FR7: Epic 3 — Create, view, update client records
- FR8: Epic 5 — Create, view, update orders and order lines
- FR9: Epic 4 — View and manage products
- FR10: Epic 6 — Record payments
- FR11: Epic 3 — Client list with pagination and filtering
- FR12: Epic 3 — Admin vs staff client scope
- FR13: Epic 7 — Offline capture and local storage
- FR14: Epic 7 — Sync when online
- FR15: Epic 7 — Sync conflict handling
- FR16: Epic 7 — Sync status / push
- FR17: Epic 8 — Monthly reports for accountants and managers
- FR18: Epic 8 — Reports from single source of truth
- FR19: Epic 8 — Export or access to report data
- FR20: Epic 9 — Invoice generation and storage
- FR21: Epic 9 — Auditable records
- FR22: Epic 9 — Data retention ≥ 1 year
- FR23: Epic 10 — Push notifications to mobile
- FR24: Epic 2 — Admin manage roles
- FR25: Epic 3 — Client types lookup for classification
- FR26: Epic 2 — List and manage users and roles
- FR27: Epic 11 — Input validation (backend authoritative; mobile can mirror)
- FR28: Epic 11 — Reconciliation or checks where feasible

## Epic List

### Epic 1: Staff and users can sign in and access the app securely

Staff and admins can authenticate with username and password, receive and refresh tokens, and change password; the system enforces role-based access. **FRs covered:** FR1, FR2, FR3, FR4, FR6 (planned).

### Epic 2: Admins can manage users and roles

Admins can create, update, and list users, assign roles, and manage role definitions so that access control is configurable. **FRs covered:** FR5, FR24, FR26.

### Epic 3: Staff can manage clients

Staff can create, view, and update client records, view a paginated/filtered client list, and classify clients using client types; admins see all clients, staff see scoped clients. **FRs covered:** FR7, FR11, FR12, FR25.

### Epic 4: Staff can manage products

Staff can view and manage products as needed for orders and reporting. **FRs covered:** FR9.

### Epic 5: Staff can create and manage orders

Staff can create, view, and update orders and order lines linked to clients and products. **FRs covered:** FR8.

### Epic 6: Staff can record payments

Staff can record payments and link them to clients, orders, and transactions as required by the business. **FRs covered:** FR10.

### Epic 7: Staff can work offline and sync data

Staff can capture and edit data offline with local storage; when online, data syncs to the backend; conflicts are handled; staff see sync status or are notified (e.g. via UI or push). **FRs covered:** FR13, FR14, FR15, FR16.

### Epic 8: Accountants and managers get monthly reports

Accountants and managers can obtain monthly reports (e.g. P&L, client balances, movements) from the same data; reports are from a single source of truth; export or access to report data is supported. **FRs covered:** FR17, FR18, FR19.

### Epic 9: Invoicing and record-keeping

The system supports invoice generation and storage, auditable records of transactions/clients/orders/payments, and data retention of at least 1 year. **FRs covered:** FR20, FR21, FR22.

### Epic 10: Push notifications

The system can send push notifications to the mobile app (e.g. sync completion or alerts). **FRs covered:** FR23.

### Epic 11: Data quality and validation

The system validates input so incorrect data is rejected or corrected before it affects calculations and reports; reconciliation or checks are supported where feasible. **FRs covered:** FR27, FR28.

---

## Epic 1: Staff and users can sign in and access the app securely

Staff and admins can sign in with username and password, receive and refresh JWT tokens, and change password; the system enforces role-based access so only authorized users perform protected actions.

### Story 1.1: User sign-in with username and password

As a **staff or admin user**,  
I want **to sign in with my username and password and receive a valid access token and refresh token**,  
So that **I can access the app and call protected APIs**.

**Acceptance Criteria:**

- **Given** the user is on the login screen and has valid credentials, **When** the user submits username and password, **Then** the API returns HTTP 200 with a valid JWT access token and refresh token in the response body, **And** tokens are suitable for use with the existing backend Login endpoint.
- **Given** the user submits invalid credentials, **When** the user submits the form, **Then** the API returns an appropriate error (e.g. 401), **And** no tokens are returned.
- **Given** the backend is configured for JWT and refresh tokens, **When** the mobile app calls the login endpoint over HTTPS, **Then** the response is returned within the agreed performance limit (e.g. under 3 s).

### Story 1.2: Refresh access token

As a **signed-in user**,  
I want **to refresh my access token using my valid refresh token**,  
So that **I can continue using the app without re-entering credentials when the access token expires**.

**Acceptance Criteria:**

- **Given** the user has a valid refresh token, **When** the client calls the refresh endpoint (e.g. POST `/api/Login/refresh`) with the refresh token, **Then** the API returns a new access token (and optionally a new refresh token), **And** the client can use the new access token for subsequent requests.
- **Given** the refresh token is invalid or expired, **When** the client calls the refresh endpoint, **Then** the API returns an error (e.g. 401), **And** the user must sign in again.

### Story 1.3: Change password when authenticated

As an **authenticated user**,  
I want **to change my password while signed in**,  
So that **I can keep my account secure**.

**Acceptance Criteria:**

- **Given** the user is authenticated with a valid access token, **When** the user submits current password and new password via the change-password endpoint, **Then** the backend validates the current password and updates the stored password (e.g. BCrypt), **And** returns success.
- **Given** the current password is wrong or the new password does not meet policy, **When** the user submits the form, **Then** the API returns an appropriate error and message, **And** the password is not changed.

### Story 1.4: Enforce role-based access on API and mobile

As the **system**,  
I want **to enforce role-based access (Admin, Staff, Authenticated) on all protected endpoints and in the mobile app**,  
So that **only authorized users can perform protected actions** (FR4).

**Acceptance Criteria:**

- **Given** a request to a protected endpoint, **When** the request includes a valid Bearer access token, **Then** the backend validates the token and applies the correct policy (AdminOnly, StaffOnly, Authenticated), **And** returns 403 if the user’s role is not allowed.
- **Given** the mobile app has received the user’s role with login or profile, **When** the user navigates or performs actions, **Then** the app shows or allows only actions permitted for that role (e.g. admin vs staff client scope), **And** the API is still enforced as source of truth for authorization.

---

## Epic 2: Admins can manage users and roles

Admins can create, update, and list users, assign roles, and manage role definitions.

### Story 2.1: Admin can list users and their roles

As an **admin**,  
I want **to list users and their assigned roles**,  
So that **I can manage who has access to the system**.

**Acceptance Criteria:**

- **Given** the user is authenticated as Admin, **When** the user calls the users list endpoint, **Then** the API returns a list of users with their roles (e.g. Admin, Staff), **And** pagination is supported where specified.
- **Given** the user is not an admin, **When** the user calls the users list endpoint, **Then** the API returns 403.

### Story 2.2: Admin can create and update users and assign roles

As an **admin**,  
I want **to create and update users and assign roles**,  
So that **new staff can get access and existing users’ roles can be changed**.

**Acceptance Criteria:**

- **Given** the user is authenticated as Admin, **When** the user creates a new user (e.g. username, password, role), **Then** the backend creates the user (password hashed) and assigns the role, **And** the user can sign in with those credentials.
- **Given** the user is authenticated as Admin, **When** the user updates an existing user’s role or other allowed fields, **Then** the backend persists the changes, **And** the updated data is returned or reflected on next list.
- **Given** required fields are missing or validation fails, **When** the admin submits the form, **Then** the API returns validation errors and does not create/update.

### Story 2.3: Admin can list and manage role definitions

As an **admin**,  
I want **to list and manage user roles (e.g. create/assign roles, list roles)**,  
So that **role-based access can be configured** (FR24, FR26).

**Acceptance Criteria:**

- **Given** the user is authenticated as Admin, **When** the user calls the roles endpoint, **Then** the API returns the list of roles (e.g. Admin, Staff, Authenticated), **And** the admin can assign these roles to users via the user management flow.
- **Given** the backend supports AdminOnly, StaffOnly, Authenticated policies, **When** a role is assigned to a user, **Then** that user’s access aligns with the policy for that role.

---

## Epic 3: Staff can manage clients

Staff can create, view, and update client records; view a paginated, filterable client list; and classify clients using client types. Admins see all clients; staff see clients scoped to their access.

### Story 3.1: Expose client types for classification

As **staff**,  
I want **the system to expose client types (or equivalent lookups)** so that **I can classify clients correctly** (FR25).

**Acceptance Criteria:**

- **Given** the client types (or lookups) exist in the backend, **When** the mobile app or API client requests client types, **Then** the API returns the list of client types (e.g. from ClientType controller), **And** staff can use these when creating or editing clients.

### Story 3.2: Staff can create and update client records

As **staff**,  
I want **to create, view, and update client records (e.g. name, type, contact, credit limit, opening balance)**,  
So that **clients are correctly maintained for orders and reporting** (FR7).

**Acceptance Criteria:**

- **Given** the user is authenticated (Staff or Admin), **When** the user creates a client with required fields (e.g. name, type) and optional fields (contact, credit limit, opening balance), **Then** the backend validates and persists the client, **And** returns the created/updated client.
- **Given** the user is Staff, **When** the user creates or updates a client, **Then** the client is associated with the appropriate scope (e.g. by user or role) so FR12 is satisfied for listing.
- **Given** validation fails (e.g. required field missing), **When** the user submits, **Then** the API returns validation errors (e.g. FluentValidation) and does not save.

### Story 3.3: Staff can view client list with pagination and filtering

As **staff or admin**,  
I want **to view the client list with pagination and filtering (e.g. by user or role)**,  
So that **I can find and manage clients efficiently** (FR11, FR12).

**Acceptance Criteria:**

- **Given** the user is authenticated, **When** the user requests the client list with optional pagination and filters, **Then** the API returns clients the user is allowed to see: admins see all, staff see clients scoped to their access, **And** results are paginated when specified.
- **Given** the mobile app displays the client list, **When** the user applies filters or pagination, **Then** the list updates to reflect the API response.

---

## Epic 4: Staff can manage products

Staff can view and manage products as needed for orders and reporting.

### Story 4.1: Staff can view and manage products

As **staff**,  
I want **to view and manage products (create/update/list as needed for orders and reporting)**,  
So that **products are available when creating orders and for reports** (FR9).

**Acceptance Criteria:**

- **Given** the user is authenticated, **When** the user requests the product list or a product by id, **Then** the API returns products according to existing Product entity and API design, **And** staff can create/update products where the API allows.
- **Given** the user creates or updates a product, **When** required fields are provided and valid, **Then** the backend persists the product, **And** it appears in list and can be used in orders.

---

## Epic 5: Staff can create and manage orders

Staff can create, view, and update orders and order lines linked to clients and products.

### Story 5.1: Staff can create and update orders and order lines

As **staff**,  
I want **to create, view, and update orders and order lines linked to clients and products**,  
So that **customer orders are recorded and can be used for reporting and payments** (FR8).

**Acceptance Criteria:**

- **Given** the user is authenticated and clients and products exist, **When** the user creates an order with a client and one or more order lines (product, quantity, etc.), **Then** the backend validates and persists the order and lines, **And** returns the created/updated order.
- **Given** the user views or updates an existing order, **When** the user submits valid changes, **Then** the backend persists the changes, **And** the order remains linked to the same client and lines as intended.
- **Given** the client or product does not exist or is out of scope, **When** the user submits the order, **Then** the API returns an appropriate error and does not save.

---

## Epic 6: Staff can record payments

Staff can record payments and link them to clients, orders, and transactions as required by the business.

### Story 6.1: Staff can record payments and link to clients/orders/transactions

As **staff**,  
I want **to record payments and link them to clients, orders, and transactions as required by the business**,  
So that **payments are tracked and reports are accurate** (FR10).

**Acceptance Criteria:**

- **Given** the user is authenticated and the backend has Payment (and related) entities, **When** the user creates a payment with amount, direction, and links to client/order/transaction as required, **Then** the backend validates and persists the payment, **And** returns the created payment.
- **Given** the user views or updates a payment, **When** the user submits valid changes, **Then** the backend persists the changes, **And** the payment remains correctly linked for reporting.

---

## Epic 7: Staff can work offline and sync data

Staff can capture and edit data offline with local storage; when online, data syncs to the backend; conflicts are handled; staff see sync status or are notified (e.g. via UI or push).

### Story 7.1: Mobile app stores data locally when offline

As **staff**,  
I want **to capture and edit clients, orders, payments, and related data on the mobile app when offline, with data stored locally and not lost**,  
So that **I can work without connectivity and data is preserved** (FR13).

**Acceptance Criteria:**

- **Given** the device is offline or the app is in offline mode, **When** the user creates or updates a client, order, payment, or related entity, **Then** the app persists the data locally (e.g. SQLite), **And** the data is not lost on app restart.
- **Given** the user has made local changes, **When** connectivity returns, **Then** the app can later sync those changes (see Story 7.2); **And** no data is dropped due to offline-only storage.

### Story 7.2: Mobile app syncs local data to backend when online

As **staff**,  
I want **the system to sync locally created or updated data to the backend when connectivity is available**,  
So that **my offline work becomes part of the single source of truth** (FR14).

**Acceptance Criteria:**

- **Given** the device is online and there are pending local changes, **When** the sync process runs (client-initiated), **Then** the app sends created/updated entities to the backend API, **And** accepted data is persisted on the backend.
- **Given** the backend rejects a request (e.g. validation error), **When** sync runs, **Then** the app records the failure and does not remove the local record until resolved (e.g. user fix or conflict strategy), **And** sync status can be surfaced (Story 7.4).

### Story 7.3: System handles sync conflicts

As the **system**,  
I want **to handle sync conflicts so that correct data is preserved and reports remain consistent**,  
So that **data quality and report accuracy are maintained** (FR15).

**Acceptance Criteria:**

- **Given** a conflict strategy has been defined in implementation (e.g. last-write-wins or server-wins), **When** a conflict is detected during sync, **Then** the system applies the strategy and updates local or server state accordingly, **And** the outcome is documented and auditable where required.
- **Given** no strategy is yet chosen, **When** this story is implemented, **Then** the team documents the chosen strategy in the architecture or implementation notes.

### Story 7.4: Staff can see sync status or be notified when sync completes or fails

As **staff**,  
I want **to see sync status or be informed when sync completes or fails (e.g. via UI or push)**,  
So that **I know my data is synced or if action is needed** (FR16).

**Acceptance Criteria:**

- **Given** sync has completed or failed, **When** the user is on the app, **Then** the user can see sync status (e.g. last sync time, pending count, or error message) in the UI, **And** optionally be notified via push when implemented (Epic 10).
- **Given** sync fails, **When** the user views status, **Then** the user sees that sync failed and ideally a brief reason or action (e.g. retry).

---

## Epic 8: Accountants and managers get monthly reports

Accountants and managers can obtain monthly reports (e.g. P&L, client balances, movements) from the same data; reports are from a single source of truth; export or access to report data is supported.

### Story 8.1: Expose monthly report data from backend

As an **accountant or manager**,  
I want **to obtain monthly reports (e.g. P&L, client balances, movements) from the same data used for daily operations**,  
So that **I can close books and make decisions from accurate data** (FR17, FR18).

**Acceptance Criteria:**

- **Given** the backend has views or endpoints for monthly data (e.g. VMonthlyProfitLoss, VClientBalance), **When** the user (or API client) requests report data for a given month, **Then** the API returns data from the single source of truth (backend data including synced mobile data), **And** the data is consistent with accepted transactions, clients, and orders.
- **Given** the user requests P&L, client balances, or movements, **When** the API is called with valid parameters, **Then** the response is returned within agreed performance limits.

### Story 8.2: Export or access report data for accounting and management

As an **accountant or manager**,  
I want **export or access to report data (e.g. for download or integration)** so that **I can use it in accounting and management tools** (FR19).

**Acceptance Criteria:**

- **Given** report data is available via the API, **When** the user requests export or access (e.g. download as CSV or via API), **Then** the system provides the data in an agreed format, **And** the export or API response is consistent with the same source of truth.

---

## Epic 9: Invoicing and record-keeping

The system supports invoice generation and storage, auditable records, and data retention of at least 1 year.

### Story 9.1: Support invoice generation and storage

As the **business**,  
I want **the system to support generation and storage of invoices (format and workflow to be detailed in implementation)**,  
So that **invoicing is part of the operational workflow** (FR20).

**Acceptance Criteria:**

- **Given** the implementation has defined invoice format and workflow, **When** a user or system action triggers invoice generation, **Then** the system generates an invoice (e.g. from order/client data) and stores it, **And** the invoice is retrievable and traceable.
- **Given** storage is implemented, **When** an invoice is stored, **Then** it is included in audit and retention scope (Stories 9.2, 9.3).

### Story 9.2: Maintain auditable records of transactions, clients, orders, payments

As the **business**,  
I want **the system to maintain auditable records of transactions, clients, orders, and payments** so that **we can demonstrate what happened and when** (FR21).

**Acceptance Criteria:**

- **Given** the backend persists transactions, clients, orders, and payments, **When** data is created or updated, **Then** the system maintains sufficient information (e.g. timestamps, user or system identifier) to support audit, **And** sync and conflict handling do not break audit trail for accepted data.
- **Given** an auditor or admin requests evidence of a past state, **When** records exist, **Then** the system can provide or export the relevant records in line with the defined retention policy.

### Story 9.3: Retain business-critical data for at least 1 year

As the **business**,  
I want **the system to retain business-critical data (e.g. transactions, clients, orders, invoices) for at least 1 year**,  
So that **we meet domain and compliance requirements** (FR22).

**Acceptance Criteria:**

- **Given** a retention policy and deletion process have been defined in implementation, **When** data is within the retention period, **Then** it is not deleted except as per policy, **And** data older than the retention period may be archived or deleted according to the defined process.
- **Given** the policy specifies at least 1 year for business-critical data, **When** the system is configured, **Then** retention meets this minimum.

---

## Epic 10: Push notifications

The system can send push notifications to the mobile app (e.g. sync completion or alerts).

### Story 10.1: Send push notifications to the mobile app

As **staff**,  
I want **the system to send push notifications to the mobile app (e.g. sync completion or alerts)**,  
So that **I am informed of important events without opening the app** (FR23).

**Acceptance Criteria:**

- **Given** a push provider has been chosen and integrated (e.g. FCM, Expo Push), **When** an event such as sync completion or an alert occurs, **Then** the backend or designated service can send a push notification to the user’s device, **And** the mobile app can receive and display the notification (or handle it in the background).
- **Given** store and privacy requirements, **When** push is implemented, **Then** device tokens and data sent to the provider are documented and handled in line with store and provider policies.

---

## Epic 11: Data quality and validation

The system validates input so incorrect data is rejected or corrected before it affects calculations and reports; reconciliation or checks are supported where feasible.

### Story 11.1: Validate input on backend and optionally on mobile

As the **system**,  
I want **to validate input (e.g. required fields, formats, business rules)** so that **incorrect data is rejected or corrected before it affects calculations and reports** (FR27).

**Acceptance Criteria:**

- **Given** a request to create or update an entity (e.g. client, order, payment), **When** the request fails validation (required field missing, invalid format, or business rule), **Then** the API returns validation errors (e.g. FluentValidation) and does not persist invalid data, **And** the response clearly indicates what failed.
- **Given** the mobile app, **When** the team chooses to mirror validation rules, **Then** the app can show inline validation to improve UX, **And** the backend remains the authoritative source of validation.

### Story 11.2: Support reconciliation or checks where feasible

As the **business**,  
I want **the system to support reconciliation or checks (where feasible) to detect and correct wrong data before it impacts reporting and company performance view**,  
So that **reports and decisions are based on correct data** (FR28).

**Acceptance Criteria:**

- **Given** the implementation has defined reconciliation or check features (e.g. balance checks, duplicate detection), **When** such a check runs, **Then** the system detects and reports discrepancies or errors as designed, **And** where applicable, supports or documents correction steps.
- **Given** no specific reconciliation feature is in scope for MVP, **When** this story is implemented, **Then** the team documents what checks (if any) are included and what is deferred.
