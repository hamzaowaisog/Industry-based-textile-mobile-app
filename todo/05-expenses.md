# Expenses API

**Epic:** 6 (business costs)
**Status:** ✅ Complete

## What Already Exists

- `Expense` entity: `ExpenseTypeId`, `Amount`, `TransModeId`, `UserId`, `TransCategoryId`, `TransactionId`, `ExpenseDate` (DateOnly), `Notes`, `CreatedAt`
- `ExpenseType` entity — seeded: Office Expenses (1), Home Expenses (2)
- `TransMode` — seeded: Cash/Bank/Credit — shared with Payments and Transactions
- `TransCategory` — seeded: Sales/Purchases/Office Expenses/Home Expenses/Cash In/Cash Out/Bank In/Bank Out
- `Expense` links to a `Transaction` via `TransactionId` — set atomically on create
- `ApplicationDbContext` has `DbSet<Expense>`, `DbSet<ExpenseType>`

## Tasks

### Models / DTOs (`Models/`)

- [x] Create `ExpenseDto.cs`:
  - `ExpenseDto` — (Id, ExpenseTypeId, ExpenseTypeName, Amount, TransModeId, TransModeName, UserId, RecordedByName, TransCategoryId, TransCategoryName, TransactionId, ExpenseDate, Notes, CreatedAt)
  - `CreateExpenseDto` — (ExpenseTypeId, Amount, TransModeId, TransCategoryId?, ExpenseDate, Notes) — UserId set from JWT
  - `UpdateExpenseDto` — (Amount, TransModeId, ExpenseDate?, Notes) — TransCategoryId intentionally excluded (immutable)
  - `ExpenseTypeDto`, `CreateExpenseTypeDto`, `UpdateExpenseTypeDto`

### ViewModels (`Services/ViewModel/`)

- [x] Create `ExpenseViewModel.cs`:
  - `ExpenseCreateViewModel` — includes optional `TransCategoryId` for custom expense types
  - `ExpenseUpdateViewModel`
  - `ExpenseTypeCreateViewModel`, `ExpenseTypeUpdateViewModel`

### Validation (`Validation/`)

- [x] Create `ExpenseValidation.cs`:
  - `ExpenseCreateViewModelValidation` — ExpenseTypeId > 0, Amount > 0, TransModeId ∈ {1,2,3}, TransCategoryId > 0 when provided
  - `ExpenseUpdateViewModelValidation` — Amount > 0, TransModeId ∈ {1,2,3}
  - `ExpenseTypeCreateViewModelValidation`, `ExpenseTypeUpdateViewModelValidation` — Name required, max 100 chars

### Service Layer (`Services/`)

- [x] Create `IExpenseTypeService` / `ExpenseTypeService` in `Services/ExpenseService.cs`:
  - CreateAsync (unique name check), GetByIdAsync, GetAllAsync, UpdateByIdAsync, DeleteByIdAsync
  - DeleteByIdAsync guards: rejects seeded IDs 1 and 2; rejects if in-use by any Expense
- [x] Create `IExpenseService` / `ExpenseService` in `Services/ExpenseService.cs`:
  - `CreateAsync` — atomically creates Transaction (TransTypeId=1 Debit) + Expense; TransCategoryId auto-derived from ExpenseTypeId (1→3, 2→4) or supplied explicitly
  - `GetByIdAsync`, `GetAllPaginatedAsync`, `GetAllByUserIdAsync`, `GetFilteredAsync`
  - `UpdateByIdAsync` — atomically updates Expense + linked Transaction (TransCategoryId immutable)
  - `DeleteByIdAsync` — removes Expense first (clears FK), then linked Transaction
- [x] Registered both as Scoped in `Program.cs`

### PDF Config (`Models/PdfConfig.cs`)

- [x] Added `Expense` config (columns: Id, ExpenseTypeName, Amount, TransModeName, TransCategoryName, ExpenseDate, RecordedByName, Notes)
- [x] Added `ExpenseType` config (columns: Id, Name)

### Controller (`Controllers/ExpenseController.cs`)

- [x] `POST /api/Expense` — create expense + atomic debit transaction (AdminOrStaff)
- [x] `GET /api/Expense` — all expenses paginated (AdminOnly)
- [x] `GET /api/Expense/me` — current user's expenses paginated (Authenticated)
- [x] `GET /api/Expense/{id}` — get by ID (Authenticated)
- [x] `GET /api/Expense/filtered` — filter by expenseTypeId, modeId, dateFrom, dateTo (Authenticated)
- [x] `PUT /api/Expense/{id}` — update amount, mode, date, notes — atomic with Transaction (AdminOrStaff)
- [x] `DELETE /api/Expense/{id}` — hard delete expense + linked Transaction (AdminOnly)
- [x] `GET /api/Expense/pdf` — PDF export with optional filters (AdminOrStaff)

### ExpenseType Controller (`Controllers/ExpenseTypeController.cs`)

- [x] `POST /api/ExpenseType` (AdminOnly)
- [x] `GET /api/ExpenseType` (AdminOnly)
- [x] `GET /api/ExpenseType/{id}` (AdminOnly)
- [x] `PUT /api/ExpenseType/{id}` (AdminOnly)
- [x] `DELETE /api/ExpenseType/{id}` (AdminOnly) — guarded: no seeded, no in-use
- [x] `GET /api/ExpenseType/pdf` (AdminOnly)

## Business Logic Notes

- `Expense.UserId` populated from JWT `NameIdentifier` claim
- `ExpenseDate` is `DateOnly` — controller defaults to `DateOnly.FromDateTime(DateTime.UtcNow)` when omitted
- Every Expense atomically creates a linked Transaction — `TransactionId` is always non-null after create
- `TransCategoryId` auto-derived: Office Expenses (1) → 3, Home Expenses (2) → 4. Custom expense types must supply `TransCategoryId` explicitly
- `TransCategoryId` is immutable after creation — reclassification requires delete + recreate (protects P&L history)
- Delete order: Expense first (removes FK), then Transaction — reversing causes EF cascade conflict
- Expenses feed `v_monthly_profit_loss.TotalExpenses` via `trans_category_id IN (3, 4)` on the transactions table
- Seeded ExpenseTypes (ID 1, 2) cannot be deleted; custom types cannot be deleted while in use
