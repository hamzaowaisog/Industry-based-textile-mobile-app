# Integration Architecture — HamzaTex

**Type:** Backend API ↔ Mobile app (REST)
**Parts:** backend (HamzaTex.Api), frontend (React Native / Expo)
**Last updated:** 2026-04-16

---

## Overview

- **Frontend** calls **Backend** over HTTP/REST.
- **Backend** exposes `/api/*` endpoints; authentication via JWT Bearer.
- **Frontend** uses Axios in `src/utils/api.js` with base URL (`http://localhost:5000/api`).
- **Frontend** is currently scaffold-only — all domain screens are pending (`todo/12-frontend.md`).

---

## Integration Points

| From | To | Type | Details |
|---|---|---|---|
| Frontend | Backend | REST API | All API calls via Axios. Auth interceptor stubbed, not yet wired. |
| Frontend | Backend | JWT | Login returns JWT + refresh token. `Authorization: Bearer <token>` required on all protected endpoints. |
| Frontend | Backend | OpenAPI | `GET /api/App/spec` downloads OpenAPI JSON for Orval codegen — generates typed React Query hooks. |
| Backend | MySQL | EF Core | Pomelo driver. Auto-migrates + seeds on startup. |
| Backend | SMTP | Email | Confirmation + password reset emails via `appsettings.json` SMTP config. |

---

## Authentication Flow

```
1. POST /api/Auth/login  →  { accessToken, refreshToken }
2. Store tokens (SecureStore / AsyncStorage on mobile)
3. All requests: Authorization: Bearer <accessToken>
4. On 401: POST /api/Auth/refresh with refreshToken → new accessToken
5. On logout: POST /api/Auth/logout to revoke refreshToken server-side
```

---

## Data Flow — Business Operations

```
Order lifecycle:
  POST /api/Order (Pending)
    → PUT /api/Order/{id} (status=Delivered) → stock movement Out + Transaction (Sales, Credit)
    → PUT /api/Order/{id} (status=Cancelled) → stock reversal In + Transaction (Sales, Debit, negative)

Purchase lifecycle:
  POST /api/Purchase (Pending)
    → PUT /api/Purchase/{id} (status=Delivered) → stock movement In + Transaction (Purchases, Debit)
    → PUT /api/Purchase/{id} (status=Cancelled) → stock reversal Out + Transaction (Purchases, Credit, negative)

Payment lifecycle:
  POST /api/Payment → allocates to orders/purchases (FIFO or manual) + Transaction (Cash In/Out)
    → POST /api/Payment/{id}/reverse → mirror Transaction + IsReversed=true
    → POST /api/Payment/{id}/reverse-and-correct → reverse + re-create for correct client (atomic)
```

---

## Reporting Views (DB-level aggregation)

| View | Read via | Purpose |
|---|---|---|
| `v_monthly_profit_loss` | `GET /api/Report/profit-loss` *(pending)* | Monthly Sales − Purchases − Expenses |
| `v_client_balance` | `GET /api/Report/client-balances` *(pending)* | Per-client outstanding balance |
| `v_monthly_credit_debit` | `GET /api/Report/credit-debit` *(pending)* | Monthly cash in vs cash out |

All three views aggregate from the `transactions` and `payments` tables. The ReportController is not yet built — see `todo/07-reports.md`.

---

## Lookup / Meta Cache

Frontend calls `GET /api/Meta/all` on app startup and caches all lookup tables locally:
- OrderStatuses, PurchaseStatuses, PaymentDirections, TransModes, TransCategories, ClientTypes, UserRoles, ExpenseTypes, MovementTypes, MovementSources

This eliminates per-request lookup fetches throughout the app.

---

## PDF Export

Every list endpoint has a corresponding `GET /api/{Entity}/pdf` endpoint.
Returns `application/pdf` binary using the `IPdfService` + `Helpers/pdf.html` template.
Columns are defined per-entity in `Models/PdfConfig.cs` → `EntityPdfConfigs`.

---

## Planned / Not Yet Implemented

| Feature | Status | Reference |
|---|---|---|
| Offline-first (SQLite + sync) | Not started | `todo/10-sync.md` |
| Push notifications (Expo Push) | Not started | `todo/11-push-notifications.md` |
| ReportController | Not started | `todo/07-reports.md` |
| InvoiceController | Not started | `todo/08-invoices.md` |
| ExpenseController | Not started | `todo/05-expenses.md` |
| TransactionController | Not started | `todo/06-transactions.md` |
| Frontend domain screens | Not started | `todo/12-frontend.md` |
