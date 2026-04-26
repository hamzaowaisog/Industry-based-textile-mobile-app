# Transactions API — Design Spec
**Date:** 2026-04-27  
**Status:** Approved  
**Approach:** Pure API Layer (no refactoring of existing services)

---

## Context

The `Transaction` table is the core financial ledger. All existing services (Order, Purchase, Payment, Expense) already auto-post rows directly to `_db.Transactions`. No `ITransactionService` or `TransactionController` exists yet. TransType, TransMode, and TransCategory lookup endpoints are already exposed via `GET /api/Meta/{type}` — no new lookup controllers are needed.

---

## Approach

**Pure API Layer** — `TransactionService` reads/writes `_db.Transactions` directly. Existing services are not touched. The Transactions API serves two purposes:
1. **Ledger viewer** — all users can see transactions scoped to their access level
2. **Manual correction tool** — admins can create/edit/delete manually-entered transactions (e.g. opening balance adjustments)

---

## Access Control

| Role | Read | Write |
|---|---|---|
| Admin | Full ledger (all transactions) | Create, Edit, Delete — manual-only entries |
| Staff | Scoped to own records via `/me` | None (read-only) |
| Any Authenticated | Own record by ID, by-client with ownership check | None |

---

## Auto-Posted Detection

A transaction is **locked** (blocked from edit/delete) if any of the following are true:

| Condition | Source | Error message |
|---|---|---|
| `OrderId != null` | Order delivery/cancellation | `"This transaction was posted by Order #N. Edit the Order instead."` |
| `PurchaseId != null` | Purchase delivery/cancellation | `"This transaction was posted by Purchase #N. Edit the Purchase instead."` |
| `Expenses.Any()` | Expense creation/deletion | `"This transaction was posted by an Expense. Edit the Expense instead."` |
| `TransCategoryId in [5,6]` and no Order/Purchase/Expense | Payment (Cash In / Cash Out) | `"This transaction was posted by a Payment. Use the Payment reversal flow instead."` |

The `TransactionDto` exposes an `IsManual` bool (derived at query time) so the frontend can conditionally show edit/delete controls.

`IsManual` derivation:
```
OrderId == null && PurchaseId == null && !Expenses.Any() && TransCategoryId not in [5, 6]
```

---

## Data Layer

### `TransactionDto` (response)

| Field | Type | Notes |
|---|---|---|
| `Id` | int | |
| `ClientId` | int? | |
| `ClientName` | string? | Resolved from `Client.Name` |
| `ProductId` | int? | |
| `ProductName` | string? | Resolved from `Product.Name` |
| `UserId` | int? | |
| `UserName` | string? | Resolved from `User.Name` |
| `OrderId` | int? | |
| `PurchaseId` | int? | |
| `TransTypeId` | int? | |
| `TransTypeName` | string? | Resolved from `TransType.Name` (Debit / Credit) |
| `TransModeId` | int? | |
| `TransModeName` | string? | Resolved from `TransMode.Name` (Cash / Bank / Credit) |
| `TransCategoryId` | int? | |
| `TransCategoryName` | string? | Resolved from `TransCategory.Name` (Sales / Expenses / etc.) |
| `Amount` | decimal | |
| `TransDate` | DateOnly | |
| `Notes` | string? | |
| `CreatedAt` | DateTime? | |
| `Source` | string | Derived: `"Order #N"` \| `"Purchase #N"` \| `"Expense"` \| `"Payment"` \| `"Manual"` |
| `IsManual` | bool | Derived — controls edit/delete eligibility |

### `CreateTransactionDto` (manual entry — lightweight)

| Field | Type | Required | Default |
|---|---|---|---|
| `Amount` | decimal | Yes | — |
| `TransCategoryId` | int | Yes | — |
| `TransDate` | DateOnly | Yes | — |
| `Notes` | string? | No | null |
| `ClientId` | int? | No | null |
| `TransTypeId` | int? | No | 1 (Debit) |
| `TransModeId` | int? | No | 1 (Cash) |

### `UpdateTransactionDto`

Same fields as `CreateTransactionDto`.

### Validation (`TransactionValidation.cs`)

- `Amount > 0`
- `TransCategoryId > 0`
- `TransDate` not empty/default

---

## Service Layer

**File:** `Services/TransactionService.cs`  
**Interface:** `ITransactionService`  
**Registration:** `AddScoped<ITransactionService, TransactionService>()` in `Program.cs`

### Interface Methods

| Method | Signature | Policy |
|---|---|---|
| Create | `Task<Response<TransactionDto>> CreateAsync(CreateTransactionDto model, int userId)` | AdminOnly |
| Get by ID | `Task<Response<TransactionDto>> GetByIdAsync(int id, int userId, bool isAdmin)` | AdminOrStaff |
| Get all paginated | `Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize)` | AdminOnly |
| Get by user (me) | `Task<Response<List<TransactionDto>>> GetAllByUserIdAsync(int userId)` | Authenticated |
| Get by client | `Task<Response<List<TransactionDto>>> GetAllByClientIdAsync(int clientId, int userId, bool isAdmin)` | AdminOrStaff |
| Get filtered | `Task<Response<List<TransactionDto>>> GetFilteredAsync(int? typeId, int? categoryId, int? modeId, int? clientId, DateOnly? dateFrom, DateOnly? dateTo)` | AdminOnly |
| Get all (PDF) | `Task<Response<List<TransactionDto>>> GetAllAsync()` | AdminOnly |
| Update | `Task<Response<TransactionDto>> UpdateByIdAsync(int id, UpdateTransactionDto model)` | AdminOnly |
| Delete | `Task<Response> DeleteByIdAsync(int id)` | AdminOnly |

### Business Logic Notes

- `CreateAsync` sets `UserId` from the JWT claim, `CreatedAt = DateTime.UtcNow`
- `GetByIdAsync` — if not admin, returns `ErrorResponse("Not found")` when `UserId != currentUserId` (ownership check)
- `GetAllByClientIdAsync` — if not admin, verifies the client belongs to `currentUserId` via `Client.UserId`
- `UpdateByIdAsync` / `DeleteByIdAsync` — run auto-posted check first; return `ErrorResponse` with source-specific message if locked
- All read queries use `.AsNoTracking()` with includes: `.Include(t => t.Expenses).Include(t => t.Client).Include(t => t.Product).Include(t => t.User).Include(t => t.TransType).Include(t => t.TransMode).Include(t => t.TransCategory)` to enable name resolution, `IsManual`, and `Source` derivation

### PDF Config (`Models/PdfConfig.cs`)

Add `Transaction` entry to `EntityPdfConfigs`:
- Columns: `Id`, `Source`, `TransCategoryName`, `TransTypeName`, `TransModeName`, `Amount`, `TransDate`, `ClientName`, `Notes`

---

## Controller

**File:** `Controllers/TransactionController.cs`  
Extends `BaseController`. Uses `GetUserId()` private helper (established pattern).

| Method | Route | Policy | Description |
|---|---|---|---|
| POST | `/api/Transaction` | AdminOnly | Manual create |
| GET | `/api/Transaction` | AdminOnly | Paginated full ledger |
| GET | `/api/Transaction/me` | Authenticated | Scoped to current user |
| GET | `/api/Transaction/{id}` | AdminOrStaff | Single record with ownership check |
| GET | `/api/Transaction/by-client/{clientId}` | AdminOrStaff | By client with ownership check |
| GET | `/api/Transaction/filtered` | AdminOnly | Filter by typeId, categoryId, modeId, clientId, dateFrom, dateTo |
| PUT | `/api/Transaction/{id}` | AdminOnly | Update — blocked if auto-posted |
| DELETE | `/api/Transaction/{id}` | AdminOnly | Delete — blocked if auto-posted |
| GET | `/api/Transaction/pdf` | AdminOnly | Full ledger PDF export |

**Required on controller class:** `[Produces("application/json")]`, XML `/// <summary>` doc comments on class and every action, `[ProducesResponseType(...)]` on every action.

---

## What Is NOT Changing

- `OrderService`, `PurchaseService`, `PaymentService`, `ExpenseService` — untouched
- `MetaController` / `LookupService` — TransType, TransMode, TransCategory lookups already exposed; no changes needed
- No new migrations — `Transaction` table and all lookup tables already exist
