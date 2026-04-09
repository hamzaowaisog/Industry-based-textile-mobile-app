# Payments API

**Epic:** 6 — Staff can record payments
**Status:** 🔴 Not Started

## What Already Exists

- `Payment` entity: `PartyClientId` (FK → Client), `PaymentDirectionId`, `TransModeId`, `Amount`, `PaymentDate`, `Notes`, `CreatedAt`
- `PaymentDirection` — seeded: Received (1), Paid (2), Adjustment (3)
- `TransMode` — seeded: Cash (1), Bank (2), Credit (3) — shared with Transactions and Expenses
- `ApplicationDbContext` has `DbSet<Payment>`, `DbSet<PaymentDirection>`
- No service, no DTO, no ViewModel, no validation, no controller

## Tasks

### Models / DTOs (`Models/`)

- [ ] Create `PaymentDto.cs`:
  - `PaymentDto` — (Id, PartyClientId, PaymentDirectionId, TransModeId, Amount, PaymentDate, Notes, CreatedAt)
  - `CreatePaymentDto` — (PartyClientId, PaymentDirectionId, TransModeId, Amount, PaymentDate, Notes)
  - `UpdatePaymentDto` — (PaymentDirectionId, TransModeId, Amount, PaymentDate, Notes)

### ViewModels (`Services/ViewModel/`)

- [ ] Create `PaymentViewModel.cs`:
  - `PaymentCreateViewModel`
  - `PaymentUpdateViewModel`

### Validation (`Validation/`)

- [ ] Create `PaymentValidation.cs`:
  - `PaymentCreateViewModelValidation` — PartyClientId > 0, Amount > 0, PaymentDirectionId > 0, TransModeId > 0, PaymentDate required

### Service Layer (`Services/`)

- [ ] Create `IPaymentService` interface with:
  - `Task<Response<PaymentDto>> CreateAsync(CreatePaymentDto model)`
  - `Task<Response<PaymentDto>> GetByIdAsync(int id)`
  - `Task<Response<List<PaymentDto>>> GetAllAsync()`
  - `Task<Response<List<PaymentDto>>> GetAllByClientIdAsync(int clientId)`
  - `Task<Response<PagedList<PaymentDto>>> GetAllPaginatedAsync(int page, int pageSize)`
  - `Task<Response<PaymentDto>> UpdateByIdAsync(int id, UpdatePaymentDto model)`
  - `Task<Response> DeleteByIdAsync(int id)`
- [ ] Create `PaymentService` implementing `IPaymentService`
- [ ] Register as Scoped in `Program.cs`

### PDF Config (`Models/PdfConfig.cs`)

- [ ] Add `Payment` config to `EntityPdfConfigs` (columns: Id, PartyClientId, Amount, PaymentDirectionId, TransModeId, PaymentDate, Notes)

### Controller (`Controllers/PaymentController.cs`)

- [ ] `POST /api/Payment` — record payment (AdminOrStaff)
- [ ] `GET /api/Payment` — all payments paginated (AdminOnly)
- [ ] `GET /api/Payment/{id}` — get by ID (Authenticated)
- [ ] `GET /api/Payment/by-client/{clientId}` — payments for a client (Authenticated)
- [ ] `GET /api/Payment/filtered` — filter by clientId, directionId, transModeId, dateFrom, dateTo (Authenticated)
- [ ] `PUT /api/Payment/{id}` — update payment (AdminOrStaff)
- [ ] `DELETE /api/Payment/{id}` — delete (AdminOnly)
- [ ] `GET /api/Payment/pdf` — PDF export (AdminOrStaff)

## Business Logic Notes

- `Payment.PartyClientId` links to `Client` — can be Customer or Supplier depending on direction
- `PaymentDirection`: Received (1) = money coming in from customer; Paid (2) = money going out to supplier
- No `OrderId` on `Payment` entity — payments are linked at client level, not order level
- `TransMode` (Cash/Bank/Credit) is shared across Payment, Transaction, Expense
