# Payments Sprint — API & Service Outline

## IPaymentService Interface

| Method | Description |
|---|---|
| `CreateAsync(CreatePaymentDto, userId)` | Record payment, auto-FIFO or manual allocate, post ledger |
| `GetByIdAsync(id)` | Get payment with allocations |
| `GetAllPaginatedAsync(page, pageSize, includeReversed)` | Admin paginated list |
| `GetAllByUserIdAsync(userId, page, pageSize)` | Payments recorded by current user |
| `GetAllByClientIdAsync(clientId)` | All payments for a client |
| `GetFilteredAsync(clientId, directionId, modeId, dateFrom, dateTo, includeReversed)` | Filtered list |
| `GetUnallocatedCreditAsync(clientId)` | Unallocated balance for a client |
| `UpdateByIdAsync(id, UpdatePaymentDto)` | Update date/notes/mode only — amount and client are immutable |
| `ReverseAsync(id, notes, userId)` | Reverse payment: post mirror transaction, mark IsReversed, delete allocations |
| `ReverseAndCorrectAsync(id, ReverseAndCorrectPaymentDto, userId)` | Atomic: reverse original + create new payment for correct client |
| `DeleteByIdAsync(id)` | Hard delete with allocation + transaction cleanup |

## Controller Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/Payment` | AdminOrStaff | Create payment |
| GET | `/api/Payment` | AdminOnly | All payments paginated |
| GET | `/api/Payment/me` | Authenticated | My payments |
| GET | `/api/Payment/{id}` | Authenticated | By ID |
| GET | `/api/Payment/by-client/{clientId}` | Authenticated | By client |
| GET | `/api/Payment/filtered` | Authenticated | Filtered |
| GET | `/api/Payment/unallocated/{clientId}` | Authenticated | Unallocated credit |
| PUT | `/api/Payment/{id}` | AdminOrStaff | Update date/notes/mode |
| POST | `/api/Payment/{id}/reverse` | AdminOnly | Reverse payment |
| POST | `/api/Payment/{id}/reverse-and-correct` | AdminOnly | Reverse + re-create for correct client |
| DELETE | `/api/Payment/{id}` | AdminOnly | Hard delete |
| GET | `/api/Payment/pdf` | AdminOrStaff | PDF export |

## DTOs

- `PaymentDto` — full response including PartyClientName, direction/mode names, RecordedByName, IsReversed, IsCashSettled, Allocations list
- `CreatePaymentDto` — PartyClientId, PaymentDirectionId, TransModeId, Amount, PaymentDate, Notes, Allocations (optional)
- `UpdatePaymentDto` — TransModeId, PaymentDate, Notes (amount/client immutable)
- `ReverseAndCorrectPaymentDto` — CorrectClientId, Notes
- `UnallocatedCreditDto` — ClientId, ClientName, UnallocatedAmount
- `PaymentAllocationDto` — Id, PaymentId, OrderId, PurchaseId, AllocatedAmount
- `AllocationItemDto` — OrderId, PurchaseId, AllocatedAmount (create input)

## Validation Rules

- `Amount` > 0
- `PartyClientId` > 0, must exist
- `PaymentDirectionId` > 0
- `TransModeId` > 0
- `PaymentDate` required
- Per allocation: `AllocatedAmount` > 0, ≤ document outstanding
- Sum of manual allocations ≤ payment Amount
