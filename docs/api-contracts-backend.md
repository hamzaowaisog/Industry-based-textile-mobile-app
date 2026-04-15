# API Contracts — Backend (HamzaTex.Api)

**Part:** backend
**Base URL:** `/api`
**Authentication:** JWT Bearer (except anonymous endpoints)
**Documentation:** Swagger at `http://localhost:5000/swagger`
**OpenAPI spec download:** `GET /api/App/spec`
**Last updated:** 2026-04-16

---

## Authorization Policies

| Policy | Condition |
|---|---|
| `AdminOnly` | RoleId = 1 |
| `StaffOnly` | RoleId = 2 |
| `AdminOrStaff` | RoleId = 1 or 2 |
| `Authenticated` | Any valid JWT |

All controllers require auth by default via a global `AuthorizeFilter`. Endpoints marked Anonymous override this.

---

## Auth (`/api/Auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Auth/register` | Anonymous | Register new user |
| POST | `/api/Auth/login` | Anonymous | Login; returns JWT + refresh token |
| POST | `/api/Auth/logout` | Authenticated | Revoke current refresh token |
| POST | `/api/Auth/refresh` | Anonymous | Exchange refresh token for new access token |
| POST | `/api/Auth/change-password` | Authenticated | Change own password |
| GET | `/api/Auth/confirm-email` | Anonymous | Confirm email via token link |
| POST | `/api/Auth/resend-email-confirmation` | Anonymous | Resend confirmation email |
| POST | `/api/Auth/forgot-password` | Anonymous | Request password reset email |
| GET | `/api/Auth/reset-password` | Anonymous | Show reset password form |
| POST | `/api/Auth/reset-password` | Anonymous | Submit new password via reset token |

---

## Users (`/api/Users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Users/{id}` | Authenticated | Get user by ID |
| GET | `/api/Users` | AdminOnly | List all users |
| PUT | `/api/Users/me` | Authenticated | Update own profile |
| DELETE | `/api/Users/{id}` | AdminOnly | Delete user |
| GET | `/api/Users/pdf` | AdminOnly | Export users as PDF |

> **Missing:** `POST /api/Users` (admin create) — see `todo/09-users-admin-create.md`

---

## User Roles (`/api/UserRoles`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/UserRoles` | AdminOnly | Create role |
| GET | `/api/UserRoles` | AdminOnly | List all roles |
| GET | `/api/UserRoles/{id}` | AdminOnly | Get role by ID |
| PUT | `/api/UserRoles/{id}` | AdminOnly | Update role |
| DELETE | `/api/UserRoles/{id}` | AdminOnly | Delete role |
| GET | `/api/UserRoles/pdf` | AdminOnly | Export as PDF |

---

## Clients (`/api/Client`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Client` | AdminOrStaff | Create client |
| GET | `/api/Client` | AdminOnly | List all clients |
| GET | `/api/Client/me` | Authenticated | Clients owned by current user |
| GET | `/api/Client/Filtered` | Authenticated | Paginated + filtered clients |
| GET | `/api/Client/{id}` | Authenticated | Get client by ID |
| PUT | `/api/Client/{id}` | AdminOrStaff | Update client |
| DELETE | `/api/Client/{id}` | AdminOnly | Delete client (blocked if has orders/payments/purchases) |
| GET | `/api/Client/pdf` | AdminOrStaff | Export as PDF |

> `ClientTypeId=2` clients are Suppliers, used in Purchase.SupplierId.

---

## Client Types (`/api/ClientType`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/ClientType` | AdminOnly | Create type |
| GET | `/api/ClientType` | Authenticated | List all types |
| GET | `/api/ClientType/{id}` | Authenticated | Get by ID |
| PUT | `/api/ClientType/{id}` | AdminOnly | Update |
| DELETE | `/api/ClientType/{id}` | AdminOnly | Delete |
| GET | `/api/ClientType/pdf` | AdminOrStaff | Export as PDF |

---

## Products (`/api/Product`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Product` | AdminOrStaff | Create product |
| GET | `/api/Product` | Authenticated | List all products |
| GET | `/api/Product/filtered` | Authenticated | Filtered products |
| GET | `/api/Product/{id}` | Authenticated | Get by ID |
| PUT | `/api/Product/{id}` | AdminOrStaff | Update |
| DELETE | `/api/Product/{id}` | AdminOnly | Delete |
| GET | `/api/Product/pdf` | AdminOrStaff | Export as PDF |

---

## Stock Movements (`/api/StockMovements`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/StockMovements` | AdminOrStaff | Record stock movement |
| GET | `/api/StockMovements` | Authenticated | Paginated list |
| GET | `/api/StockMovements/{id}` | Authenticated | Get by ID |
| GET | `/api/StockMovements/filtered` | Authenticated | Filtered movements |
| PUT | `/api/StockMovements/{id}` | AdminOrStaff | Update |
| DELETE | `/api/StockMovements/{id}` | AdminOnly | Delete |
| GET | `/api/StockMovements/pdf` | AdminOrStaff | Export as PDF |

> MovementSource drives direction automatically: Purchase→In, Sale→Out, Manual→caller supplies type.

---

## Orders (`/api/Order`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Order` | AdminOrStaff | Create order (status=Pending) |
| GET | `/api/Order` | AdminOnly | All orders paginated |
| GET | `/api/Order/me` | Authenticated | Orders by current user |
| GET | `/api/Order/{id}` | Authenticated | Get by ID |
| GET | `/api/Order/filtered` | Authenticated | Filtered orders |
| PUT | `/api/Order/{id}` | AdminOrStaff | Update status (Delivered→stock out+ledger; Cancelled→reversal) |
| DELETE | `/api/Order/{id}` | AdminOnly | Hard delete |
| GET | `/api/Order/pdf` | AdminOrStaff | Export as PDF |

---

## Purchases (`/api/Purchase`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Purchase` | AdminOrStaff | Create purchase (status=Pending) |
| GET | `/api/Purchase` | AdminOnly | All purchases paginated |
| GET | `/api/Purchase/me` | Authenticated | Purchases by current user |
| GET | `/api/Purchase/{id}` | Authenticated | Get by ID |
| GET | `/api/Purchase/filtered` | Authenticated | Filtered purchases |
| PUT | `/api/Purchase/{id}` | AdminOrStaff | Update status (Delivered→stock in+ledger; Cancelled→reversal) |
| DELETE | `/api/Purchase/{id}` | AdminOnly | Hard delete |
| GET | `/api/Purchase/pdf` | AdminOrStaff | Export as PDF |

---

## Payments (`/api/Payment`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/Payment` | AdminOrStaff | Record payment with optional FIFO or manual allocations |
| GET | `/api/Payment` | AdminOnly | All payments paginated |
| GET | `/api/Payment/me` | Authenticated | Payments by current user |
| GET | `/api/Payment/{id}` | Authenticated | Get by ID with allocations |
| GET | `/api/Payment/by-client/{clientId}` | Authenticated | All payments for a client |
| GET | `/api/Payment/filtered` | Authenticated | Filter by clientId, directionId, modeId, date range, reversed flag |
| GET | `/api/Payment/unallocated/{clientId}` | Authenticated | Unallocated credit balance for a client |
| PUT | `/api/Payment/{id}` | AdminOrStaff | Update date/notes/mode (amount + client immutable) |
| POST | `/api/Payment/{id}/reverse` | AdminOnly | Reverse a payment (wrong amount) |
| POST | `/api/Payment/{id}/reverse-and-correct` | AdminOnly | Reverse + re-create for correct client |
| DELETE | `/api/Payment/{id}` | AdminOnly | Hard delete |
| GET | `/api/Payment/pdf` | AdminOrStaff | Export as PDF |

---

## Meta / Lookups (`/api/Meta`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/Meta/all` | Authenticated | All lookup tables in one response (cached by frontend on startup) |
| GET | `/api/Meta/{type}` | Authenticated | Single lookup type (orderstatuses, purchasestatuses, paymentdirections, transmodes, transcategories, etc.) |

---

## App (`/api/App`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/App/health` | Anonymous | Health check |
| GET | `/api/App/info` | Anonymous | App version info |
| GET | `/api/App/spec` | Anonymous | Download OpenAPI JSON spec (for Orval codegen) |

---

## Not Yet Implemented

| Area | Todo |
|---|---|
| Expenses | `todo/05-expenses.md` |
| Transactions | `todo/06-transactions.md` |
| Reports | `todo/07-reports.md` |
| Invoices | `todo/08-invoices.md` |
| Users admin create | `todo/09-users-admin-create.md` |
| Offline sync | `todo/10-sync.md` |
| Push notifications | `todo/11-push-notifications.md` |
