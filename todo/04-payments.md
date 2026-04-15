# Payments API

**Epic:** 6 — Staff can record payments
**Status:** ✅ Complete

## What Was Built

### New Entities
- `PaymentAllocation` — join table linking a Payment to one or more Orders/Purchases with an allocated amount
- `Payment` — extended with `UserId`, `IsReversed`, `ReversedByPaymentId`, `OriginalPaymentId`, `TransactionId`

### Migrations Applied
1. `AddPaymentAllocationTable` — creates `payment_allocations` table
2. `AddFieldsToPayment` — adds reversal chain + user + transaction FK fields to `payments`
3. `UpdateVClientBalanceView` — redesigns `v_client_balance` to read from payments table for accurate outstanding balances

### Models / DTOs (`Models/PaymentDto.cs`)
- `PaymentAllocationDto` — (Id, PaymentId, OrderId, PurchaseId, AllocatedAmount)
- `PaymentDto` — (Id, PartyClientId, PartyClientName, PaymentDirectionId, PaymentDirectionName, TransModeId, TransModeName, Amount, PaymentDate, Notes, CreatedAt, RecordedByName, IsReversed, IsCashSettled, Allocations)
- `AllocationItemDto` — (OrderId, PurchaseId, AllocatedAmount)
- `CreatePaymentDto` — (PartyClientId, PaymentDirectionId, TransModeId, Amount, PaymentDate, Notes, Allocations)
- `UpdatePaymentDto` — (TransModeId, PaymentDate, Notes) — amount and client are immutable after creation
- `ReverseAndCorrectPaymentDto` — (CorrectClientId, Notes)
- `UnallocatedCreditDto` — (ClientId, ClientName, UnallocatedAmount)

### ViewModels (`Services/ViewModel/PaymentViewModel.cs`)
- `AllocationItemViewModel`, `PaymentCreateViewModel`, `PaymentUpdateViewModel`, `ReverseAndCorrectViewModel`

### Validation (`Validation/PaymentValidation.cs`)
- `PaymentCreateViewModelValidation` — PartyClientId > 0, Amount > 0, DirectionId > 0, TransModeId > 0, PaymentDate required, Allocations sum ≤ Amount
- `PaymentUpdateViewModelValidation` — TransModeId > 0, PaymentDate required
- `ReverseAndCorrectViewModelValidation` — CorrectClientId > 0

### Service Layer (`Services/PaymentService.cs`)
- `CreateAsync` — records payment, posts ledger Transaction, auto-FIFO allocates or validates manual allocations
- `GetByIdAsync`, `GetAllPaginatedAsync`, `GetAllByUserIdAsync`, `GetAllByClientIdAsync`, `GetFilteredAsync`
- `GetUnallocatedCreditAsync` — returns unallocated balance for a client
- `UpdateByIdAsync` — updates date, notes, TransMode only
- `ReverseAsync` — creates reversing Transaction, marks original IsReversed=true, removes allocations
- `ReverseAndCorrectAsync` — atomic reverse + re-create for correct client (wrong-client correction flow)
- `DeleteByIdAsync` — hard delete with allocation and transaction cleanup

### PDF Config
- `EntityPdfConfigs.Payment` — columns: Id, Client, Direction, Mode, Amount, Date, Notes, Reversed

### Controller (`Controllers/PaymentController.cs`) — 12 endpoints
- `POST /api/Payment` — record payment with optional allocations (AdminOrStaff)
- `GET /api/Payment` — all payments paginated (AdminOnly)
- `GET /api/Payment/me` — payments by current user
- `GET /api/Payment/{id}` — get by ID
- `GET /api/Payment/by-client/{clientId}` — all payments for a client
- `GET /api/Payment/filtered` — filter by clientId, directionId, modeId, dateFrom, dateTo, includeReversed
- `GET /api/Payment/unallocated/{clientId}` — unallocated credit balance
- `PUT /api/Payment/{id}` — update date/notes/mode (AdminOrStaff)
- `POST /api/Payment/{id}/reverse` — reverse a payment (AdminOnly)
- `POST /api/Payment/{id}/reverse-and-correct` — reverse + re-create for correct client (AdminOnly)
- `DELETE /api/Payment/{id}` — hard delete (AdminOnly)
- `GET /api/Payment/pdf` — PDF export (AdminOrStaff)

## Key Business Rules Implemented

- **FIFO auto-allocation:** If `Allocations` is empty (or contains only empty items), system greedily fills oldest **Delivered** orders/purchases first. Pending/InProgress documents are excluded — only delivered goods can be paid.
- **Empty allocation stripping:** Allocation items missing both `OrderId` and `PurchaseId` are silently stripped before FIFO check — sending `[{}]` is treated the same as `[]`.
- **Manual allocation validation:** Each allocation's `AllocatedAmount` cannot exceed the order/purchase outstanding balance. Document must be Delivered (not just non-Cancelled).
- **Advance payment handling:** If payment is recorded before delivery, it sits as unallocated credit. When `OrderService`/`PurchaseService` marks a document as Delivered, `ApplyUnallocatedCreditAsync` fires automatically to apply any existing unallocated credit (oldest payment first).
- **Ledger posting by direction:**
  - Direction=Received (customer pays) → `TransCategoryId=5 (Cash In)`, `TransTypeId=2 (Credit)`
  - Direction=Paid (supplier payment) → `TransCategoryId=6 (Cash Out)`, `TransTypeId=1 (Debit)`
  - Direction=Adjustment → `TransCategoryId=5`, `TransTypeId=2`
- **Reversal:** Reversed payments excluded from `v_client_balance` via `is_reversed = 0` filter
- **Cross-cutting fix:** `OrderDto` and `PurchaseDto` now include `AmountPaid`, `Outstanding`, `PaymentStatus` computed from allocation totals
- **Client deletion guard:** Cannot delete a client with payment history — deactivate instead
- **`IOrderService` and `IPurchaseService`** now inject `IPaymentService` to call `ApplyUnallocatedCreditAsync` on Delivered transition
