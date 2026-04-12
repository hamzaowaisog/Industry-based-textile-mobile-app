# HamzaTex — TODO Tracker

Full scan date: 2026-04-12

## What IS Done (Backend)

| Area | Status |
|------|--------|
| Auth (register, login, logout, refresh, change-password, confirm-email, resend-confirm, forgot-password, reset-password) | ✅ Done |
| Users (GET all, GET by id, PUT /me, DELETE, GET /pdf) | ✅ Done |
| UserRoles (full CRUD + PDF) | ✅ Done |
| Clients (POST, GET all/me/filtered/by-id, PUT, DELETE, GET /pdf) | ✅ Done |
| ClientType (full CRUD + PDF) | ✅ Done |
| Products (POST, GET all/filtered/by-id, PUT, DELETE, GET /pdf) | ✅ Done |
| StockMovements (POST, GET paginated, GET by-id, GET filtered, PUT, DELETE, GET /pdf) | ✅ Done |
| Meta (GET /all, GET /{type} — all 11 lookup tables) | ✅ Done |
| App (GET /health, GET /info, GET /spec) | ✅ Done |

## Remaining Work

| File | What | Status |
|------|------|--------|
| [01-stock-movements-read.md](01-stock-movements-read.md) | StockMovements read + update + delete endpoints | ✅ Done |
| [02-orders.md](02-orders.md) | Full Orders API (entity exists, no service/controller) | 🔴 Not Started |
| [03-purchases.md](03-purchases.md) | Full Purchases API (entity exists, no service/controller) | 🔴 Not Started |
| [04-payments.md](04-payments.md) | Full Payments API (entity exists, no service/controller) | 🔴 Not Started |
| [05-expenses.md](05-expenses.md) | Full Expenses API + ExpenseType controller | 🔴 Not Started |
| [06-transactions.md](06-transactions.md) | Full Transactions API + lookup controllers | 🔴 Not Started |
| [07-reports.md](07-reports.md) | Expose VMonthlyProfitLoss, VClientBalance, VMonthlyCreditDebit | 🔴 Not Started |
| [08-invoices.md](08-invoices.md) | Invoice entity + full API (nothing exists) | 🔴 Not Started |
| [09-users-admin-create.md](09-users-admin-create.md) | POST /api/Users — admin creates user directly | 🔴 Not Started |
| [10-sync.md](10-sync.md) | Backend sync push/pull endpoints for mobile offline | 🔴 Not Started |
| [11-push-notifications.md](11-push-notifications.md) | Device registration + push provider integration | 🔴 Not Started |
| [12-frontend.md](12-frontend.md) | All mobile work (scaffold only currently) | 🔴 Not Started |

## Status Key

- ✅ Done
- ⚠️ Partial
- 🟡 In Progress
- 🔴 Not Started
- 🟢 Completed this sprint
