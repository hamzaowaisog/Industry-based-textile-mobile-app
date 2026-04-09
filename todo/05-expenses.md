# Expenses API

**Epic:** 6 (business costs)
**Status:** 🔴 Not Started

## What Already Exists

- `Expense` entity: `ExpenseTypeId`, `Amount`, `TransModeId`, `UserId`, `TransCategoryId`, `TransactionId`, `ExpenseDate` (DateOnly), `Notes`, `CreatedAt`
- `ExpenseType` entity — seeded: Office Expenses (1), Home Expenses (2)
- `TransMode` — seeded: Cash/Bank/Credit — shared with Payments and Transactions
- `TransCategory` — seeded: Sales/Purchases/Office Expenses/Home Expenses/Cash In/Cash Out/Bank In/Bank Out
- `Expense` links optionally to a `Transaction` via `TransactionId`
- `ApplicationDbContext` has `DbSet<Expense>`, `DbSet<ExpenseType>`
- No service, no DTO, no ViewModel, no validation, no controller for either

## Tasks

### Models / DTOs (`Models/`)

- [ ] Create `ExpenseDto.cs`:
  - `ExpenseDto` — (Id, ExpenseTypeId, Amount, TransModeId, UserId, TransCategoryId, TransactionId, ExpenseDate, Notes, CreatedAt)
  - `CreateExpenseDto` — (ExpenseTypeId, Amount, TransModeId, TransCategoryId, ExpenseDate, Notes) — UserId set from JWT
  - `UpdateExpenseDto` — (ExpenseTypeId, Amount, TransModeId, TransCategoryId, ExpenseDate, Notes)

### ViewModels (`Services/ViewModel/`)

- [ ] Create `ExpenseViewModel.cs`:
  - `ExpenseCreateViewModel`
  - `ExpenseUpdateViewModel`

### Validation (`Validation/`)

- [ ] Create `ExpenseValidation.cs`:
  - `ExpenseCreateViewModelValidation` — ExpenseTypeId > 0, Amount > 0, TransModeId > 0, ExpenseDate required

### Service Layer (`Services/`)

- [ ] Create `IExpenseService` interface with:
  - `Task<Response<ExpenseDto>> CreateAsync(CreateExpenseDto model, int userId)`
  - `Task<Response<ExpenseDto>> GetByIdAsync(int id)`
  - `Task<Response<List<ExpenseDto>>> GetAllAsync()`
  - `Task<Response<PagedList<ExpenseDto>>> GetAllPaginatedAsync(int page, int pageSize)`
  - `Task<Response<ExpenseDto>> UpdateByIdAsync(int id, UpdateExpenseDto model)`
  - `Task<Response> DeleteByIdAsync(int id)`
- [ ] Create `ExpenseService` implementing `IExpenseService`
- [ ] Register as Scoped in `Program.cs`

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `Expense` config to `EntityPdfConfigs` (columns: Id, ExpenseTypeId, Amount, TransModeId, TransCategoryId, ExpenseDate, Notes)

### Controller (`Controllers/ExpenseController.cs`)

- [ ] `POST /api/Expense` — create expense (AdminOrStaff)
- [ ] `GET /api/Expense` — all expenses paginated (AdminOnly)
- [ ] `GET /api/Expense/{id}` — get by ID (Authenticated)
- [ ] `GET /api/Expense/filtered` — filter by expenseTypeId, transCategoryId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/Expense/{id}` — update (AdminOrStaff)
- [ ] `DELETE /api/Expense/{id}` — delete (AdminOnly)
- [ ] `GET /api/Expense/pdf` — PDF export

### ExpenseType Controller (`Controllers/ExpenseTypeController.cs`)

- [ ] `POST /api/ExpenseType` (AdminOnly)
- [ ] `GET /api/ExpenseType` (Authenticated)
- [ ] `GET /api/ExpenseType/{id}` (Authenticated)
- [ ] `PUT /api/ExpenseType/{id}` (AdminOnly)
- [ ] `DELETE /api/ExpenseType/{id}` (AdminOnly)

## Business Logic Notes

- `Expense.UserId` should be populated from the authenticated user's JWT claim (NameIdentifier)
- `ExpenseDate` is `DateOnly` — the DTO should accept `DateOnly` or parse from string
- Expenses optionally link to `Transaction` via `TransactionId` — this linkage is set when a Transaction auto-creates an Expense (future feature); for manual expense creation, `TransactionId` is null
- Expenses feed into `VMonthlyProfitLoss.TotalExpenses` — correct data here is critical for P&L
