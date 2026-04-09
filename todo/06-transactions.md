# Transactions API

**Epic:** 6 (general ledger)
**Status:** 🔴 Not Started

## What Already Exists

- `Transaction` entity: `ClientId`, `ProductId`, `UserId`, `TransTypeId`, `TransModeId`, `TransCategoryId`, `Amount`, `TransDate` (DateOnly), `Notes`, `CreatedAt`
- Full lookup tables seeded:
  - `TransType`: Debit (1), Credit (2)
  - `TransMode`: Cash (1), Bank (2), Credit (3)
  - `TransCategory`: Sales (1), Purchases (2), Office Expenses (3), Home Expenses (4), Cash In (5), Cash Out (6), Bank In (7), Bank Out (8)
- `Transaction` navigates to `Client`, `Product`, `ApplicationUser` and owns a collection of `Expense`
- DB views (`VMonthlyProfitLoss`, `VMonthlyCreditDebit`) are built on top of transactions
- No service, no DTO, no ViewModel, no validation, no controller

## Tasks

### Models / DTOs (`Models/`)

- [ ] Create `TransactionDto.cs`:
  - `TransactionDto` — (Id, ClientId, ProductId, UserId, TransTypeId, TransModeId, TransCategoryId, Amount, TransDate, Notes, CreatedAt)
  - `CreateTransactionDto` — (ClientId?, ProductId?, TransTypeId, TransModeId, TransCategoryId, Amount, TransDate, Notes) — UserId from JWT
  - `UpdateTransactionDto` — (TransTypeId, TransModeId, TransCategoryId, Amount, TransDate, Notes)

### ViewModels (`Services/ViewModel/`)

- [ ] Create `TransactionViewModel.cs`:
  - `TransactionCreateViewModel`
  - `TransactionUpdateViewModel`

### Validation (`Validation/`)

- [ ] Create `TransactionValidation.cs`:
  - `TransactionCreateViewModelValidation` — TransTypeId > 0, TransModeId > 0, TransCategoryId > 0, Amount > 0, TransDate required

### Service Layer (`Services/`)

- [ ] Create `ITransactionService` interface with:
  - `Task<Response<TransactionDto>> CreateAsync(CreateTransactionDto model, int userId)`
  - `Task<Response<TransactionDto>> GetByIdAsync(int id)`
  - `Task<Response<List<TransactionDto>>> GetAllAsync()`
  - `Task<Response<List<TransactionDto>>> GetAllByClientIdAsync(int clientId)`
  - `Task<Response<PagedList<TransactionDto>>> GetAllPaginatedAsync(int page, int pageSize)`
  - `Task<Response<TransactionDto>> UpdateByIdAsync(int id, UpdateTransactionDto model)`
  - `Task<Response> DeleteByIdAsync(int id)`
- [ ] Create `TransactionService` implementing `ITransactionService`
- [ ] Register as Scoped in `Program.cs`

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `Transaction` config to `EntityPdfConfigs` (columns: Id, ClientId, TransTypeId, TransCategoryId, TransModeId, Amount, TransDate, Notes)

### Controller (`Controllers/TransactionController.cs`)

- [ ] `POST /api/Transaction` — create (AdminOrStaff)
- [ ] `GET /api/Transaction` — all paginated (AdminOnly)
- [ ] `GET /api/Transaction/{id}` — by ID (Authenticated)
- [ ] `GET /api/Transaction/by-client/{clientId}` — all for a client (Authenticated)
- [ ] `GET /api/Transaction/filtered` — filter by typeId, categoryId, modeId, clientId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/Transaction/{id}` — update (AdminOrStaff)
- [ ] `DELETE /api/Transaction/{id}` — delete (AdminOnly)
- [ ] `GET /api/Transaction/pdf` — PDF export

### Lookup Read Controllers (lightweight, read-only for frontend dropdowns)

- [ ] `GET /api/TransType` — list all (Authenticated)
- [ ] `GET /api/TransMode` — list all (Authenticated)
- [ ] `GET /api/TransCategory` — list all (Authenticated)

  These can be simple endpoints on a single `LookupController` or separate minimal controllers.

## Business Logic Notes

- `Transaction.UserId` set from JWT (NameIdentifier claim)
- Transactions are the core ledger; `VMonthlyProfitLoss` and `VMonthlyCreditDebit` are built from them
- `TransDate` is `DateOnly` — ensure DTO accepts `DateOnly`
- Decide whether Orders/Purchases auto-create transactions (more robust) or transactions are manual-only
- If auto-creating: `CreateAsync` on OrderService/PurchaseService calls `ITransactionService.CreateAsync` internally
